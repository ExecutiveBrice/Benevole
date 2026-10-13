package com.wild.corp.service;

import com.wild.corp.model.*;
import com.wild.corp.repositories.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import static com.wild.corp.model.ConfirmationDelivery.Status.*;

@Service
@Slf4j
public class ConfirmationService {
    private final BenevoleRepository benevoles;
    private final PushSubscriptionRepository subscriptions;
    private final ConfirmationDeliveryRepository deliveries;
    private final WebPushService push;
    private final EmailService email;
    private final ConfigService config;
    private final ObjectMapper json = new ObjectMapper();

    public ConfirmationService(BenevoleRepository benevoles, PushSubscriptionRepository subscriptions,
                               ConfirmationDeliveryRepository deliveries, WebPushService push,
                               EmailService email, ConfigService config) {
        this.benevoles = benevoles;
        this.subscriptions = subscriptions;
        this.deliveries = deliveries;
        this.push = push;
        this.email = email;
        this.config = config;
    }

    /** Transaction séparée par bénévole ; le verrou évite les envois concurrents. */
    @Transactional
    public void confirm(Integer benevoleId) {
        Benevole benevole = benevoles.findForConfirmation(benevoleId).orElse(null);

        boolean pending = false;
        if (Boolean.TRUE.equals(benevole.getEvenement().getNotification())) {
            var devices = subscriptions.findByBenevoleId(benevoleId);

            if (devices.isEmpty()){
                log.info("devices.isEmpty()");
                delivery(benevole, "push:none").setStatus(SKIPPED);
            }
            for (PushSubscription subscription : devices) {
                ConfirmationDelivery delivery = delivery(benevole, "push:" + subscription.getId());
                if (ready(delivery)) {
                    log.info("ready(delivery)");
                    if (!subscription.getAccess().getExpiresAt().isAfter(Instant.now())) {
                        log.info("!subscription.getAccess().getExpiresAt().isAfter(Instant.now())");
                        delivery.setStatus(EXPIRED);
                        subscriptions.delete(subscription);
                    } else if (push.isConfigured()) {
                        log.info("push.isConfigured()");
                        attemptPush(benevole, subscription, delivery);
                    }
                    log.info(" Sans configuration");
                    // Sans configuration, conserver l'envoi en attente sans épuiser les reprises.
                }
                log.info("not ready {}", ready(delivery));
                pending |= delivery.getStatus() == PENDING;
            }
        }else {
            log.info("benevole.getEvenement().getNotification() {}", benevole.getEvenement().getNotification());
        }
        if (Boolean.TRUE.equals(benevole.getEvenement().getCopie())) {
            ConfirmationDelivery delivery = delivery(benevole, "organizer");
            if (ready(delivery)) {
                log.info("ready(delivery)");
                String recipient = benevole.getEvenement().getContactEmail();
                if (recipient == null || recipient.isBlank()) {
                    log.info("recipient null");
                    delivery.setStatus(SKIPPED);
                } else {
                    log.info("recipient");
                    delivery.setAttempts(delivery.getAttempts() + 1);
                    boolean accepted = email.sendSingleMessage(List.of(recipient), organizerBody(benevole),
                            "Participation enregistrée : " + benevole.getEvenement().getEventName(), benevole.getPrenom(), benevole.getNom());
                    if (accepted) finishAttempt(delivery, 202);
                    else finishFailure(delivery, "EMAIL_NOT_ACCEPTED", true);
                }
            }
            pending |= delivery.getStatus() == PENDING;
        }else {
            log.info("Boolean.TRUE.equals(benevole.getEvenement().getCopie()) {}", benevole.getEvenement().getCopie());
        }
        // Compatibilité : ce drapeau signifie que le changement a été traité,
        // pas que la notification a été affichée ou lue.
        benevole.setAdviseSent(!pending);
    }

    private ConfirmationDelivery delivery(Benevole benevole, String recipient) {
        return deliveries.findByBenevoleIdAndRevisionAndRecipient(benevole.getId(), benevole.getDateMaj(), recipient)
                .orElseGet(() -> {
                    ConfirmationDelivery created = new ConfirmationDelivery();
                    created.setBenevole(benevole);
                    created.setRevision(benevole.getDateMaj());
                    created.setRecipient(recipient);
                    return deliveries.save(created);
                });
    }

    private boolean ready(ConfirmationDelivery delivery) {
        return delivery.getStatus() == PENDING && (delivery.getNextAttemptAt() == null
                || !delivery.getNextAttemptAt().isAfter(Instant.now()));
    }

    private void attemptPush(Benevole benevole, PushSubscription subscription, ConfirmationDelivery delivery) {
        delivery.setAttempts(delivery.getAttempts() + 1);
        log.info("delivery.getAttempts() {}", delivery.getAttempts());
        try {
            String payload = json.writeValueAsString(Map.of(
                    "title", "Participation enregistrée",
                    "body", "Vos choix pour « " + truncate(benevole.getEvenement().getEventName(), 120)
                            + " » ont bien été pris en compte. Consultez votre planning.",
                    "url", config.getEventUrl(benevole.getEvenement().getId()),
                    "tag", "confirmation-" + benevole.getId()));
            log.info("payload {}", payload);
            int code = push.send(subscription, payload);
            finishAttempt(delivery, code);
            if (code == 404 || code == 410) subscriptions.delete(subscription);
        } catch (InterruptedException interrupted) {
            log.error("interrupted {}", interrupted.getMessage());
            Thread.currentThread().interrupt();
            finishFailure(delivery, "INTERRUPTED", true);
        } catch (Exception exception) {
            log.error("exception {}", exception.getMessage());
            // Un nom de classe décrit la cause sans exposer endpoint, clés ou message sensible.
            Throwable cause = exception;
            for (int depth = 0; depth < 8 && cause.getCause() != null && cause.getCause() != cause; depth++) cause = cause.getCause();
            boolean retryable = exception instanceof java.io.IOException;
            finishFailure(delivery, "PUSH_EXCEPTION:" + exception.getClass().getSimpleName()
                    + (cause == exception ? "" : ":" + cause.getClass().getSimpleName()), retryable);
        }
    }

    static void finishAttempt(ConfirmationDelivery delivery, int code) {
        delivery.setResponseCode(code);
        delivery.setLastError(code >= 200 && code < 300 ? null : "HTTP_" + code);
        if (code >= 200 && code < 300) delivery.setStatus(ACCEPTED);
        else if (code == 404 || code == 410) delivery.setStatus(EXPIRED);
        else if ((code >= 400 && code < 500 && code != 408 && code != 429) || delivery.getAttempts() >= 3) {
            delivery.setStatus(FAILED);
        } else delivery.setNextAttemptAt(Instant.now().plusSeconds(delivery.getAttempts() == 1 ? 60 : 300));
        if (delivery.getStatus() == FAILED || delivery.getStatus() == PENDING) logFailure(delivery);
    }

    private static void finishFailure(ConfirmationDelivery delivery, String error, boolean retryable) {
        delivery.setResponseCode(null); // Aucune réponse HTTP reçue : ne pas inventer un 503.
        delivery.setLastError(error);
        if (!retryable || delivery.getAttempts() >= 3) delivery.setStatus(FAILED);
        else delivery.setNextAttemptAt(Instant.now().plusSeconds(delivery.getAttempts() == 1 ? 60 : 300));
        logFailure(delivery);
    }

    private static void logFailure(ConfirmationDelivery delivery) {
        log.warn("Confirmation non envoyée : livraison {}, canal {}, HTTP {}, cause {}, état {}, tentative {}/3",
                delivery.getId(), delivery.getRecipient().startsWith("push:") ? "push" : "email-organisateur",
                delivery.getResponseCode(), delivery.getLastError(), delivery.getStatus(), delivery.getAttempts());
    }

    private String organizerBody(Benevole benevole) {
        Evenement event = benevole.getEvenement();
        StringBuilder body = new StringBuilder("<p>Copie organisateur — Participation de ")
                .append(escape(benevole.getPrenom())).append(" ").append(escape(benevole.getNom())).append("</p>")
                .append(event.getValidation() == null ? "" : event.getValidation()).append("<ul>");
        benevole.getCroisements().stream().filter(c -> !Integer.valueOf(4).equals(c.getStand().getType())).forEach(c ->
                body.append("<li>").append(escape("tous".equals(c.getStand().getNom()) ? "N’importe quel stand" : c.getStand().getNom()))
                        .append(" — ").append(escape(c.getCreneau().getPlage())).append("</li>"));
        body.append("</ul>").append(event.getSignature() == null ? "" : event.getSignature());
        body.append("<p><a href=\"").append(escape(config.getEventUrl(event.getId()))).append("\">Consulter l’événement</a></p>");
        return body.toString();
    }

    private static String escape(String value) { return HtmlUtils.htmlEscape(value == null ? "" : value); }
    private static String truncate(String value, int max) { return value == null ? "l’événement" : value.substring(0, Math.min(value.length(), max)); }
}

package com.wild.corp.service;

import com.wild.corp.model.*;
import com.wild.corp.repositories.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
@Transactional
public class NotificationService {
    private final NotificationAccessRepository accesses;
    private final PushSubscriptionRepository subscriptions;
    private final BenevoleRepository benevoles;
    private final WebPushService webPush;
    private final ConfigService config;
    private final SecureRandom random = new SecureRandom();

    public NotificationService(NotificationAccessRepository accesses, PushSubscriptionRepository subscriptions,
                               BenevoleRepository benevoles, WebPushService webPush, ConfigService config) {
        this.accesses = accesses;
        this.subscriptions = subscriptions;
        this.benevoles = benevoles;
        this.webPush = webPush;
        this.config = config;
    }

    public String createAccess(Benevole benevole, boolean invitation) {
        byte[] secret = new byte[32];
        random.nextBytes(secret);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(secret);
        NotificationAccess access = new NotificationAccess();
        access.setBenevole(benevole);
        access.setTokenHash(hash(token));
        access.setInvitation(invitation);
        access.setExpiresAt(Instant.now().plus(invitation ? 7 : 365, ChronoUnit.DAYS));
        accesses.save(access);
        return token;
    }

    public String invitation(Benevole benevole) {
        return config.getEventUrl(benevole.getEvenement().getId()) + "#notifications=" + createAccess(benevole, true);
    }

    public record Identity(Benevole benevole, Integer eventId, String token) {}

    public Identity identify(String token) {
        NotificationAccess access = authorize(token, true);
        Benevole benevole = access.getBenevole();
        if (access.isInvitation()) {
            // Consommation unique du lien et création d'un accès propre à l'appareil.
            accesses.delete(access);
            token = createAccess(benevole, false);
        }
        return new Identity(benevole, benevole.getEvenement().getId(), token);
    }

    public record Keys(String p256dh, String auth) {}
    public record SubscriptionRequest(String endpoint, Keys keys) {}

    public void subscribe(String token, SubscriptionRequest request) {
        NotificationAccess access = authorize(token, false);
        if (!webPush.isConfigured()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Notifications non configurées");
        validateSubscription(request);
        Benevole benevole = benevoles.findForConfirmation(access.getBenevole().getId()).orElseThrow();
        String endpointHash = hash(request.endpoint());
        PushSubscription subscription = subscriptions.findByBenevoleIdAndEndpointHash(benevole.getId(), endpointHash)
                .orElseGet(PushSubscription::new);
        subscription.setBenevole(benevole);
        subscription.setAccess(access);
        subscription.setEndpoint(request.endpoint());
        subscription.setEndpointHash(endpointHash);
        subscription.setP256dh(request.keys().p256dh());
        subscription.setAuth(request.keys().auth());
        subscriptions.save(subscription);
        // Un nouvel appareil reçoit aussi la confirmation de la sélection courante.
        if (benevole.getDateMaj() != null) benevole.setAdviseSent(false);
    }

    public boolean status(String token, String endpoint) {
        NotificationAccess access = authorize(token, false);
        validateEndpoint(endpoint);
        return subscriptions.findByBenevoleIdAndEndpointHash(access.getBenevole().getId(), hash(endpoint))
                .filter(subscription -> subscription.getAccess().getId().equals(access.getId())).isPresent();
    }

    public void unsubscribe(String token, String endpoint) {
        NotificationAccess access = authorize(token, false);
        validateEndpoint(endpoint);
        subscriptions.findByBenevoleIdAndEndpointHash(access.getBenevole().getId(), hash(endpoint))
                .filter(subscription -> subscription.getAccess().getId().equals(access.getId()))
                .ifPresent(subscriptions::delete);
    }

    private NotificationAccess authorize(String token, boolean allowInvitation) {
        if (token == null || !token.matches("[A-Za-z0-9_-]{43}")) throw unauthorized();
        return accesses.findByTokenHash(hash(token))
                .filter(access -> access.getExpiresAt().isAfter(Instant.now()))
                .filter(access -> allowInvitation || !access.isInvitation())
                .orElseThrow(NotificationService::unauthorized);
    }

    public static void validateSubscription(SubscriptionRequest request) {
        if (request == null || request.keys() == null) throw badRequest();
        validateEndpoint(request.endpoint());
        try {
            if (request.keys().p256dh() == null || request.keys().auth() == null
                    || request.keys().p256dh().length() > 128 || request.keys().auth().length() > 64) throw badRequest();
            byte[] key = Base64.getUrlDecoder().decode(request.keys().p256dh());
            byte[] auth = Base64.getUrlDecoder().decode(request.keys().auth());
            if (key.length != 65 || key[0] != 4 || auth.length != 16) throw badRequest();
            // Vérifier aussi que la clé publique appartient à la courbe P-256.
            nl.martijndwars.webpush.Utils.loadPublicKey(request.keys().p256dh());
        } catch (Exception exception) {
            throw badRequest();
        }
    }

    public static void validateEndpoint(String endpoint) {
        try {
            if (endpoint == null || endpoint.length() > 2048) throw badRequest();
            URI uri = URI.create(endpoint);
            String host = uri.getHost();
            boolean allowed = "fcm.googleapis.com".equals(host) || "web.push.apple.com".equals(host)
                    || "updates.push.services.mozilla.com".equals(host)
                    || (host != null && host.endsWith(".push.services.mozilla.com"));
            if (!allowed || !"https".equals(uri.getScheme()) || uri.getUserInfo() != null
                    || (uri.getPort() != -1 && uri.getPort() != 443) || uri.getFragment() != null) throw badRequest();
        } catch (IllegalArgumentException exception) {
            throw badRequest();
        }
    }

    public static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) { throw new IllegalStateException(exception); }
    }
    private static ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Accès personnel requis ou expiré");
    }
    private static ResponseStatusException badRequest() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Abonnement Push invalide");
    }
}

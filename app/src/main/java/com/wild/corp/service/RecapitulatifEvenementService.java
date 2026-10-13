package com.wild.corp.service;

import com.wild.corp.model.*;
import com.wild.corp.repositories.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
@Slf4j
public class RecapitulatifEvenementService {
    static final ZoneId PARIS = ZoneId.of("Europe/Paris");
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_HEURE = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(PARIS);
    private final EvenementRepository evenements;
    private final MouvementBenevoleRepository mouvements;
    private final CroisementRepository croisements;
    private final BenevoleRepository benevoles;
    private final EmailService email;
    private final ConfigService config;

    public RecapitulatifEvenementService(EvenementRepository evenements, MouvementBenevoleRepository mouvements,
                                        CroisementRepository croisements, BenevoleRepository benevoles,
                                        EmailService email, ConfigService config) {
        this.evenements = evenements;
        this.mouvements = mouvements;
        this.croisements = croisements;
        this.benevoles = benevoles;
        this.email = email;
        this.config = config;
    }

    /** Dernière borne de 1 h : indépendante de l'heure du serveur et du changement d'heure. */
    static Instant finPeriode(Instant maintenant) {
        ZonedDateTime paris = maintenant.atZone(PARIS);
        ZonedDateTime fin = paris.toLocalDate().atTime(1, 0).atZone(PARIS);
        if (paris.isBefore(fin)) fin = paris.toLocalDate().minusDays(1).atTime(1, 0).atZone(PARIS);
        return fin.toInstant();
    }

    public List<Integer> evenementsAEnvoyer(Instant fin) {
        return mouvements.findEvenementsARecapituler(fin);
    }

    /** Verrou par évènement ; un échec conserve les mouvements pour le prochain envoi. */
    @Transactional
    public void envoyer(Integer evenementId, Instant fin) {
        log.info("Envoyer de evenement id {} ", evenementId);
        Evenement evenement = evenements.findForRecapitulatif(evenementId).orElse(null);
        if (evenement == null || !Boolean.TRUE.equals(evenement.getRecapitulatifQuotidien())) return;
        List<MouvementBenevole> changements = mouvements
                .findByEvenementIdAndEnvoyeLeIsNullAndSurvenuLeBeforeOrderBySurvenuLeAscIdAsc(evenementId, fin);
        if (changements.isEmpty()) return;
        String destinataire = evenement.getContactEmail();
        if (destinataire == null || destinataire.isBlank()) {
            log.warn("Récapitulatif en attente : adresse organisateur absente pour l'évènement {}", evenementId);
            return;
        }
        String corps = construireMail(evenement, changements, croisements.findByStandEvenementId(evenementId),
                benevoles.findByEvenementId(evenementId).size(), fin);
        boolean accepte = email.sendSingleMessage(List.of(destinataire.trim()), corps,
                "Récapitulatif quotidien : " + evenement.getEventName() + " — " + DATE_HEURE.format(fin), "", "");
        if (accepte) {
            Instant envoyeLe = Instant.now();
            changements.forEach(mouvement -> mouvement.setEnvoyeLe(envoyeLe));
        } else {
            log.warn("Récapitulatif non envoyé pour l'évènement {} : les mouvements seront repris", evenementId);
        }
    }

    String construireMail(Evenement evenement, List<MouvementBenevole> changements,
                           List<Croisement> remplissages, int nombreBenevoles, Instant fin) {
        Instant debut = fin.atZone(PARIS).toLocalDate().minusDays(1).atTime(1, 0).atZone(PARIS).toInstant();
        if (changements.getFirst().getSurvenuLe().isBefore(debut)) debut = changements.getFirst().getSurvenuLe();
        StringBuilder corps = new StringBuilder("<h1>Récapitulatif quotidien — ")
                .append(escape(evenement.getEventName())).append("</h1><p>Mouvements du ")
                .append(DATE_HEURE.format(debut)).append(" au ").append(DATE_HEURE.format(fin))
                .append(" (heure de Paris). Les mouvements restés en attente sont inclus.</p><h2>Informations de l’évènement</h2><ul>");
        information(corps, "Date", evenement.getDateEvenement() == null ? null : DATE.format(evenement.getDateEvenement()));
        information(corps, "Adresse", evenement.getAdresse());
        information(corps, "Début / arrivée", evenement.getIndicationsDebut());
        information(corps, "Fin / départ", evenement.getIndicationsFin());
        information(corps, "Ouverture des inscriptions", evenement.getStartDate() == null ? null : DATE_HEURE.format(evenement.getStartDate().toInstant()));
        information(corps, "Fin des inscriptions", evenement.getEndDate() == null ? null : DATE_HEURE.format(evenement.getEndDate().toInstant()));
        information(corps, "Contact", evenement.getContact());
        information(corps, "E-mail", evenement.getContactEmail());
        information(corps, "Téléphone", evenement.getContactTel());
        information(corps, "Site", evenement.getSitepersourl());
        corps.append("</ul><p>").append(nombreBenevoles).append(" bénévoles enregistrés sur l’évènement.</p>")
                .append("<h2>Remplissage actuel des stands</h2>")
                .append("<table border='1' cellpadding='6' cellspacing='0'><thead><tr><th>Stand</th><th>Créneau</th>")
                .append("<th>Inscrits</th><th>Places prévues</th><th>Places restantes</th><th>Remplissage</th></tr></thead><tbody>");
        int totalInscrits = 0;
        int totalPlaces = 0;
        List<Croisement> tries = remplissages.stream()
                .filter(c -> !Integer.valueOf(4).equals(c.getStand().getType()))
                .sorted(Comparator.comparing((Croisement c) -> c.getStand().getOrdre(), Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(c -> c.getStand().getId(), Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(c -> c.getCreneau().getOrdre(), Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(Croisement::getId, Comparator.nullsLast(Integer::compareTo))).toList();
        for (Croisement croisement : tries) {
            int inscrits = croisement.getBenevoles().size();
            int places = Math.max(0, croisement.getLimite());
            totalInscrits += inscrits;
            totalPlaces += places;
            corps.append("<tr><td>").append(escape(nomStand(croisement.getStand().getNom())))
                    .append("</td><td>").append(escape(croisement.getCreneau().getPlage()))
                    .append("</td><td>").append(inscrits).append("</td><td>").append(places)
                    .append("</td><td>").append(Math.max(0, places - inscrits)).append("</td><td>")
                    .append(places == 0 ? "—" : Math.round(100.0 * inscrits / places) + " %")
                    .append(inscrits > places ? " (surcapacité)" : "").append("</td></tr>");
        }
        corps.append("</tbody></table><p>Total : ").append(totalInscrits).append(" affectations pour ")
                .append(totalPlaces).append(" places prévues (un bénévole peut avoir plusieurs affectations).</p>")
                .append("<h2>Mouvements depuis la veille</h2><p>");
        for (MouvementBenevole.Type type : MouvementBenevole.Type.values()) {
            corps.append(libelle(type)).append(" : ")
                    .append(changements.stream().filter(m -> m.getType() == type).count()).append(". ");
        }
        corps.append("</p><table border='1' cellpadding='6' cellspacing='0'><thead><tr><th>Date / heure</th>")
                .append("<th>Mouvement</th><th>Bénévole</th><th>Contact</th><th>Stand</th><th>Créneau</th></tr></thead><tbody>");
        for (MouvementBenevole mouvement : changements) {
            corps.append("<tr><td>").append(DATE_HEURE.format(mouvement.getSurvenuLe()))
                    .append("</td><td>").append(libelle(mouvement.getType())).append("</td><td>")
                    .append(escape(mouvement.getPrenom())).append(" ").append(escape(mouvement.getNom()))
                    .append("</td><td>").append(escape(mouvement.getEmail())).append("<br>").append(escape(mouvement.getTelephone()))
                    .append("</td><td>").append(escape(nomStand(mouvement.getStand()))).append("</td><td>")
                    .append(escape(mouvement.getCreneau())).append("</td></tr>");
        }
        return corps.append("</tbody></table><p><a href=\"").append(escape(config.getEventUrl(evenement.getId())))
                .append("\">Consulter l’évènement</a></p>").toString();
    }

    private static void information(StringBuilder corps, String titre, String valeur) {
        if (valeur != null && !valeur.isBlank()) corps.append("<li><strong>").append(titre).append(" :</strong> ")
                .append(escape(valeur).replace("\n", "<br>")).append("</li>");
    }

    private static String nomStand(String nom) { return "tous".equals(nom) ? "N’importe quel stand" : nom; }
    private static String escape(String valeur) { return HtmlUtils.htmlEscape(valeur == null ? "" : valeur, "UTF-8"); }
    private static String libelle(MouvementBenevole.Type type) {
        return switch (type) {
            case CREATION -> "Nouveau bénévole";
            case INSCRIPTION -> "Inscription";
            case DESINSCRIPTION -> "Désinscription";
            case SUPPRESSION -> "Suppression du bénévole";
        };
    }
}

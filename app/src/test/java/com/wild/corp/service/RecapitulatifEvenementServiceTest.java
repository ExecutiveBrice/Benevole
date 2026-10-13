package com.wild.corp.service;

import com.wild.corp.model.*;
import com.wild.corp.repositories.*;
import org.junit.jupiter.api.Test;

import java.time.*;
import java.util.*;

import static com.wild.corp.service.ConfirmationServiceTest.inject;
import static com.wild.corp.service.ConfirmationServiceTest.stub;
import static org.junit.jupiter.api.Assertions.*;

class RecapitulatifEvenementServiceTest {
    static final Instant FIN = Instant.parse("2026-10-12T23:00:00Z");

    static class Fixture {
        final Evenement evenement = new Evenement();
        final Benevole benevole = new Benevole();
        final Croisement croisement = new Croisement();
        final List<MouvementBenevole> journal = new ArrayList<>();
        final List<String> emails = new ArrayList<>();
        final List<List<String>> destinataires = new ArrayList<>();
        boolean accepte = true;
        final MouvementBenevoleService mouvements;
        final RecapitulatifEvenementService recap;
        final BenevoleService inscriptions = new BenevoleService();

        Fixture() {
            evenement.setId(7); evenement.setEventName("Festival <été>");
            evenement.setContactEmail("organisateur@example.test"); evenement.setCopie(false);
            evenement.setRecapitulatifQuotidien(true);
            evenement.setDateEvenement(LocalDate.of(2026, 10, 24)); evenement.setAdresse("12 rue des Fleurs");
            evenement.setIndicationsDebut("Accueil à 8 h"); evenement.setIndicationsFin("Rangement à 20 h");
            evenement.setContact("Camille"); evenement.setContactTel("0102030405");
            benevole.setId(1); benevole.setEvenement(evenement); benevole.setPrenom("Alice <test>");
            benevole.setNom("Martin"); benevole.setEmail("alice@example.test"); benevole.setTelephone("0600000000");
            benevole.setCroisements(new ArrayList<>());
            Stand stand = new Stand(); stand.setId(2); stand.setNom("Buvette & accueil"); stand.setType(2); stand.setOrdre(1);
            Creneau creneau = new Creneau(); creneau.setPlage("10 h – 12 h"); creneau.setOrdre(1);
            croisement.setId(42); croisement.setStand(stand); croisement.setCreneau(creneau); croisement.setLimite(3);
            croisement.setBenevoles(new ArrayList<>(List.of(benevole)));
            MouvementBenevoleRepository repository = stub(MouvementBenevoleRepository.class, (method, args) -> {
                if (method.equals("save")) {
                    MouvementBenevole mouvement = (MouvementBenevole) args[0];
                    mouvement.setId((long) journal.size() + 1); journal.add(mouvement); return mouvement;
                }
                if (method.equals("findEvenementsARecapituler")) {
                    return Boolean.TRUE.equals(evenement.getRecapitulatifQuotidien())
                            && journal.stream().anyMatch(m -> m.getEnvoyeLe() == null && m.getSurvenuLe().isBefore((Instant) args[0]))
                            ? List.of(7) : List.of();
                }
                if (method.equals("findByEvenementIdAndEnvoyeLeIsNullAndSurvenuLeBeforeOrderBySurvenuLeAscIdAsc")) {
                    return journal.stream().filter(m -> m.getEnvoyeLe() == null && m.getSurvenuLe().isBefore((Instant) args[1]))
                            .sorted(Comparator.comparing(MouvementBenevole::getSurvenuLe).thenComparing(MouvementBenevole::getId)).toList();
                }
                throw new UnsupportedOperationException(method);
            });
            mouvements = new MouvementBenevoleService(repository);
            EvenementRepository events = stub(EvenementRepository.class, (method, args) -> Optional.of(evenement));
            CroisementRepository slots = stub(CroisementRepository.class, (method, args) -> List.of(croisement));
            BenevoleRepository volunteers = stub(BenevoleRepository.class, (method, args) -> switch (method) {
                case "findByEvenementId" -> List.of(benevole);
                case "findForConfirmation" -> Optional.of(benevole);
                case "save" -> args[0];
                case "delete" -> null;
                default -> throw new UnsupportedOperationException(method);
            });
            EmailService email = new EmailService() {
                @Override public boolean sendSingleMessage(List<String> to, String body, String subject, String first, String last) {
                    emails.add(body); destinataires.add(to); assertTrue(subject.contains("Récapitulatif quotidien")); return accepte;
                }
            };
            ConfigService config = new ConfigService() {
                @Override public String getEventUrl(Integer id) { return "https://benevoles.example.test/" + id; }
            };
            recap = new RecapitulatifEvenementService(events, repository, slots, volunteers, email, config);
            inject(inscriptions, "benevoleRepository", volunteers); inject(inscriptions, "mouvementBenevoleService", mouvements);
            inject(inscriptions, "croisementService", new CroisementService() {
                @Override public Croisement findById(Integer id) { return croisement; }
            });
        }

        void mouvement(MouvementBenevole.Type type, Instant quand) {
            mouvements.enregistrer(benevole, type, croisement); journal.getLast().setSurvenuLe(quand);
        }
    }

    @Test void optionDesactiveeOuAbsenteEmpecheLEnvoiMemeAvecDesMouvements() {
        assertFalse(new Evenement().getRecapitulatifQuotidien());
        Fixture f = new Fixture(); f.mouvement(MouvementBenevole.Type.INSCRIPTION, FIN.minusSeconds(1));
        f.evenement.setRecapitulatifQuotidien(false);
        assertTrue(f.recap.evenementsAEnvoyer(FIN).isEmpty()); f.recap.envoyer(7, FIN);
        f.evenement.setRecapitulatifQuotidien(null);
        assertTrue(f.recap.evenementsAEnvoyer(FIN).isEmpty()); f.recap.envoyer(7, FIN);
        assertTrue(f.emails.isEmpty()); assertNull(f.journal.getFirst().getEnvoyeLe());
        f.evenement.setRecapitulatifQuotidien(true); f.recap.envoyer(7, FIN);
        assertEquals(1, f.emails.size());
    }

    @Test void aucunMailSansMouvementEtPasDeDoublonApresEnvoi() {
        Fixture f = new Fixture();
        assertTrue(f.recap.evenementsAEnvoyer(FIN).isEmpty()); f.recap.envoyer(7, FIN); assertTrue(f.emails.isEmpty());
        f.mouvement(MouvementBenevole.Type.INSCRIPTION, FIN.minusSeconds(1));
        f.mouvement(MouvementBenevole.Type.DESINSCRIPTION, FIN); // borne exclue, prochain récapitulatif
        assertEquals(List.of(7), f.recap.evenementsAEnvoyer(FIN));
        f.recap.envoyer(7, FIN); f.recap.envoyer(7, FIN);
        assertEquals(1, f.emails.size()); assertNotNull(f.journal.getFirst().getEnvoyeLe());
        assertNull(f.journal.getLast().getEnvoyeLe()); assertTrue(f.recap.evenementsAEnvoyer(FIN).isEmpty());
        f.recap.envoyer(7, FIN.plusSeconds(86400)); assertEquals(2, f.emails.size());
        assertEquals(List.of("organisateur@example.test"), f.destinataires.getFirst());
    }

    @Test void mailContientInformationsRemplissageEtMouvementsEchappes() {
        Fixture f = new Fixture(); f.mouvement(MouvementBenevole.Type.INSCRIPTION, FIN.minusSeconds(3600));
        f.mouvement(MouvementBenevole.Type.DESINSCRIPTION, FIN.minusSeconds(1800)); f.recap.envoyer(7, FIN);
        String body = f.emails.getFirst();
        for (String information : List.of("Festival &lt;été&gt;", "24/10/2026", "12 rue des Fleurs", "Accueil à 8 h",
                "Rangement à 20 h", "Camille", "0102030405", "Buvette &amp; accueil", "10 h – 12 h", "33 %",
                "<td>1</td><td>3</td><td>2</td>", "Inscription : 1", "Désinscription : 1", "Alice &lt;test&gt;",
                "alice@example.test", "0600000000", "https://benevoles.example.test/7")) assertTrue(body.contains(information), information);
        assertFalse(body.contains("Alice <test>"));
    }

    @Test void echecEtAdresseAbsenteConserventLesMouvementsPourLeProchainJour() {
        Fixture f = new Fixture(); f.mouvement(MouvementBenevole.Type.INSCRIPTION, FIN.minusSeconds(172800));
        f.evenement.setContactEmail(" "); f.recap.envoyer(7, FIN); assertTrue(f.emails.isEmpty());
        f.evenement.setContactEmail("organisateur@example.test"); f.accepte = false; f.recap.envoyer(7, FIN);
        assertNull(f.journal.getFirst().getEnvoyeLe());
        f.accepte = true; f.recap.envoyer(7, FIN.plusSeconds(86400));
        assertEquals(2, f.emails.size()); assertNotNull(f.journal.getFirst().getEnvoyeLe());
        assertTrue(f.emails.getLast().contains("11/10/2026 01:00"));
    }

    @Test void inscriptionEtDesinscriptionLeMemeJourRestentToutesDeuxDansLeJournal() {
        Fixture f = new Fixture();
        f.inscriptions.addToCroisement(1, 42, false);
        assertThrows(RuntimeException.class, () -> f.inscriptions.addToCroisement(1, 42, false));
        f.inscriptions.removeToCroisement(1, 42); f.inscriptions.removeToCroisement(1, 42);
        assertEquals(List.of(MouvementBenevole.Type.INSCRIPTION, MouvementBenevole.Type.DESINSCRIPTION),
                f.journal.stream().map(MouvementBenevole::getType).toList());
        assertTrue(f.benevole.getCroisements().isEmpty());
        f.journal.forEach(m -> m.setSurvenuLe(FIN.minusSeconds(60))); f.recap.envoyer(7, FIN);
        assertTrue(f.emails.getFirst().contains("Désinscription : 1"));
    }

    @Test void suppressionConserveIdentiteEtAnciennesAffectationsEtPurgeSansMouvement() {
        Fixture f = new Fixture(); f.benevole.getCroisements().add(f.croisement);
        f.inscriptions.deleteById(1);
        assertEquals(List.of(MouvementBenevole.Type.DESINSCRIPTION, MouvementBenevole.Type.SUPPRESSION),
                f.journal.stream().map(MouvementBenevole::getType).toList());
        f.benevole.setPrenom("modifié"); assertEquals("Alice <test>", f.journal.getFirst().getPrenom());
        assertEquals("Buvette & accueil", f.journal.getFirst().getStand());
        BenevoleService purge = new BenevoleService();
        inject(purge, "benevoleRepository", stub(BenevoleRepository.class, (method, args) -> null));
        purge.deleteForReset(1); assertEquals(2, f.journal.size());
    }

    @Test void uneInscriptionRefuseeFauteDePlaceNeCreePasDeMouvement() {
        Fixture f = new Fixture(); f.croisement.setLimite(1);
        assertThrows(RuntimeException.class, () -> f.inscriptions.addToCroisement(1, 42, false));
        assertTrue(f.journal.isEmpty());
    }

    @Test void horaireParisEtChangementsDHeure() {
        assertEquals(FIN, RecapitulatifEvenementService.finPeriode(FIN.plusSeconds(30)));
        assertEquals(FIN.minusSeconds(86400), RecapitulatifEvenementService.finPeriode(FIN.minusSeconds(1)));
        Instant ete = RecapitulatifEvenementService.finPeriode(Instant.parse("2026-03-30T00:00:00Z"));
        Instant hiver = RecapitulatifEvenementService.finPeriode(Instant.parse("2026-10-26T01:00:00Z"));
        assertEquals(Instant.parse("2026-03-29T23:00:00Z"), ete);
        assertEquals(Instant.parse("2026-10-26T00:00:00Z"), hiver);
    }

    @Test void schedulerEnvoieAvantPurgeEtContinueSiUnEvenementEchoue() throws Exception {
        SchedulerService scheduler = new SchedulerService(); List<String> actions = new ArrayList<>();
        inject(scheduler, "recapitulatifEvenementService", new RecapitulatifEvenementService(null, null, null, null, null, null) {
            @Override public List<Integer> evenementsAEnvoyer(Instant fin) { return List.of(7, 8); }
            @Override public void envoyer(Integer id, Instant fin) {
                actions.add("mail:" + id); if (id == 7) throw new RuntimeException("test");
            }
        });
        inject(scheduler, "evenementService", new EvenementService() {
            @Override public List<Evenement> findAll() { actions.add("purge"); return List.of(); }
        });
        scheduler.recapitulatifEtReset(); assertEquals(List.of("mail:7", "mail:8", "purge"), actions);
        var annotation = SchedulerService.class.getMethod("recapitulatifEtReset")
                .getAnnotation(org.springframework.scheduling.annotation.Scheduled.class);
        assertEquals("0 0 1 * * *", annotation.cron()); assertEquals("Europe/Paris", annotation.zone());
    }
}

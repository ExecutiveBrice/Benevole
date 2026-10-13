package com.wild.corp.service;

import com.wild.corp.model.*;
import com.wild.corp.repositories.*;
import org.junit.jupiter.api.Test;
import java.lang.reflect.Proxy;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static com.wild.corp.model.ConfirmationDelivery.Status.*;

class ConfirmationServiceTest {
    static class Fixture {
        final Benevole benevole = new Benevole();
        final List<PushSubscription> devices = new ArrayList<>();
        final Map<String, ConfirmationDelivery> deliveries = new HashMap<>();
        final List<List<String>> emails = new ArrayList<>();
        final Map<Long, Integer> sends = new HashMap<>();
        final Map<Long, Integer> codes = new HashMap<>();
        Exception pushFailure;
        boolean emailAccepted = true;
        final ConfirmationService service;
        final SchedulerService scheduler = new SchedulerService();
        final BenevoleService selection = new BenevoleService();

        Fixture(boolean notify, boolean copy) {
            Evenement event = new Evenement();
            event.setId(7); event.setNotification(notify); event.setCopie(copy);
            event.setEventName("Festival"); event.setContactEmail("organisateur@example.test");
            benevole.setId(1); benevole.setEvenement(event); benevole.setEmail("benevole@example.test");
            benevole.setPrenom("Alice"); benevole.setNom("Test"); benevole.setCroisements(new ArrayList<>());
            benevole.setDateMaj(LocalDateTime.now(ZoneId.of("Europe/Paris")).minusMinutes(10));
            benevole.setAdviseSent(false);
            BenevoleRepository repository = stub(BenevoleRepository.class, (method, args) -> {
                if (method.equals("findForConfirmation")) return Optional.of(benevole);
                if (method.equals("findBenevolesToAdvise")) {
                    LocalDateTime cutoff = (LocalDateTime) args[0];
                    return Boolean.FALSE.equals(benevole.getAdviseSent()) && benevole.getDateMaj() != null
                            && !benevole.getDateMaj().isAfter(cutoff) ? List.of(benevole) : List.of();
                }
                throw new UnsupportedOperationException(method);
            });
            PushSubscriptionRepository subscriptions = stub(PushSubscriptionRepository.class, (method, args) -> {
                if (method.equals("findByBenevoleId")) return new ArrayList<>(devices);
                if (method.equals("delete")) { devices.remove(args[0]); return null; }
                throw new UnsupportedOperationException(method);
            });
            ConfirmationDeliveryRepository deliveryRepository = stub(ConfirmationDeliveryRepository.class, (method, args) -> {
                if (method.equals("findByBenevoleIdAndRevisionAndRecipient")) return Optional.ofNullable(deliveries.get(args[1] + ":" + args[2]));
                if (method.equals("save")) {
                    ConfirmationDelivery delivery = (ConfirmationDelivery) args[0];
                    delivery.setId((long) deliveries.size() + 1);
                    deliveries.put(delivery.getRevision() + ":" + delivery.getRecipient(), delivery);
                    return delivery;
                }
                throw new UnsupportedOperationException(method);
            });
            WebPushService push = new WebPushService("", "", "") {
                @Override public boolean isConfigured() { return true; }
                @Override public int send(PushSubscription subscription, String payload) throws Exception {
                    sends.merge(subscription.getId(), 1, Integer::sum);
                    if (pushFailure != null) throw pushFailure;
                    var message = new com.fasterxml.jackson.databind.ObjectMapper().readTree(payload);
                    assertEquals("https://benevoles.example.test/7", message.get("url").asText());
                    assertFalse(payload.contains(benevole.getEmail()));
                    assertFalse(payload.contains("notificationToken"));
                    return codes.getOrDefault(subscription.getId(), 201);
                }
            };
            EmailService email = new EmailService() {
                @Override public boolean sendSingleMessage(List<String> recipients, String body, String subject, String first, String last) {
                    emails.add(List.copyOf(recipients));
                    assertTrue(body.contains("Alice"));
                    return emailAccepted;
                }
            };
            ConfigService config = new ConfigService() {
                @Override public String getEventUrl(Integer id) { return "https://benevoles.example.test/" + id; }
            };
            service = new ConfirmationService(repository, subscriptions, deliveryRepository, push, config);
            inject(selection, "benevoleRepository", repository);
            inject(scheduler, "benevoleService", selection);
            inject(scheduler, "confirmationService", service);
        }

        void device(long id) {
            PushSubscription device = new PushSubscription(); device.setId(id); device.setBenevole(benevole);
            NotificationAccess access = new NotificationAccess(); access.setExpiresAt(Instant.now().plusSeconds(3600));
            device.setAccess(access); devices.add(device);
        }
        ConfirmationDelivery delivery(String recipient) { return deliveries.get(benevole.getDateMaj() + ":" + recipient); }
        void makeRetriesDue() { deliveries.values().forEach(delivery -> delivery.setNextAttemptAt(Instant.EPOCH)); }
    }

    @Test void notificationSansCopieOrganisateurMemeSiAncienParametreActive() {
        Fixture f = new Fixture(true, true); f.device(11);
        f.service.confirm(1); f.service.confirm(1);
        assertEquals(1, f.sends.get(11L));
        assertTrue(f.emails.isEmpty());
        assertNull(f.delivery("organizer"));
        assertEquals(ACCEPTED, f.delivery("push:11").getStatus());
        assertTrue(f.benevole.getAdviseSent());
    }

    @Test void absenceAbonnementNeDeclencheAucunEmailDeSecours() {
        Fixture f = new Fixture(true, false); f.service.confirm(1);
        assertTrue(f.emails.isEmpty()); assertTrue(f.sends.isEmpty());
        assertEquals(SKIPPED, f.delivery("push:none").getStatus());
    }

    @Test void ancienParametreCopieNeDeclencheAucuneConfirmation() {
        Fixture f = new Fixture(false, true); f.device(11); f.service.confirm(1);
        assertTrue(f.sends.isEmpty()); assertTrue(f.emails.isEmpty());
        assertTrue(f.deliveries.isEmpty()); assertTrue(f.benevole.getAdviseSent());
    }

    @Test void reprendUniquementAppareilEnEchecEtRespecteLeDelai() {
        Fixture f = new Fixture(true, true); f.device(11); f.device(12); f.codes.put(12L, 503);
        f.service.confirm(1); f.service.confirm(1);
        assertFalse(f.benevole.getAdviseSent()); assertEquals(1, f.sends.get(12L));
        f.makeRetriesDue(); f.codes.put(12L, 201); f.service.confirm(1);
        assertEquals(1, f.sends.get(11L)); assertEquals(2, f.sends.get(12L)); assertTrue(f.emails.isEmpty());
        assertTrue(f.benevole.getAdviseSent());
    }

    @Test void ancienneCopieEnAttenteNeBloquePasLaConfirmation() {
        Fixture f = new Fixture(true, true); f.device(11);
        ConfirmationDelivery ancienne = new ConfirmationDelivery(); ancienne.setRecipient("organizer");
        ancienne.setRevision(f.benevole.getDateMaj()); ancienne.setBenevole(f.benevole);
        f.deliveries.put(f.benevole.getDateMaj() + ":organizer", ancienne);
        f.service.confirm(1);
        assertEquals(1, f.sends.get(11L)); assertTrue(f.emails.isEmpty());
        assertEquals(0, ancienne.getAttempts()); assertTrue(f.benevole.getAdviseSent());
    }

    @Test void erreurReseauNestPasUneReponseHttp503EtResteReessayable() {
        Fixture f = new Fixture(true, false); f.device(11);
        f.pushFailure = new java.net.http.HttpTimeoutException("endpoint secret");
        f.service.confirm(1);
        var delivery = f.delivery("push:11");
        assertNull(delivery.getResponseCode());
        assertEquals("PUSH_EXCEPTION:HttpTimeoutException", delivery.getLastError());
        assertEquals(PENDING, delivery.getStatus());
        assertFalse(delivery.getLastError().contains("secret"));
        f.pushFailure = null; f.makeRetriesDue(); f.service.confirm(1);
        assertEquals(ACCEPTED, delivery.getStatus()); assertNull(delivery.getLastError());
    }

    @Test void erreurChiffrementEstExpliciteEtNestPasReessayee() {
        Fixture f = new Fixture(true, false); f.device(11);
        f.pushFailure = new java.security.GeneralSecurityException("clé secrète");
        f.service.confirm(1); f.makeRetriesDue(); f.service.confirm(1);
        assertNull(f.delivery("push:11").getResponseCode());
        assertEquals("PUSH_EXCEPTION:GeneralSecurityException", f.delivery("push:11").getLastError());
        assertEquals(FAILED, f.delivery("push:11").getStatus()); assertEquals(1, f.sends.get(11L));
    }

    @Test void supprimeAbonnementsExpiresEtLimiteLesErreursTemporaires() {
        Fixture f = new Fixture(true, false); f.device(11); f.device(12);
        f.codes.put(11L, 410); f.codes.put(12L, 429);
        for (int i = 0; i < 4; i++) { f.makeRetriesDue(); f.service.confirm(1); }
        assertEquals(1, f.devices.size()); assertEquals(EXPIRED, f.delivery("push:11").getStatus());
        assertEquals(3, f.sends.get(12L)); assertEquals(FAILED, f.delivery("push:12").getStatus());
        assertTrue(f.benevole.getAdviseSent());
    }

    @Test void erreurPermanenteNestPasReprise() {
        Fixture f = new Fixture(true, false); f.device(11); f.codes.put(11L, 403);
        f.service.confirm(1); f.makeRetriesDue(); f.service.confirm(1);
        assertEquals(1, f.sends.get(11L)); assertEquals(FAILED, f.delivery("push:11").getStatus());
    }

    @Test void attendCinqMinutesEtConfirmeUneNouvelleRevision() {
        Fixture f = new Fixture(true, false); f.device(11);
        var revision = f.benevole.getDateMaj();
        f.benevole.setDateMaj(LocalDateTime.now(ZoneId.of("Europe/Paris")).minusMinutes(4)); f.scheduler.adviseBenevoles();
        assertTrue(f.sends.isEmpty());
        f.benevole.setDateMaj(revision); f.scheduler.adviseBenevoles();
        f.benevole.setDateMaj(revision.plusSeconds(1)); f.benevole.setAdviseSent(false); f.scheduler.adviseBenevoles();
        assertEquals(2, f.sends.get(11L));
    }

    @Test void selectionRespecteUnDelaiConfigure() {
        Fixture f = new Fixture(true, false); f.device(11);
        inject(f.selection, "confirmationDelayMinutes", 1L);
        f.benevole.setDateMaj(LocalDateTime.now(ZoneId.of("Europe/Paris")).minusSeconds(30));
        f.scheduler.adviseBenevoles();
        assertTrue(f.sends.isEmpty());
        assertFalse(f.benevole.getAdviseSent());
        f.benevole.setDateMaj(LocalDateTime.now(ZoneId.of("Europe/Paris")).minusMinutes(2));
        f.scheduler.adviseBenevoles();
        assertEquals(1, f.sends.get(11L));
        assertTrue(f.benevole.getAdviseSent());
    }

    @Test void activerUnSecondAppareilNeRenvoyePasAuxDestinatairesDejaTraites() {
        Fixture f = new Fixture(true, true); f.device(11); f.service.confirm(1);
        f.device(12); f.benevole.setAdviseSent(false); f.service.confirm(1);
        assertEquals(1, f.sends.get(11L)); assertEquals(1, f.sends.get(12L)); assertTrue(f.emails.isEmpty());
    }

    @Test void chaqueMouvementRepousseLaConfirmationDeCinqMinutes() throws Exception {
        Fixture f = new Fixture(true, false); f.device(11);
        BenevoleService choices = choicesService(f);
        choices.addToCroisement(1, 42, false);
        f.scheduler.adviseBenevoles();
        assertTrue(f.sends.isEmpty());
        f.benevole.setDateMaj(LocalDateTime.now(ZoneId.of("Europe/Paris")).minusMinutes(6));
        choices.removeToCroisement(1, 42);
        f.scheduler.adviseBenevoles();
        assertTrue(f.sends.isEmpty());
        assertFalse(f.benevole.getAdviseSent());
        f.benevole.setDateMaj(LocalDateTime.now(ZoneId.of("Europe/Paris")).minusMinutes(6));
        f.scheduler.adviseBenevoles();
        assertEquals(1, f.sends.get(11L));
        assertTrue(f.benevole.getAdviseSent());
    }

    @Test void uneModificationApresConfirmationOuvreUnNouveauLot() throws Exception {
        Fixture f = new Fixture(true, false); f.device(11);
        f.scheduler.adviseBenevoles();
        BenevoleService choices = choicesService(f);
        choices.addToCroisement(1, 42, false);
        assertFalse(f.benevole.getAdviseSent());
        assertNotNull(f.benevole.getDateMaj());
        f.scheduler.adviseBenevoles();
        assertEquals(1, f.sends.get(11L));
        var previousMovement = LocalDateTime.now(ZoneId.of("Europe/Paris")).minusMinutes(6);
        f.benevole.setDateMaj(previousMovement);
        choices.removeToCroisement(1, 42);
        assertTrue(f.benevole.getDateMaj().isAfter(previousMovement));
        f.scheduler.adviseBenevoles();
        assertEquals(1, f.sends.get(11L));
        f.benevole.setDateMaj(LocalDateTime.now(ZoneId.of("Europe/Paris")).minusMinutes(6));
        f.scheduler.adviseBenevoles();
        assertEquals(2, f.sends.get(11L));
        assertTrue(f.benevole.getCroisements().isEmpty());
        assertTrue(f.benevole.getAdviseSent());
        var revision = f.benevole.getDateMaj();
        choices.removeToCroisement(1, 42);
        assertEquals(revision, f.benevole.getDateMaj());
        assertTrue(f.benevole.getAdviseSent());
        f.scheduler.adviseBenevoles();
        assertEquals(2, f.sends.get(11L));
    }

    @Test void inscriptionRefuseeNeCreePasDeNotification() throws Exception {
        Fixture f = new Fixture(true, false); f.device(11); f.service.confirm(1);
        BenevoleService choices = choicesService(f);
        choices.addToCroisement(1, 42, false);
        var revision = f.benevole.getDateMaj();
        assertThrows(RuntimeException.class, () -> choices.addToCroisement(1, 42, false));
        assertEquals(revision, f.benevole.getDateMaj());
    }

    private BenevoleService choicesService(Fixture f) throws Exception {
        BenevoleRepository repository = stub(BenevoleRepository.class, (method, args) -> {
            if (method.equals("findForConfirmation")) return Optional.of(f.benevole);
            if (method.equals("save")) return args[0];
            throw new UnsupportedOperationException(method);
        });
        Croisement croisement = new Croisement(); croisement.setId(42); croisement.setLimite(10);
        Stand stand = new Stand(); stand.setNom("Buvette"); croisement.setStand(stand);
        Creneau creneau = new Creneau(); creneau.setPlage("10h–12h"); croisement.setCreneau(creneau);
        croisement.setBenevoles(new ArrayList<>());
        CroisementService croisements = new CroisementService() {
            @Override public Croisement findById(Integer id) { return croisement; }
        };
        BenevoleService service = new BenevoleService();
        inject(service, "mouvementBenevoleService", new MouvementBenevoleService(
                stub(MouvementBenevoleRepository.class, (method, args) -> args[0])));
        for (var entry : Map.of("benevoleRepository", repository, "croisementService", croisements).entrySet()) {
            var field = BenevoleService.class.getDeclaredField(entry.getKey());
            field.setAccessible(true); field.set(service, entry.getValue());
        }
        return service;
    }

    interface Invocation { Object call(String method, Object[] args) throws Throwable; }
    static void inject(Object target, String name, Object value) {
        try {
            var field = target.getClass().getDeclaredField(name);
            field.setAccessible(true);
            field.set(target, value);
        } catch (ReflectiveOperationException exception) {
            throw new AssertionError(exception);
        }
    }
    @SuppressWarnings("unchecked")
    static <T> T stub(Class<T> type, Invocation invocation) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type},
                (proxy, method, args) -> invocation.call(method.getName(), args));
    }
}

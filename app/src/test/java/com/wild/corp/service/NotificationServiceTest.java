package com.wild.corp.service;

import com.wild.corp.model.*;
import com.wild.corp.repositories.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static com.wild.corp.service.ConfirmationServiceTest.stub;

class NotificationServiceTest {
    @Test void uneInscriptionNePeutPasReutiliserUnIdPourObtenirLAccesDUnAutreBenevole() throws Exception {
        BenevoleRepository repository = stub(BenevoleRepository.class, (method, args) -> {
            if (method.equals("findByEmailAndEvenementId")) return null;
            if (method.equals("save")) {
                Benevole benevole = (Benevole) args[0];
                assertNull(benevole.getId()); benevole.setId(99); return benevole;
            }
            throw new UnsupportedOperationException(method);
        });
        Evenement event = new Evenement(); event.setId(7);
        EvenementRepository events = stub(EvenementRepository.class, (method, args) -> Optional.of(event));
        NotificationService notifications = new NotificationService(null, null, null, null, null) {
            @Override public String createAccess(Benevole benevole, boolean invitation) {
                assertEquals(99, benevole.getId()); return "new-personal-access";
            }
        };
        BenevoleService service = new BenevoleService();
        ConfirmationServiceTest.inject(service, "mouvementBenevoleService", new MouvementBenevoleService(
                stub(MouvementBenevoleRepository.class, (method, args) -> args[0])));
        for (var entry : Map.of("benevoleRepository", repository, "evenementRepository", events, "notificationService", notifications).entrySet()) {
            var field = BenevoleService.class.getDeclaredField(entry.getKey()); field.setAccessible(true); field.set(service, entry.getValue());
        }
        Benevole forged = new Benevole(); forged.setId(1); forged.setEmail("new@example.test");
        forged.setAdviseSent(false); forged.setDateMaj(java.time.LocalDateTime.now());
        var result = service.add(forged, 7);
        assertEquals(99, result.getId()); assertEquals("new-personal-access", result.getNotificationToken());
        assertTrue(result.getCroisements().isEmpty()); assertNull(result.getDateMaj()); assertTrue(result.getAdviseSent());
    }

    @Test void lienPersonnelAUsageUniqueEtAccesAppareilNonExposeParEmail() {
        Map<String, NotificationAccess> tokens = new HashMap<>();
        NotificationAccessRepository repository = stub(NotificationAccessRepository.class, (method, args) -> {
            if (method.equals("save")) {
                NotificationAccess access = (NotificationAccess) args[0]; access.setId((long) tokens.size() + 1);
                tokens.put(access.getTokenHash(), access); return access;
            }
            if (method.equals("findByTokenHash")) return Optional.ofNullable(tokens.get(args[0]));
            if (method.equals("delete")) { tokens.remove(((NotificationAccess) args[0]).getTokenHash()); return null; }
            throw new UnsupportedOperationException(method);
        });
        NotificationService service = new NotificationService(repository, null, null, new WebPushService("", "", ""), null);
        Benevole benevole = new Benevole(); benevole.setId(10); Evenement event = new Evenement(); event.setId(7); benevole.setEvenement(event);
        String invite = service.createAccess(benevole, true);
        assertFalse(tokens.containsKey(invite));
        assertThrows(ResponseStatusException.class, () -> service.status(invite, "endpoint"));
        var identity = service.identify(invite);
        assertEquals(7, identity.eventId()); assertNotEquals(invite, identity.token());
        assertThrows(ResponseStatusException.class, () -> service.identify(invite));
        assertEquals(10, service.identify(identity.token()).benevole().getId());
        tokens.values().forEach(token -> token.setExpiresAt(Instant.EPOCH));
        assertThrows(ResponseStatusException.class, () -> service.identify(identity.token()));
        assertThrows(ResponseStatusException.class, () -> service.identify("invalid"));
    }

    @Test void accepteLesServicesPushEtRefuseLesUrlsInternesOuRedirections() {
        for (String endpoint : List.of("https://fcm.googleapis.com/fcm/send/test", "https://updates.push.services.mozilla.com/wpush/v2/test", "https://web.push.apple.com/test")) {
            assertDoesNotThrow(() -> NotificationService.validateEndpoint(endpoint));
        }
        for (String endpoint : List.of("http://fcm.googleapis.com/a", "https://localhost/a", "https://127.0.0.1/a", "https://fcm.googleapis.com.evil.test/a", "https://evil.test@fcm.googleapis.com/a", "https://fcm.googleapis.com:8080/a", "https://fcm.googleapis.com/a#secret", "not-a-url")) {
            assertThrows(ResponseStatusException.class, () -> NotificationService.validateEndpoint(endpoint), endpoint);
        }
        assertThrows(ResponseStatusException.class, () -> NotificationService.validateEndpoint(null));
        assertThrows(ResponseStatusException.class, () -> NotificationService.validateSubscription(new NotificationService.SubscriptionRequest("https://fcm.googleapis.com/a", new NotificationService.Keys("bad", "bad"))));
    }

    @Test void statutEtDesactivationSontReservesALAccesQuiAAbonneLAppareil() {
        Benevole benevole = new Benevole(); benevole.setId(1);
        NotificationAccess owner = new NotificationAccess(); owner.setId(11L); owner.setBenevole(benevole); owner.setExpiresAt(Instant.now().plusSeconds(3600));
        NotificationAccess other = new NotificationAccess(); other.setId(12L); other.setBenevole(benevole); other.setExpiresAt(owner.getExpiresAt());
        String token = "a".repeat(43);
        NotificationAccessRepository accesses = stub(NotificationAccessRepository.class, (method, args) -> Optional.of(owner));
        PushSubscription subscription = new PushSubscription(); subscription.setAccess(other);
        List<PushSubscription> removed = new ArrayList<>();
        PushSubscriptionRepository subscriptions = stub(PushSubscriptionRepository.class, (method, args) -> {
            if (method.equals("findByBenevoleIdAndEndpointHash")) return Optional.of(subscription);
            if (method.equals("delete")) { removed.add((PushSubscription) args[0]); return null; }
            throw new UnsupportedOperationException(method);
        });
        NotificationService service = new NotificationService(accesses, subscriptions, null, new WebPushService("", "", ""), null);
        assertFalse(service.status(token, "https://fcm.googleapis.com/a"));
        service.unsubscribe(token, "https://fcm.googleapis.com/a"); assertTrue(removed.isEmpty());
        subscription.setAccess(owner);
        assertTrue(service.status(token, "https://fcm.googleapis.com/a"));
        service.unsubscribe(token, "https://fcm.googleapis.com/a"); assertEquals(1, removed.size());
    }
}

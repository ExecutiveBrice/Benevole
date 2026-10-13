package com.wild.corp.service;

import com.wild.corp.model.*;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import static org.junit.jupiter.api.Assertions.*;

class NotificationPersistenceTest {
    @Test void creeLesTablesEtSupprimeLesAbonnementsAvecLeBenevole() {
        Configuration config = new Configuration()
                .setProperty("hibernate.connection.url", "jdbc:h2:mem:notifications;MODE=PostgreSQL;DB_CLOSE_DELAY=-1")
                .setProperty("hibernate.connection.driver_class", "org.h2.Driver")
                .setProperty("hibernate.hbm2ddl.auto", "create-drop")
                .setProperty("hibernate.show_sql", "false");
        for (Class<?> type : new Class<?>[]{Benevole.class, Evenement.class, Administrateur.class,
                Stand.class, Creneau.class, Croisement.class, NotificationAccess.class, PushSubscription.class, ConfirmationDelivery.class}) {
            config.addAnnotatedClass(type);
        }
        try (var factory = config.buildSessionFactory()) {
            Integer benevoleId;
            try (var session = factory.openSession()) {
                var transaction = session.beginTransaction();
                Evenement event = new Evenement(); event.setEventName("Festival"); session.persist(event);
                Benevole benevole = new Benevole(); benevole.setEmail("alice@example.test"); benevole.setEvenement(event);
                benevole.setCroisements(new ArrayList<>()); session.persist(benevole);
                NotificationAccess access = new NotificationAccess(); access.setBenevole(benevole);
                access.setTokenHash("a".repeat(64)); access.setExpiresAt(Instant.now().plusSeconds(3600)); session.persist(access);
                PushSubscription subscription = new PushSubscription(); subscription.setBenevole(benevole); subscription.setAccess(access);
                subscription.setEndpoint("https://fcm.googleapis.com/test"); subscription.setEndpointHash("b".repeat(64));
                subscription.setP256dh("key"); subscription.setAuth("auth"); session.persist(subscription);
                ConfirmationDelivery delivery = new ConfirmationDelivery(); delivery.setBenevole(benevole);
                delivery.setRevision(LocalDateTime.now()); delivery.setRecipient("organizer"); session.persist(delivery);
                benevoleId = benevole.getId(); transaction.commit();
            }
            try (var session = factory.openSession()) {
                var transaction = session.beginTransaction();
                session.remove(session.find(Benevole.class, benevoleId)); transaction.commit();
            }
            try (var session = factory.openSession()) {
                assertEquals(0L, session.createQuery("select count(a) from NotificationAccess a", Long.class).uniqueResult());
                assertEquals(0L, session.createQuery("select count(a) from PushSubscription a", Long.class).uniqueResult());
                assertEquals(0L, session.createQuery("select count(a) from ConfirmationDelivery a", Long.class).uniqueResult());
            }
        }
    }

    @Test void lesLecturesPubliquesNeSerialisentPasLesSecretsPersistes() throws Exception {
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Benevole benevole = new Benevole(); benevole.setEmail("alice@example.test");
        NotificationAccess access = new NotificationAccess(); access.setTokenHash("secret-hash");
        benevole.setNotificationAccesses(java.util.List.of(access));
        assertFalse(mapper.writeValueAsString(benevole).contains("secret-hash"));
        assertFalse(mapper.writeValueAsString(benevole).contains("notificationToken"));
        assertNull(mapper.readValue("{\"email\":\"test\",\"notificationToken\":\"forged\"}", Benevole.class).getNotificationToken());
    }
}

package com.wild.corp.service;

import com.wild.corp.model.Benevole;
import com.wild.corp.model.Evenement;
import com.wild.corp.model.Ressources.EmailRessource;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class EmailServiceTest {
    @Test void mailDeGestionNeMetPlusOrganisateurEnCopie() {
        Evenement evenement = new Evenement(); evenement.setId(7);
        evenement.setNotification(true); evenement.setCopie(true);
        evenement.setContactEmail("organisateur@example.test");
        Benevole benevole = new Benevole(); benevole.setEvenement(evenement); benevole.setEmail("alice@example.test");
        List<List<String>> envois = new ArrayList<>();
        EmailService service = new EmailService() {
            @Override public void singleMessage(List<String> to, String body, String subject, String first, String last) {
                envois.add(List.copyOf(to));
            }
        };
        service.benevoleService = new BenevoleService() {
            @Override public Benevole findById(Integer id) { return benevole; }
        };
        service.configService = new ConfigService() {
            @Override public String getEventUrl(Integer id) { return "https://benevoles.example.test/" + id; }
        };
        EmailRessource message = new EmailRessource(); message.setTo(Set.of(1)); message.setText("Bonjour");
        message.setSubject("Informations"); message.setRappel(false);
        service.sendGestionMessage(message);
        assertEquals(List.of(List.of("alice@example.test")), envois);
        evenement.setNotification(false); service.sendGestionMessage(message);
        assertTrue(envois.getLast().isEmpty());
    }
}

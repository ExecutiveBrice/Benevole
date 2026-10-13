package com.wild.corp.service;

import com.wild.corp.model.Evenement;
import com.wild.corp.repositories.EvenementRepository;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class EvenementServiceTest {
    @Test
    void enregistreEtEffaceLesInformationsPratiques() throws Exception {
        Evenement existant = new Evenement();
        existant.setId(1);
        EvenementRepository repository = (EvenementRepository) Proxy.newProxyInstance(
                EvenementRepository.class.getClassLoader(), new Class<?>[]{EvenementRepository.class},
                (proxy, method, args) -> switch (method.getName()) {
                    case "findById" -> Optional.of(existant);
                    case "save" -> args[0];
                    default -> throw new UnsupportedOperationException(method.getName());
                });
        EvenementService service = new EvenementService();
        var field = EvenementService.class.getDeclaredField("evenementRepository");
        field.setAccessible(true);
        field.set(service, repository);

        Evenement modification = new Evenement();
        modification.setId(1);
        modification.setDateEvenement(LocalDate.of(2027, 3, 28));
        modification.setAdresse("12 rue des Fleurs, Paris");
        modification.setIndicationsDebut("Accueil à 8h30\nEntrée côté jardin");
        modification.setIndicationsFin("Rangement puis départ libre");
        Evenement resultat = service.update(modification);
        assertEquals(LocalDate.of(2027, 3, 28), resultat.getDateEvenement());
        assertEquals(modification.getAdresse(), resultat.getAdresse());
        assertEquals(modification.getIndicationsDebut(), resultat.getIndicationsDebut());
        assertEquals(modification.getIndicationsFin(), resultat.getIndicationsFin());

        Evenement effacement = new Evenement();
        effacement.setId(1);
        resultat = service.update(effacement);
        assertNull(resultat.getDateEvenement());
        assertEquals("", resultat.getAdresse());
        assertEquals("", resultat.getIndicationsDebut());
        assertEquals("", resultat.getIndicationsFin());
    }
}

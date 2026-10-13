package com.wild.corp.service;

import com.wild.corp.model.Creneau;
import com.wild.corp.model.Croisement;
import com.wild.corp.model.Evenement;
import com.wild.corp.model.Stand;
import com.wild.corp.repositories.CreneauRepository;
import com.wild.corp.repositories.CroisementRepository;
import com.wild.corp.repositories.StandRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Proxy;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class AccesParametrageServiceTest {
    private final Stand stand = stand(10, 1);
    private final Creneau creneau = creneau(20, 1);
    private final Croisement existant = croisement(30, stand(11, 2), creneau(21, 2));
    private final AccesParametrageService service = new AccesParametrageService(
            new AdministrateurService(null, null, null, null, null, "http://localhost/") {
                @Override
                public void verifierAccesEvenement(String username, Integer evenementId) {
                    if ("superadmin".equals(username)) {
                        return;
                    }
                    if (!"admin".equals(username) || evenementId != 1) {
                        throw new AccessDeniedException("Événement non autorisé");
                    }
                }
            },
            repository(StandRepository.class, Map.of(10, stand, 11, existant.getStand())),
            repository(CreneauRepository.class, Map.of(20, creneau, 21, existant.getCreneau())),
            repository(CroisementRepository.class, Map.of(30, existant)));

    @Test
    void autoriseLeParametrageDeSonEvenement() {
        assertDoesNotThrow(() -> service.evenement("admin", 1));
        assertDoesNotThrow(() -> service.stand("admin", 10));
        assertDoesNotThrow(() -> service.creneau("admin", 20));
        assertDoesNotThrow(() -> service.croisement("admin", croisement(null, stand, creneau)));
    }

    @Test
    void refuseLeParametrageDunAutreEvenement() {
        assertThrows(AccessDeniedException.class, () -> service.stand("admin", 11));
        assertThrows(AccessDeniedException.class, () -> service.creneau("admin", 21));
        assertThrows(AccessDeniedException.class, () -> service.croisement("admin", 30));
        assertThrows(AccessDeniedException.class,
                () -> service.croisement("admin", croisement(null, stand, existant.getCreneau())));
    }

    @Test
    void refuseLaReaffectationDunCroisementNonAutorise() {
        assertThrows(AccessDeniedException.class,
                () -> service.croisement("admin", croisement(30, stand, creneau)));
    }

    @Test
    void utiliseLesLiensEnBaseMemeSiLeCorpsAnnonceUnAutreEvenement() {
        assertThrows(AccessDeniedException.class,
                () -> service.croisement("admin", croisement(null, stand(11, 1), creneau)));
    }

    @Test
    void refuseUnCroisementEntreDeuxEvenementsMemePourUnSuperadministrateur() {
        assertDoesNotThrow(() -> service.croisement("superadmin", 30));
        assertEquals(HttpStatus.BAD_REQUEST,
                assertThrows(ResponseStatusException.class,
                        () -> service.croisement("superadmin", croisement(null, stand, existant.getCreneau())))
                        .getStatusCode());
    }

    @Test
    void signaleLesIdentifiantsManquantsEtLesRessourcesInconnues() {
        assertEquals(HttpStatus.BAD_REQUEST,
                assertThrows(ResponseStatusException.class, () -> service.stand("admin", null)).getStatusCode());
        assertEquals(HttpStatus.NOT_FOUND,
                assertThrows(ResponseStatusException.class, () -> service.stand("admin", 99)).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST,
                assertThrows(ResponseStatusException.class,
                        () -> service.croisement("admin", new Croisement())).getStatusCode());
    }

    private static Stand stand(int id, int evenementId) {
        Stand stand = new Stand();
        stand.setId(id);
        Evenement evenement = new Evenement();
        evenement.setId(evenementId);
        stand.setEvenement(evenement);
        return stand;
    }

    private static Creneau creneau(int id, int evenementId) {
        Creneau creneau = new Creneau();
        creneau.setId(id);
        creneau.setEvenement(stand(0, evenementId).getEvenement());
        return creneau;
    }

    private static Croisement croisement(Integer id, Stand stand, Creneau creneau) {
        Croisement croisement = new Croisement();
        croisement.setId(id);
        croisement.setStand(stand);
        croisement.setCreneau(creneau);
        return croisement;
    }

    private static <T> T repository(Class<T> type, Map<Integer, ?> entities) {
        return type.cast(Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type},
                (proxy, method, args) -> {
                    if (method.getName().equals("findById")) {
                        return Optional.ofNullable(entities.get(args[0]));
                    }
                    throw new UnsupportedOperationException(method.getName());
                }));
    }
}

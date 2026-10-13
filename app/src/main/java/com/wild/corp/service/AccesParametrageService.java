package com.wild.corp.service;

import com.wild.corp.model.Creneau;
import com.wild.corp.model.Croisement;
import com.wild.corp.model.Evenement;
import com.wild.corp.model.Stand;
import com.wild.corp.repositories.CreneauRepository;
import com.wild.corp.repositories.CroisementRepository;
import com.wild.corp.repositories.StandRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Vérifie les droits sur les événements auxquels appartient le paramétrage. */
@Service
@Transactional(readOnly = true)
public class AccesParametrageService {
    private final AdministrateurService administrateurService;
    private final StandRepository standRepository;
    private final CreneauRepository creneauRepository;
    private final CroisementRepository croisementRepository;

    public AccesParametrageService(AdministrateurService administrateurService,
                                  StandRepository standRepository,
                                  CreneauRepository creneauRepository,
                                  CroisementRepository croisementRepository) {
        this.administrateurService = administrateurService;
        this.standRepository = standRepository;
        this.creneauRepository = creneauRepository;
        this.croisementRepository = croisementRepository;
    }

    public void evenement(String username, Integer evenementId) {
        verifierId(evenementId);
        administrateurService.verifierAccesEvenement(username, evenementId);
    }

    public void stand(String username, Integer standId) {
        evenement(username, evenementDuStand(standId).getId());
    }

    public void creneau(String username, Integer creneauId) {
        evenement(username, evenementDuCreneau(creneauId).getId());
    }

    public void croisement(String username, Integer croisementId) {
        verifierId(croisementId);
        Croisement croisement = croisementRepository.findById(croisementId)
                .orElseThrow(() -> introuvable("Croisement"));
        verifierLiens(username, croisement);
    }

    public void croisement(String username, Croisement croisement) {
        if (croisement == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Croisement requis");
        }
        // Contrôle aussi les liens enregistrés avant une éventuelle réaffectation.
        if (croisement.getId() != null) {
            croisement(username, croisement.getId());
        }
        verifierLiens(username, croisement);
    }

    private void verifierLiens(String username, Croisement croisement) {
        if (croisement.getStand() == null || croisement.getCreneau() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stand et créneau requis");
        }
        // Résout les événements en base plutôt que de faire confiance au corps reçu.
        Integer standEventId = evenementDuStand(croisement.getStand().getId()).getId();
        Integer creneauEventId = evenementDuCreneau(croisement.getCreneau().getId()).getId();
        evenement(username, standEventId);
        evenement(username, creneauEventId);
        if (!standEventId.equals(creneauEventId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le stand et le créneau doivent appartenir au même événement");
        }
    }

    private Evenement evenementDuStand(Integer id) {
        verifierId(id);
        Stand stand = standRepository.findById(id).orElseThrow(() -> introuvable("Stand"));
        if (stand.getEvenement() == null) {
            throw introuvable("Événement du stand");
        }
        return stand.getEvenement();
    }

    private Evenement evenementDuCreneau(Integer id) {
        verifierId(id);
        Creneau creneau = creneauRepository.findById(id).orElseThrow(() -> introuvable("Créneau"));
        if (creneau.getEvenement() == null) {
            throw introuvable("Événement du créneau");
        }
        return creneau.getEvenement();
    }

    private void verifierId(Integer id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Identifiant requis");
        }
    }

    private ResponseStatusException introuvable(String ressource) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, ressource + " introuvable");
    }
}

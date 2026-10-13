package com.wild.corp.service;

import com.wild.corp.model.Benevole;
import com.wild.corp.model.Croisement;
import com.wild.corp.model.MouvementBenevole;
import com.wild.corp.repositories.MouvementBenevoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class MouvementBenevoleService {
    private final MouvementBenevoleRepository mouvements;

    public MouvementBenevoleService(MouvementBenevoleRepository mouvements) {
        this.mouvements = mouvements;
    }

    /** Le journal et la modification de l'inscription doivent être validés ensemble. */
    @Transactional(propagation = Propagation.MANDATORY)
    public void enregistrer(Benevole benevole, MouvementBenevole.Type type, Croisement croisement) {
        MouvementBenevole mouvement = new MouvementBenevole();
        mouvement.setEvenement(benevole.getEvenement());
        mouvement.setSurvenuLe(Instant.now());
        mouvement.setType(type);
        mouvement.setBenevoleId(benevole.getId());
        mouvement.setPrenom(benevole.getPrenom());
        mouvement.setNom(benevole.getNom());
        mouvement.setEmail(benevole.getEmail());
        mouvement.setTelephone(benevole.getTelephone());
        if (croisement != null) {
            mouvement.setStand(croisement.getStand().getNom());
            mouvement.setCreneau(croisement.getCreneau().getPlage());
        }
        mouvements.save(mouvement);
    }
}

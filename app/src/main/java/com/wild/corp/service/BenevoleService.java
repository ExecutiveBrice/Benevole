package com.wild.corp.service;


import com.wild.corp.model.Benevole;
import com.wild.corp.model.Croisement;
import com.wild.corp.model.Evenement;
import com.wild.corp.repositories.BenevoleRepository;
import com.wild.corp.repositories.EvenementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service("BenevoleService")
@Transactional
public class BenevoleService {

    @Autowired
    private BenevoleRepository benevoleRepository;

    @Autowired
    private CroisementService croisementService;

    @Autowired
    private EvenementRepository evenementRepository;

    public void persist(Benevole benevole) {
        benevoleRepository.save(benevole);
    }

    public void add(Benevole benevole, Integer evenementId) {
        Evenement evenement = evenementRepository.findById(evenementId).get();
        benevole.setEvenement(evenement);
        persist(benevole);
    }

    public void update(Benevole benevole) {

        Benevole pBenevole = findById(benevole.getId());


        pBenevole.setEmail(benevole.getEmail());
        pBenevole.setNom(benevole.getNom());
        pBenevole.setPrenom(benevole.getPrenom());
        pBenevole.setTelephone(benevole.getTelephone());

        persist(pBenevole);
    }

    public Benevole updateCroisement(Integer benevoleId, Integer croisementId) {
        Benevole benevole = findById(benevoleId);
        Croisement croisement = croisementService.findById(croisementId);

        if (benevole.getCroisements().stream().anyMatch(croisementFind -> croisementId.equals(croisementFind.getId()))) {
            benevole.getCroisements().remove(croisementService.findById(croisementId));
        } else {
            if (croisement.getBenevoles().size() < croisement.getLimite()) {
                benevole.getCroisements().add(croisementService.findById(croisementId));
            }
        }
        persist(benevole);

        return benevole;
    }

    public List<Benevole> findAll() {
        return benevoleRepository.findAll();
    }

    public Benevole findById(Integer benevoleId) {
        return benevoleRepository.getOne(benevoleId);
    }

    public void deleteById(Integer benevoleId) {
        benevoleRepository.deleteById(benevoleId);
    }

    public Benevole findByEmail(String email, Integer evenementId) {
        return benevoleRepository.findByEmailAndEvenementId(email, evenementId);
    }

    public List<Benevole> findByEvenementId(Integer evenementId) {
        List<Benevole> benevoles = benevoleRepository.findByEvenementId(evenementId);
        return benevoles;
    }
}

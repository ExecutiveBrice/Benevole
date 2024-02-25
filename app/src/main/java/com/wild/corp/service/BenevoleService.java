package com.wild.corp.service;


import com.wild.corp.model.Benevole;
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

    public void add(Benevole benevole, Integer evenementId){
        Evenement evenement = evenementRepository.findById(evenementId).get();
        benevole.setEvenement(evenement);
        persist(benevole);
    }

  public void update(Benevole benevole) {

        Benevole pBenevole = findById(benevole.getId());
        pBenevole.setCommentaire(benevole.getCommentaire());

        pBenevole.setEmail(benevole.getEmail());
        pBenevole.setNom(benevole.getNom());
        pBenevole.setPrenom(benevole.getPrenom());
        pBenevole.setTelephone(benevole.getTelephone());
        pBenevole.setReponse(benevole.getReponse());
        persist(pBenevole);
    }

    public Benevole updateCroisements(Integer benevoleId, List<Integer> croisementListId){

        Benevole benevole = findById(benevoleId);
        benevole.getCroisements().clear();
        for (Integer croisementId:croisementListId) {
            benevole.getCroisements().add(croisementService.findById(croisementId));
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

    public Benevole findByEmail(String email, Integer evenementId){
        return benevoleRepository.findByEmailAndEvenementId(email, evenementId);
    }

    public List<Benevole> findByEvenementId(Integer evenementId){
        List<Benevole> benevoles = benevoleRepository.findByEvenementId(evenementId);
        return benevoles;
    }
}

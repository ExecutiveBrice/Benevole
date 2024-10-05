package com.wild.corp.service;


import com.wild.corp.model.Creneau;
import com.wild.corp.model.Croisement;
import com.wild.corp.model.Evenement;
import com.wild.corp.repositories.CreneauRepository;
import com.wild.corp.repositories.EvenementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service("CreneauService")
@Transactional
public class CreneauService {

    @Autowired
    private CreneauRepository creneauRepository;

    @Autowired
    private EvenementRepository evenementRepository;
    @Autowired
    private CroisementService croisementService;

    public void persist(Creneau creneau) {
        creneauRepository.save(creneau);
    }

    public void delete(Integer idCreneau) {
        List<Croisement> croisements = croisementService.getCroisementByCreneau(idCreneau);
        for (Croisement croisement:croisements) {
            croisementService.delete(croisement.getId());
        }
        creneauRepository.delete(findById(idCreneau));
    }

    public void addCreneau(Creneau creneau, Integer evenementId){
        Evenement evenement = evenementRepository.findById(evenementId).get();

        creneau.setEvenement(evenement);

        persist(creneau);
    }

    public void updateCreneau(Creneau newCreneau){
        Creneau creneau = findById(newCreneau.getId());

        creneau.setOrdre(newCreneau.getOrdre());
        creneau.setPlage(newCreneau.getPlage());
        persist(creneau);
    }

    public List<Creneau> findAll() {
        return creneauRepository.findAll();
    }

    public Creneau findById(Integer childId) {
        return creneauRepository.getOne(childId);
    }

    public List<Creneau> findByGroupeAndEvenementId(Integer groupe, Integer evenementId){
        return creneauRepository.findByEvenementId(evenementId);
    }

    public List<Creneau> findByEvenementId(Integer evenementId){
        return creneauRepository.findByEvenementId(evenementId);
    }

}

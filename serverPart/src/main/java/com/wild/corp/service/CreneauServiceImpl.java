package com.wild.corp.service;


import com.wild.corp.model.Creneau;
import com.wild.corp.model.Croisement;
import com.wild.corp.model.Evenement;
import com.wild.corp.repositories.CreneauRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service("CreneauService")
@Transactional
public class CreneauServiceImpl implements CreneauService {


    @Autowired
    private CreneauRepository creneauRepository;

    @Autowired
    private EvenementService evenementService;

    @Autowired
    private CroisementService croisementService;

    @Override
    public void persist(Creneau creneau) {
        creneauRepository.save(creneau);
    }

    @Override
    public void delete(Integer idCreneau) {
        List<Croisement> croisements = croisementService.getCroisementByCreneau(idCreneau);
        for (Croisement croisement:croisements) {
            croisementService.delete(croisement.getId());
        }
        creneauRepository.delete(findById(idCreneau));
    }

    @Override
    public void addCreneau(Creneau creneau, Integer evenementId){
        Evenement evenement = evenementService.findById(evenementId);

        creneau.setEvenement(evenement);

        persist(creneau);
    }

    @Override
    public void updateCreneau(Creneau newCreneau){
        Creneau creneau = findById(newCreneau.getId());

        creneau.setOrdre(newCreneau.getOrdre());
        creneau.setPlage(newCreneau.getPlage());
        creneau.setChevauchement(newCreneau.getChevauchement());
        persist(creneau);
    }

    @Override
    public List<Creneau> findAll() {
        return creneauRepository.findAll();
    }

    @Override
    public Creneau findById(Integer childId) {
        return creneauRepository.getOne(childId);
    }

    @Override
    public List<Creneau> findByGroupeAndEvenementId(Integer groupe, Integer evenementId){
        return creneauRepository.findByEvenementId(evenementId);
    }

    @Override
    public List<Creneau> findByEvenementId(Integer evenementId){
        return creneauRepository.findByEvenementId(evenementId);
    }

}

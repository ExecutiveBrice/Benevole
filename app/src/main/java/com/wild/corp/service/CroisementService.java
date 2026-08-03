package com.wild.corp.service;


import com.wild.corp.model.Croisement;
import com.wild.corp.repositories.CroisementRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

@Service("CroisementService")
@Transactional
public class CroisementService {

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public class NotFoundException extends RuntimeException{}

    private final CroisementRepository croisementRepository;

    public CroisementService(CroisementRepository croisementRepository) {
        this.croisementRepository = croisementRepository;
    }

    public void persist(Croisement croisement) {
        croisementRepository.save(croisement);
    }

    public List<Croisement> findByEtatAndEvenementId(Integer etat, Integer eventId) {
        return croisementRepository.findByStandTypeAndStandEvenementId(etat, eventId);
    }

    public void delete(Integer croisementId)throws RuntimeException {
        Croisement croisement = findById(croisementId);
        try {
            croisementRepository.delete(croisement);
        }catch (Exception pl){
           throw new RuntimeException();
        }

    }

    public Croisement findById(Integer croisementId){
        return croisementRepository.findById(croisementId)
                .orElseThrow(NotFoundException::new);
    }

    public List<Croisement> getCroisementByStand(Integer standId){
        return croisementRepository.findByStandId(standId);
    }

    public List<Croisement> getCroisementByEvenement(Integer evenementId){
        return croisementRepository.findByStandEvenementId(evenementId);
    }

    public List<Croisement> getCroisementByCreneau(Integer creneauId){
        return croisementRepository.findByCreneauId(creneauId);
    }

    public List<Croisement> getCroisementByBenveole(Integer benevoleId){
        return croisementRepository.findByBenevolesId(benevoleId);
    }

    public List<Croisement> findAll() {
        return croisementRepository.findAll();
    }

}

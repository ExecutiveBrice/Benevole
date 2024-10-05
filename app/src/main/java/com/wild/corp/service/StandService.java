package com.wild.corp.service;


import com.wild.corp.model.Croisement;
import com.wild.corp.model.Evenement;
import com.wild.corp.model.Stand;
import com.wild.corp.repositories.EvenementRepository;
import com.wild.corp.repositories.StandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

@Service("StandService")
@Transactional
public class StandService {

    @Autowired
    private StandRepository standRepository;

    @Autowired
    private CreneauService creneauService;

    @Autowired
    private EvenementRepository evenementRepository;


    public void persist(Stand child) {
        standRepository.save(child);
    }

    public void addStand(Stand stand, Integer eventId){
        Evenement evenvement  = evenementRepository.findById(eventId).get();
        stand.setEvenement(evenvement);
        persist(stand);
    }

    public void delete(Integer standId) {
        Stand stand = findById(standId);
    try {
        standRepository.delete(stand);
    }catch (Exception pl){
        throw new RuntimeException();
    }
    }

    public List<Stand> findAll() {
        return standRepository.findAll();
    }

    public Stand findById(Integer childId) {
        return standRepository.getOne(childId);
    }

    public void update(Stand stand) {
        Stand realStand = findById(stand.getId());

        realStand.setNom(stand.getNom());
        realStand.setOrdre(stand.getOrdre());
        realStand.setType(stand.getType());

        realStand.getCroisements().forEach(croisement -> {
            Croisement croisementFront = stand.getCroisements().stream().filter(croisement1 -> croisement1.getId().equals(croisement.getId())).findFirst().get();
            croisement.setLimite(croisementFront.getLimite());
            croisement.setBesoin(croisementFront.getBesoin());
        });
        standRepository.save(realStand);
    }

    public List<Stand> findByEvenementId(Integer evenementId) {
        return standRepository.findByEvenementId(evenementId);
    }

}

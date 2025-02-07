package com.wild.corp.service;


import com.wild.corp.model.Benevole;
import com.wild.corp.model.Croisement;
import com.wild.corp.model.Evenement;
import com.wild.corp.repositories.BenevoleRepository;
import com.wild.corp.repositories.EvenementRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Slf4j
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

        if(findByEmail(benevole.getEmail(), evenementId) != null){
            throw new RuntimeException("existe déjà");
        }
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

    public Benevole addToCroisement(Integer benevoleId, Integer croisementId, Boolean force) {
        Benevole benevole = findById(benevoleId);
        Croisement croisement = croisementService.findById(croisementId);
        ZoneId z = ZoneId.of( "Europe/Paris" );
        LocalDateTime now = LocalDateTime.now( z );
        benevole.setDateMaj(now);
        benevole.setAdviseSent(false);
        if (benevole.getCroisements().stream().anyMatch(croisementFind -> croisementId.equals(croisementFind.getId()))) {
            throw new RuntimeException("existe déjà");
        } else {
            if (croisement.getBenevoles().size() < croisement.getLimite() || force) {
                benevole.getCroisements().add(croisement);
            }else{
                throw new RuntimeException("pas de place");
            }
        }
        persist(benevole);

        return benevole;
    }

    public Benevole removeToCroisement(Integer benevoleId, Integer croisementId) {
        Benevole benevole = findById(benevoleId);
        ZoneId z = ZoneId.of( "Europe/Paris" );
        LocalDateTime now = LocalDateTime.now( z );
        benevole.setDateMaj(now);
        benevole.setAdviseSent(false);
        if (benevole.getCroisements().stream().anyMatch(croisementFind -> croisementId.equals(croisementFind.getId()))) {
            benevole.getCroisements().remove(croisementService.findById(croisementId));
        }
        persist(benevole);

        return benevole;
    }

    public List<Benevole> findAll() {
        return benevoleRepository.findAll();
    }

    public List<Benevole> findBenevolesToAdvise() {
        ZoneId z = ZoneId.of( "Europe/Paris" );
        LocalDateTime now = LocalDateTime.now(z);
        log.info(now.minusMinutes(5).toString());
        return benevoleRepository.findBenevolesToAdvise(now.minusMinutes(5));
    }

    public Benevole findById(Integer benevoleId) {
        Optional<Benevole> benevoleOpt = benevoleRepository.findById(benevoleId);
        if (benevoleOpt.isPresent()){
            return benevoleOpt.get();
        }else {
            return null;
        }

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

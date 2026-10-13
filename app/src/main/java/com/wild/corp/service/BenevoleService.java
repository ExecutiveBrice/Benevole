package com.wild.corp.service;


import com.wild.corp.model.Benevole;
import com.wild.corp.model.Croisement;
import com.wild.corp.model.Evenement;
import com.wild.corp.repositories.BenevoleRepository;
import com.wild.corp.repositories.EvenementRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${app.confirmation.delay-minutes:5}")
    private long confirmationDelayMinutes = 5;

    @Autowired
    private BenevoleRepository benevoleRepository;

    @Autowired
    private CroisementService croisementService;

    @Autowired
    private EvenementRepository evenementRepository;

    @Autowired
    private NotificationService notificationService;

    public Benevole persist(Benevole benevole) {
        return benevoleRepository.save(benevole);
    }

    public Benevole add(Benevole benevole, Integer evenementId) {

        if(findByEmail(benevole.getEmail(), evenementId) != null){
            throw new RuntimeException("existe déjà");
        }
        Evenement evenement = evenementRepository.findById(evenementId).get();
        // Ne jamais accepter un identifiant existant pour délivrer un accès personnel.
        benevole.setId(null);
        benevole.setCroisements(new java.util.ArrayList<>());
        benevole.setAdviseSent(true);
        benevole.setDateMaj(null);
        benevole.setEvenement(evenement);
        Benevole created = persist(benevole);
        created.setNotificationToken(notificationService.createAccess(created, false));
        return created;
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
        Benevole benevole = benevoleRepository.findForConfirmation(benevoleId).orElseThrow();
        Croisement croisement = croisementService.findById(croisementId);
        if (benevole.getCroisements().stream().anyMatch(croisementFind -> croisementId.equals(croisementFind.getId()))) {
            throw new RuntimeException("existe déjà");
        } else {
            if (croisement.getBenevoles().size() < croisement.getLimite() || force) {
                benevole.getCroisements().add(croisement);
                markChoicesChanged(benevole);
            }else{
                throw new RuntimeException("pas de place");
            }
        }
        persist(benevole);

        return benevole;
    }

    public Benevole removeToCroisement(Integer benevoleId, Integer croisementId) {
        Benevole benevole = benevoleRepository.findForConfirmation(benevoleId).orElseThrow();
        if (benevole.getCroisements().removeIf(croisement -> croisementId.equals(croisement.getId()))) {
            markChoicesChanged(benevole);
        }
        persist(benevole);

        return benevole;
    }

    private void markChoicesChanged(Benevole benevole) {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Europe/Paris"));
        benevole.setDateMaj(now);
        benevole.setAdviseSent(false);
    }

    public List<Benevole> findAll() {
        return benevoleRepository.findAll();
    }

    public List<Benevole> findBenevolesToAdvise() {
        ZoneId z = ZoneId.of( "Europe/Paris" );
        LocalDateTime now = LocalDateTime.now(z);
        return benevoleRepository.findBenevolesToAdvise(now.minusMinutes(confirmationDelayMinutes));
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

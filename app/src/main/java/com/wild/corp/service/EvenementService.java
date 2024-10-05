package com.wild.corp.service;


import com.wild.corp.configuration.Constante;
import com.wild.corp.model.Benevole;
import com.wild.corp.model.Creneau;
import com.wild.corp.model.Evenement;
import com.wild.corp.model.Stand;
import com.wild.corp.repositories.EvenementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Service("EvenementService")
@Transactional
public class EvenementService {

    public static final Logger logger = LoggerFactory.getLogger(EvenementService.class);

    @Autowired
    private EvenementRepository evenementRepository;

    @Autowired
    private StandService standService;

    @Autowired
    private CreneauService  creneauService;

    @Autowired
    private BenevoleService benevoleService;

    @Autowired
    private Environment environment;

    public void persist(Evenement evenement) {
        evenementRepository.save(evenement);
        evenement.setLock(Constante.LOCK);
        evenement.setValidation(Constante.VALIDATION);
        evenement.setSignature(Constante.SIGNATURE);



        evenementRepository.save(evenement);
        Stand firstStand = new Stand();
        firstStand.setNom("Sans Choix");
        firstStand.setOrdre(0);
        firstStand.setType(1);
        standService.addStand(firstStand, evenement.getId());


        Creneau firstCreneau = new Creneau();
        firstCreneau.setOrdre(0);
        firstCreneau.setPlage("Referent");
        creneauService.addCreneau(firstCreneau, evenement.getId());

    }

    String replaceText(String text, Evenement evenement){
        text = text.replaceAll("<event_name>", String.valueOf(evenement.getEventName()) );

        return text;
    }

    public Evenement update(Evenement evenement) {

        Evenement event = findById(evenement.getId());
        event.setEndDate(evenement.getEndDate());
        event.setEventName(evenement.getEventName());
        event.setContactTel(evenement.getContactTel());
        event.setContact(evenement.getContact());
        event.setContactEmail(evenement.getContactEmail());

        event.setAfficherMessage(evenement.isAfficherMessage());
        event.setMessage(evenement.getMessage());

        event.setPassword(evenement.getPassword());
        event.setSignature(evenement.getSignature());
        event.setValidation(evenement.getValidation());
        event.setLock(evenement.isLock());
        event.setNeedtel(evenement.getNeedtel());
        event.setSitepersourl(evenement.getSitepersourl());

        return evenementRepository.save(event);
    }

    public List<Evenement> findAll() {
        return evenementRepository.findAll();
    }

    public Evenement findById(Integer evenementId) {
        List<Evenement> evenements = evenementRepository.findAllById(evenementId);
        if(evenements == null){
            return null;
        }else{
            return evenements.get(0);
        }
    }

    public void deleteById(Integer evenementId) {
        evenementRepository.deleteById(evenementId);
    }

    public Boolean authorize(Integer evenementId, String password) {
        if(evenementId != null) {
            Evenement evenement = findById(evenementId);
            if (evenement.getPassword().equals(password)) {
                return true;
            }
        }
        return null;
    }

     public Boolean isOpen(Integer evenementId) {
        if(evenementId != null) {
            Evenement evenement = findById(evenementId);
            return evenement.isLock();
        }
        return null;
    }

    public Boolean updateOpening(Integer evenementId) {
        if(evenementId != null) {
            Evenement evenement = findById(evenementId);
            evenement.setLock(!evenement.isLock());
            return evenement.isLock();
        }
        return null;
    }

    @Scheduled(cron = "0 0 1 * * ?")
    public void reset() {
        logger.debug("reset");
        Calendar caldendat = Calendar.getInstance();
        caldendat.setTime(new Date());
        caldendat.add(Calendar.HOUR,24);
        caldendat.set(Calendar.HOUR,0);
        caldendat.set(Calendar.MINUTE,0);
        caldendat.set(Calendar.MILLISECOND,0);

        for (Evenement event:findAll()) {
            if(event.getEndDate().before(caldendat.getTime())) {
                for (Benevole ben : benevoleService.findByEvenementId(event.getId())) {
                    benevoleService.deleteById(ben.getId());
                }
            }
        }
    }

}

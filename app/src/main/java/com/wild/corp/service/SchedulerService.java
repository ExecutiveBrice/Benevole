package com.wild.corp.service;

import com.wild.corp.model.Benevole;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@EnableScheduling
@Configuration
@Slf4j
public class SchedulerService {

    @Autowired
    private BenevoleService benevoleService;


    @Autowired
    private EvenementService evenementService;

    @Autowired
    private EmailService emailService;

    @Scheduled(cron = "0 0 1 * * *")
    public void reset() {
        log.warn("reset");
        Calendar caldendat = Calendar.getInstance();
        caldendat.setTime(new Date());
        caldendat.add(Calendar.HOUR, 24);
        caldendat.set(Calendar.HOUR, 0);
        caldendat.set(Calendar.MINUTE, 0);
        caldendat.set(Calendar.MILLISECOND, 0);

        evenementService.findAll().forEach(evenement -> {
            if (evenement.getEndDate() != null && evenement.getEndDate().before(caldendat.getTime())) {
                log.info(evenement.getEventName());
                evenement.setEndDate(null);
                benevoleService.findByEvenementId(evenement.getId()).forEach(benevole -> {
                    benevoleService.deleteById(benevole.getId());
                });
            }
        });
    }

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void adviseBenevoles() {

        List<Benevole> benevoles = benevoleService.findBenevolesToAdvise();
        log.info("findBenevolesToAdvise " + benevoles.size());
        benevoles.forEach(benevole -> {
            benevole.setAdviseSent(true);
            log.info("send confirmation Email to " + benevole.getPrenom() + " " + benevole.getNom());

            String subject = "Validation de participation pour l'evenement : " + benevole.getEvenement().getEventName();

            StringBuilder corpsMessage = new StringBuilder();
            corpsMessage.append("Bonjour,<br />").append(benevole.getEvenement().getValidation()).append("<br />");
            corpsMessage.append("<br />");

            benevole.getCroisements().forEach(croisement -> {
                String nomStand = "tous".equals(croisement.getStand().getNom()) ? "N'importe quel stand" : croisement.getStand().getNom();
                corpsMessage.append(nomStand);
                corpsMessage.append("-");
                corpsMessage.append(croisement.getCreneau().getPlage());
                corpsMessage.append("<br />");
            });
            corpsMessage.append("<br />");
            corpsMessage.append(benevole.getEvenement().getSignature());
            corpsMessage.append("Comme précisé dans l'adresse mail, il ne sert à rien d'y répondre, veuillez utiliser le contact de cet évènement :<br />");
            corpsMessage.append(benevole.getEvenement().getContact());
            corpsMessage.append("-");
            corpsMessage.append(benevole.getEvenement().getContactEmail());
            corpsMessage.append("<br />");
            emailService.sendSimpleMessage(benevole.getPrenom(), benevole.getEmail(), subject, corpsMessage.toString());

        });
    }

}

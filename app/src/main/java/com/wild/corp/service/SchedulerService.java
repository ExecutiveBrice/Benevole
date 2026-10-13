package com.wild.corp.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Calendar;
import java.util.Date;
import java.time.Instant;

@EnableScheduling
@Configuration
@Slf4j
public class SchedulerService {

    @Autowired
    private BenevoleService benevoleService;


    @Autowired
    private EvenementService evenementService;

    @Autowired
    private ConfirmationService confirmationService;

    @Autowired
    private RecapitulatifEvenementService recapitulatifEvenementService;

   // @Scheduled(cron = "0 0 1 * * *", zone = "Europe/Paris")
    @Scheduled(cron = "0 * * * * *")
    public void recapitulatifEtReset() {
        Instant fin = RecapitulatifEvenementService.finPeriode(Instant.now());
        log.info("Recapitulatif et reset fin periode {}", fin);
        recapitulatifEvenementService.evenementsAEnvoyer(fin).forEach(evenementId -> {
            try {
                recapitulatifEvenementService.envoyer(evenementId, fin);
            } catch (Exception exception) {
                log.warn("Récapitulatif non traité pour l'évènement {}", evenementId, exception);
            }
        });
        // Le remplissage est récapitulé avant la purge de fin d'évènement.
        reset();
    }

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
                    benevoleService.deleteForReset(benevole.getId());
                });
            }
        });
    }

    @Scheduled(cron = "0 * * * * *")
    public void adviseBenevoles() {
        benevoleService.findBenevolesToAdvise().forEach(benevole -> {
            try {
                log.info("benevole to advise {}", benevole.getNom());
                confirmationService.confirm(benevole.getId());
            } catch (Exception exception) {
                log.warn("Confirmation non traitée pour le bénévole {}", benevole.getId());
            }
        });
    }
}

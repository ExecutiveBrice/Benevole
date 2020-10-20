package com.brice.corp.controller;



import com.brice.corp.model.Creneau;
import com.brice.corp.model.Evenement;
import com.brice.corp.service.CreneauService;
import com.brice.corp.service.EvenementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller de la vue globale
 */
@RestController
@RequestMapping("/evenement")
public class EvenementController {

    public static final Logger logger = LoggerFactory.getLogger(EvenementController.class);

    @Autowired
    private EvenementService evenementService;



    @RequestMapping(value = "/add", method = RequestMethod.POST)
    public ResponseEntity<Evenement> add(@RequestParam Evenement evenement) {
        logger.debug("add Evenement");
        evenementService.persist(evenement);

        if(evenement.getId() == null) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(evenement, HttpStatus.OK);
    }


    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public ResponseEntity<Evenement> update(@RequestParam Evenement evenement) {
        logger.debug("update Evenement");
        evenementService.persist(evenement);
        return new ResponseEntity<>(evenement, HttpStatus.OK);
    }



    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public ResponseEntity<List<Evenement>> getAll(@RequestParam Integer eventId) {
        logger.debug("getAll Evenement");
        List<Evenement> evenements = evenementService.findAll();

        if(evenements.isEmpty()) {
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(evenements, HttpStatus.OK);
    }


}

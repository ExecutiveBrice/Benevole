package com.wild.corp.controller;

import com.wild.corp.model.Evenement;
import com.wild.corp.service.EvenementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/evenement")
public class EvenementController {

    public static final Logger logger = LoggerFactory.getLogger(EvenementController.class);

    @Autowired
    private EvenementService evenementService;

    @RequestMapping(value = "/", method = RequestMethod.POST)
    public ResponseEntity<Evenement> add(@RequestBody Evenement evenement) {
        logger.debug("add Evenement");
        evenementService.persist(evenement);

        if(evenement.getId() == null) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(evenement, HttpStatus.OK);
    }

    @RequestMapping(value = "/updateAffiche", method = RequestMethod.PUT)
    public ResponseEntity<Evenement> updateAffiche(@RequestParam Integer id, @RequestBody String affiche) {
        logger.debug("updateAffiche Evenement");
        Evenement evenement = evenementService.updateAffiche(id, affiche);
        return new ResponseEntity<>(evenement, HttpStatus.OK);
    }

    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public ResponseEntity<Evenement> update(@RequestBody Evenement evenement) {
        logger.debug("update Evenement");
        evenementService.update(evenement);
        return new ResponseEntity<>(evenement, HttpStatus.OK);
    }

    @RequestMapping(value = "/", method = RequestMethod.DELETE)
    public ResponseEntity<?> delete(@RequestParam Integer id) {
        logger.debug("delete Evenement");
        evenementService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/getById", method = RequestMethod.GET)
    public ResponseEntity<Evenement> getById(@RequestParam Integer id) {
        logger.debug("getById Evenement id "+id);
        Evenement evenement = evenementService.findById(id);

        if(evenement == null) {
            logger.debug("event null");
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        }
        logger.debug("event not null");
        return new ResponseEntity<>(evenement, HttpStatus.OK);
    }

    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public ResponseEntity<List<Evenement>> getAll() {
        logger.debug("getAll Evenement");
        List<Evenement> evenements = evenementService.findAll();

        if(evenements.isEmpty()) {
            return new ResponseEntity(evenements, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(evenements, HttpStatus.OK);
    }

    @RequestMapping(value = "/isAuthorize", method = RequestMethod.GET)
    public ResponseEntity<Boolean> authorize(@RequestParam Integer id, @RequestParam String password) {
        logger.debug("authorize Evenement");
        Boolean authorisation = evenementService.authorize(id, password);
        return new ResponseEntity<>(authorisation, HttpStatus.OK);
    }

    @RequestMapping(value = "/isOpen", method = RequestMethod.GET)
    public ResponseEntity<Boolean> authorize(@RequestParam Integer id) {
        logger.debug("isOpen Evenement");
        Boolean isOpen = evenementService.isOpen(id);
        return new ResponseEntity<>(isOpen, HttpStatus.OK);
    }

    @RequestMapping(value = "/getAffiche", method = RequestMethod.GET)
    public ResponseEntity<String> getAffiche(@RequestParam Integer id) {
        logger.debug("getAffiche Evenement");
        String affiche = evenementService.getAffiche(id);
        return new ResponseEntity<>(affiche, HttpStatus.OK);
    }

    @RequestMapping(value = "/getLogo", method = RequestMethod.GET)
    public ResponseEntity<String> getLogo(@RequestParam Integer id) {
        logger.debug("getLogo Evenement");
        String affiche = evenementService.getLogo(id);
        return new ResponseEntity<>(affiche, HttpStatus.OK);
    }
    @RequestMapping(value = "/opening", method = RequestMethod.PUT)
    public ResponseEntity<Boolean> updateOpening(@RequestParam Integer id) {
        logger.debug("update opening Evenement");
        Boolean isOpen =  evenementService.updateOpening(id);
        return new ResponseEntity<>(isOpen, HttpStatus.OK);
    }

}

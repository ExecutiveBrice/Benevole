package com.brice.corp.controller;



import com.brice.corp.model.Benevole;
import com.brice.corp.service.BenevoleService;
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
@RequestMapping("/benevole")
public class BenevoleController {

    public static final Logger logger = LoggerFactory.getLogger(BenevoleController.class);

    @Autowired
    private BenevoleService benevoleService;



    @RequestMapping(value = "/add", method = RequestMethod.POST)
    public ResponseEntity<Benevole> add(@RequestParam Benevole benevole) {
        logger.debug("add Benevole");
        benevoleService.persist(benevole);

        if(benevole.getId() == null) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(benevole, HttpStatus.OK);
    }


    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public ResponseEntity<Benevole> update(@RequestParam Benevole benevole) {
        logger.debug("update Benevole");
        benevoleService.persist(benevole);
        return new ResponseEntity<>(benevole, HttpStatus.OK);
    }

    @RequestMapping(value = "/getByEvenementId", method = RequestMethod.GET)
    public ResponseEntity<List<Benevole>> getByEvenementId(@RequestParam Integer eventId) {
        logger.debug("getAll Benevole");
        List<Benevole> benevoles = benevoleService.findAll();

        if(benevoles.isEmpty()) {
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(benevoles, HttpStatus.OK);
    }

    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public ResponseEntity<List<Benevole>> getAll() {
        logger.debug("getAll Benevole");
        List<Benevole> benevoles = benevoleService.findAll();

        if(benevoles.isEmpty()) {
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(benevoles, HttpStatus.OK);
    }


}

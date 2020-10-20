package com.brice.corp.controller;



import com.brice.corp.model.Benevole;
import com.brice.corp.model.Creneau;
import com.brice.corp.service.BenevoleService;
import com.brice.corp.service.CreneauService;
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
@RequestMapping("/creneau")
public class CreneauController {

    public static final Logger logger = LoggerFactory.getLogger(CreneauController.class);

    @Autowired
    private CreneauService creneauService;



    @RequestMapping(value = "/add", method = RequestMethod.POST)
    public ResponseEntity<Creneau> add(@RequestParam Creneau creneau) {
        logger.debug("add Creneau");
        creneauService.persist(creneau);

        if(creneau.getId() == null) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(creneau, HttpStatus.OK);
    }


    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public ResponseEntity<Creneau> update(@RequestParam Creneau creneau) {
        logger.debug("update Creneau");
        creneauService.persist(creneau);
        return new ResponseEntity<>(creneau, HttpStatus.OK);
    }



    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public ResponseEntity<List<Creneau>> getAll(@RequestParam Integer eventId) {
        logger.debug("getAll Creneau");
        List<Creneau> creneaux = creneauService.findAll();

        if(creneaux.isEmpty()) {
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(creneaux, HttpStatus.OK);
    }


}

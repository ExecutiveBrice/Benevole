package com.wild.corp.controller;

import com.wild.corp.model.Evenement;
import com.wild.corp.service.EvenementService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/evenement")
public class EvenementController {

    @Autowired
    private EvenementService evenementService;

    @RequestMapping(value = "/", method = RequestMethod.POST)
    public ResponseEntity<Evenement> add(@RequestBody Evenement evenement) {
        evenementService.persist(evenement);

        if(evenement.getId() == null) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(evenement, HttpStatus.OK);
    }

    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public ResponseEntity<Evenement> update(@RequestBody Evenement evenement) {
        evenementService.update(evenement);
        return new ResponseEntity<>(evenement, HttpStatus.OK);
    }

    @RequestMapping(value = "/", method = RequestMethod.DELETE)
    public ResponseEntity<?> delete(@RequestParam Integer id) {
        evenementService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/getById", method = RequestMethod.GET)
    public ResponseEntity<Evenement> getById(@RequestParam Integer id) {
        Evenement evenement = evenementService.findById(id);

        if(evenement == null) {
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(evenement, HttpStatus.OK);
    }

    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public ResponseEntity<List<Evenement>> getAll() {
        List<Evenement> evenements = evenementService.findAll();

        if(evenements.isEmpty()) {
            return new ResponseEntity(evenements, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(evenements, HttpStatus.OK);
    }

    @RequestMapping(value = "/isAuthorize", method = RequestMethod.GET)
    public ResponseEntity<Boolean> isAuthorize(@RequestParam Integer id, @RequestParam String password) {
        Boolean authorisation = evenementService.authorize(id, password);
        return new ResponseEntity<>(authorisation, HttpStatus.OK);
    }

    @RequestMapping(value = "/isOpen", method = RequestMethod.GET)
    public ResponseEntity<Boolean> isOpen(@RequestParam Integer id) {
        Boolean isOpen = evenementService.isOpen(id);
        return new ResponseEntity<>(isOpen, HttpStatus.OK);
    }

    @RequestMapping(value = "/opening", method = RequestMethod.PUT)
    public ResponseEntity<Boolean> updateOpening(@RequestParam Integer id) {
        Boolean isOpen =  evenementService.updateOpening(id);
        return new ResponseEntity<>(isOpen, HttpStatus.OK);
    }

}

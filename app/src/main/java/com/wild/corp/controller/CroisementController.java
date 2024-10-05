package com.wild.corp.controller;


import com.wild.corp.model.Croisement;
import com.wild.corp.service.CroisementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/croisement")
public class CroisementController {
    @Autowired
    private CroisementService croisementService;

    @RequestMapping(value = "/", method = RequestMethod.POST)
    public ResponseEntity<Croisement> add(@RequestBody Croisement croisement) {
        croisementService.persist(croisement);

        if(croisement.getId() == null) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(croisement, HttpStatus.OK);
    }


    @RequestMapping(value = "/", method = RequestMethod.DELETE)
    public ResponseEntity<?> delete(@RequestParam Integer croisementId) {
        try {
            croisementService.delete(croisementId);
            return new ResponseEntity<>(HttpStatus.OK);
        }catch (RuntimeException runtimeException){

            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }



    }

    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public ResponseEntity<Croisement> update(@RequestBody Croisement croisement) {
        croisementService.persist(croisement);
        return new ResponseEntity<>(croisement, HttpStatus.OK);
    }



    @RequestMapping(value = "/getById", method = RequestMethod.GET)
    public ResponseEntity<Croisement> getById(@RequestParam Integer croisementId) {
        Croisement croisements = croisementService.findById(croisementId);

        if(croisements == null) {
            return new ResponseEntity(croisements, HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(croisements, HttpStatus.OK);
    }



    @RequestMapping(value = "/getByCreneau", method = RequestMethod.GET)
    public ResponseEntity<List<Croisement>> getByCreneau(@RequestParam Integer creneauId) {
        List<Croisement> croisements = croisementService.getCroisementByCreneau(creneauId);

        if(croisements.isEmpty()) {
            return new ResponseEntity(croisements, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(croisements, HttpStatus.OK);
    }



    @RequestMapping(value = "/getByBenevole", method = RequestMethod.GET)
    public ResponseEntity<List<Croisement>> getByBenevole(@RequestParam Integer benevoleId) {
        List<Croisement> croisements = croisementService.getCroisementByBenveole(benevoleId);

        if(croisements.isEmpty()) {
            return new ResponseEntity(croisements, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(croisements, HttpStatus.OK);
    }



    @RequestMapping(value = "/getByStand", method = RequestMethod.GET)
    public ResponseEntity<List<Croisement>> getByStand(@RequestParam Integer standId) {
        List<Croisement> croisements = croisementService.getCroisementByStand(standId);

        if(croisements.isEmpty()) {
            return new ResponseEntity(croisements, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(croisements, HttpStatus.OK);
    }

    @RequestMapping(value = "/getByEtat", method = RequestMethod.GET)
    public ResponseEntity<List<Croisement>> getByEtat(@RequestParam Integer etat, @RequestParam Integer eventId) {
        List<Croisement> croisements = croisementService.findByEtatAndEvenementId(etat, eventId);

        if(croisements.isEmpty()) {
            return new ResponseEntity(croisements, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(croisements, HttpStatus.OK);
    }

    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public ResponseEntity<List<Croisement>> getAll(@RequestParam Integer eventId) {
        List<Croisement> croisements = croisementService.getCroisementByEvenement(eventId);

        if(croisements.isEmpty()) {
            return new ResponseEntity(croisements, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(croisements, HttpStatus.OK);
    }


}

package com.wild.corp.controller;



import com.wild.corp.model.Creneau;
import com.wild.corp.service.CreneauService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import com.wild.corp.service.AccesParametrageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/creneau")
public class CreneauController {
    @Autowired
    private AccesParametrageService accesParametrageService;


    @Autowired
    private CreneauService creneauService;



    @RequestMapping(value = "/", method = RequestMethod.POST)
    public ResponseEntity<Creneau> add(@RequestBody Creneau creneau, @RequestParam Integer eventId, Authentication authentication) {
        accesParametrageService.evenement(authentication.getName(), eventId);
        if (creneau.getId() != null) accesParametrageService.creneau(authentication.getName(), creneau.getId());
        creneauService.addCreneau(creneau, eventId);

        if(creneau.getId() == null) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(creneau, HttpStatus.OK);
    }

    @RequestMapping(value = "/", method = RequestMethod.DELETE)
    public ResponseEntity<?> delete(@RequestParam Integer creneauId, Authentication authentication) {
        accesParametrageService.creneau(authentication.getName(), creneauId);
        creneauService.delete(creneauId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public ResponseEntity<Creneau> update(@RequestBody Creneau creneau, Authentication authentication) {
        accesParametrageService.creneau(authentication.getName(), creneau.getId());
        creneauService.updateCreneau(creneau);
        return new ResponseEntity<>(creneau, HttpStatus.OK);
    }


    @RequestMapping(value = "/getByGroup", method = RequestMethod.GET)
    public ResponseEntity<List<Creneau>> getByGroup(@RequestParam Integer group, @RequestParam Integer eventId) {
        List<Creneau> creneaux = creneauService.findByGroupeAndEvenementId(group, eventId);

        if(creneaux.isEmpty()) {
            return new ResponseEntity(creneaux, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(creneaux, HttpStatus.OK);
    }

    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public ResponseEntity<List<Creneau>> getAll(@RequestParam Integer eventId) {
        List<Creneau> creneaux = creneauService.findByEvenementId(eventId);

        if(creneaux.isEmpty()) {
            return new ResponseEntity(creneaux, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(creneaux, HttpStatus.OK);
    }


}

package com.wild.corp.controller;



import com.wild.corp.model.Benevole;
import com.wild.corp.service.BenevoleService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/benevole")
public class BenevoleController {

    @Autowired
    private BenevoleService benevoleService;

    @RequestMapping(value = "/", method = RequestMethod.POST)
    public ResponseEntity<Benevole> add(@RequestBody Benevole benevole, @RequestParam Integer eventId) {
        benevoleService.add(benevole, eventId );

        return new ResponseEntity<>(benevole, HttpStatus.OK);
    }


    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public ResponseEntity<Benevole> update(@RequestBody Benevole benevole) {
        benevoleService.update(benevole);
        return new ResponseEntity<>(benevole, HttpStatus.OK);
    }

    @RequestMapping(value = "/addToCroisement", method = RequestMethod.PUT)
    public ResponseEntity<Benevole> addToCroisement(@RequestParam Integer benevoleId, @RequestParam Integer croisementId, @RequestParam Boolean force) {
        try {
            Benevole benevole = benevoleService.addToCroisement(benevoleId, croisementId,force);
            return new ResponseEntity<>(benevole,HttpStatus.OK);
        } catch (RuntimeException e) {
            if(e.getMessage().equals("existe déjà")){
                return new ResponseEntity(null, HttpStatus.CONFLICT);
            } else{
                return new ResponseEntity(null, HttpStatus.NOT_ACCEPTABLE);
            }

        }

    }

    @RequestMapping(value = "/removeToCroisement", method = RequestMethod.PUT)
    public ResponseEntity<Benevole> removeToCroisement(@RequestParam Integer benevoleId, @RequestParam Integer croisementId) {

            Benevole benevole = benevoleService.removeToCroisement(benevoleId, croisementId);
            return new ResponseEntity<>(benevole,HttpStatus.OK);


    }

    @RequestMapping(value = "/byMail", method = RequestMethod.GET)
    public ResponseEntity<Benevole> getByMail(@RequestParam String email, @RequestParam Integer eventId) {
        Benevole benevole = benevoleService.findByEmail(email,eventId );

        if(benevole == null) {
            return new ResponseEntity(benevole, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(benevole, HttpStatus.OK);
    }

    @RequestMapping(value = "/getById", method = RequestMethod.GET)
    public ResponseEntity<Benevole> getById(@RequestParam Integer id) {
        Benevole benevole = benevoleService.findById(id);

        if(benevole == null) {
            return new ResponseEntity(benevole, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(benevole, HttpStatus.OK);
    }

    @RequestMapping(value = "/getByEvenementId", method = RequestMethod.GET)
    public ResponseEntity<List<Benevole>> getByEvenementId(@RequestParam Integer eventId) {
        List<Benevole> benevoles = benevoleService.findByEvenementId(eventId);

        if(benevoles.isEmpty()) {
            return new ResponseEntity(benevoles, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(benevoles, HttpStatus.OK);
    }

    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public ResponseEntity<List<Benevole>> getAll() {
        List<Benevole> benevoles = benevoleService.findAll();

        if(benevoles.isEmpty()) {
            return new ResponseEntity(new ArrayList<>(), HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(benevoles, HttpStatus.OK);
    }

    @RequestMapping(value = "/deleteById", method = RequestMethod.DELETE)
    public ResponseEntity<?> getAll(@RequestParam Integer benevoleId) {
        benevoleService.deleteById(benevoleId);

        return new ResponseEntity<>( HttpStatus.OK);
    }

}

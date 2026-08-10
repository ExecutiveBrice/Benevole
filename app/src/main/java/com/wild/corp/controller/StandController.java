package com.wild.corp.controller;


import com.wild.corp.model.Ressources.StandRessource;
import com.wild.corp.model.Stand;
import com.wild.corp.service.StandService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/stand")
public class StandController {

    @Autowired
    private StandService standService;


    @RequestMapping(value = "/", method = RequestMethod.DELETE)
    public ResponseEntity<?> delete(@RequestParam Integer standId) {

        try {
            standService.delete(standId);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (RuntimeException runtimeException) {

            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    public ResponseEntity<Stand> add(@RequestBody Stand stand, @RequestParam Integer eventId) {

        standService.addStand(stand, eventId);

        if (stand.getId() == null) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(stand, HttpStatus.OK);
    }


    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public ResponseEntity<Stand> update(@RequestBody StandRessource stand) {
        log.info("getId "+stand.getId());
log.info("getNom "+stand.getNom());
        log.info("getSoustitre "+stand.getSoustitre());

        log.info("getType "+stand.getType());
        log.info("getOrdre "+stand.getOrdre());
        log.info("getCroisements "+stand.getCroisements().size());



        return new ResponseEntity<>(standService.update(stand), HttpStatus.OK);
    }


    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public ResponseEntity<List<Stand>> getAll(@RequestParam Integer eventId) {

        List<Stand> stands = standService.findByEvenementId(eventId);

        if (stands.isEmpty()) {
            return new ResponseEntity(stands, HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(stands, HttpStatus.OK);
    }


}

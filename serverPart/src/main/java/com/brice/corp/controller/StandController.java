package com.brice.corp.controller;



import com.brice.corp.model.Stand;
import com.brice.corp.service.StandService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de la vue globale
 */
@RestController
@RequestMapping("/stand")
public class StandController {

    public static final Logger logger = LoggerFactory.getLogger(StandController.class);

    @Autowired
    private StandService standService;



    @RequestMapping(value = "/", method = RequestMethod.POST)
    public ResponseEntity<Stand> add(@RequestBody Stand stand) {
        logger.debug("add Stand");
        standService.persist(stand);

        if(stand.getId() == null) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(stand, HttpStatus.OK);
    }


    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public ResponseEntity<Stand> update(@RequestBody Stand stand) {
        logger.debug("update Stand");
        standService.persist(stand);
        return new ResponseEntity<>(stand, HttpStatus.OK);
    }



    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public ResponseEntity<List<Stand>> getAll(@RequestParam Integer eventId) {
        logger.debug("getAll Stand");
        List<Stand> stands = standService.findAll();

        if(stands.isEmpty()) {
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(stands, HttpStatus.OK);
    }


}

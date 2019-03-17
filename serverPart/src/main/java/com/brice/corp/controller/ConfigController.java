package com.brice.corp.controller;



import com.brice.corp.model.Config;
import com.brice.corp.service.ConfigService;
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
@RequestMapping("/config")
public class ConfigController {

    public static final Logger logger = LoggerFactory.getLogger(ConfigController.class);

    @Autowired
    private ConfigService configService;




    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public ResponseEntity<Config> update(@RequestParam Config config) {
        logger.debug("update Config "+config.getParam());
        configService.persist(config);
        return new ResponseEntity<>(config, HttpStatus.OK);
    }


    @RequestMapping(value = "/", method = RequestMethod.GET)
    public ResponseEntity<Config> getByParamAndEvenementId(@RequestParam String param, @RequestParam Integer evenementId) {
        logger.debug("getByParamAndEvenementId "+param+" and "+evenementId);
        Config config = configService.getByParamAndEvenementId(param, evenementId);
        return new ResponseEntity<>(config, HttpStatus.OK);
    }

    @RequestMapping(value = "/getAll", method = RequestMethod.GET)
    public ResponseEntity<List<Config>> getAll() {
        logger.debug("getAll Config");
        List<Config> stands = configService.findAll();

        if(stands.isEmpty()) {
            return new ResponseEntity(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(stands, HttpStatus.OK);
    }


}
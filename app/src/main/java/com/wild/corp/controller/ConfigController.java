package com.wild.corp.controller;



import com.wild.corp.model.Ressources.Params;
import com.wild.corp.service.ConfigService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/config")
public class ConfigController {

    @Autowired
    private ConfigService configService;
    @Autowired
    private Environment environment;
    @RequestMapping(value = "/getParams", method = RequestMethod.GET)
    public ResponseEntity<Params> getParams() {

        Params params = configService.getParams();

        return new ResponseEntity<>(params, HttpStatus.OK);
    }


    @RequestMapping(value = "/getProps", method = RequestMethod.GET)
    public ResponseEntity< Map<String, String>> getProps() {



        Map<String, String> params = new HashMap<>();
        params.put("spring.mail.username", Objects.requireNonNull(environment.getProperty("spring.mail.username")));

        return new ResponseEntity<>(params, HttpStatus.OK);
    }



}

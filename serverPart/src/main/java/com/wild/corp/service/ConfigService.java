package com.wild.corp.service;

import com.wild.corp.configuration.Constante;
import com.wild.corp.repositories.EvenementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service("ConfigService")
@Transactional
public class ConfigService {

    public static final Logger logger = LoggerFactory.getLogger(EvenementService.class);

    @Autowired
    private EvenementRepository evenementRepository;
    @Autowired
    private Environment environment;

    public Map<String, String> getParams() {
        Map<String, String> params = new HashMap<>();

        params.put("url", Constante.URL);
        params.put("title", Constante.TITLE);
        params.put("header", Constante.HEADER);
        params.put("using", Constante.USING);
        params.put("managing", Constante.MANAGING);
        params.put("signature", Constante.SIGNATURE);

    return params;
    }

}

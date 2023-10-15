package com.wild.corp.service;

import com.wild.corp.configuration.Constante;
import com.wild.corp.repositories.EvenementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service("ConfigService")
@Transactional
public class ConfigService {

    @Autowired
    private EvenementRepository evenementRepository;

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

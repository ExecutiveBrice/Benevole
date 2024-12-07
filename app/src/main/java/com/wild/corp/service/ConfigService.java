package com.wild.corp.service;

import com.wild.corp.configuration.Constante;
import com.wild.corp.model.Ressources.Params;
import com.wild.corp.repositories.EvenementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("ConfigService")
@Transactional
public class ConfigService {

    @Autowired
    private EvenementRepository evenementRepository;

    @Value("${DNS_NAME}")
    private String DNS_NAME;

    public Params getParams() {

        Params params = new Params();
        params.setHeader(Constante.HEADER);
        params.setTitle(Constante.TITLE);
        params.setUrl("https://"+DNS_NAME+"/benevoles/");
        params.setUsing(Constante.USING);
        params.setSignature(Constante.SIGNATURE);
        params.setManaging(Constante.MANAGING);


    return params;
    }

}

package com.brice.corp.service;


import com.brice.corp.model.Config;
import com.brice.corp.repositories.ConfigRepository;
import com.brice.corp.repositories.StandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Classe implémentant les services IG
 */
@Service("ConfigService")
@Transactional
public class ConfigServiceImpl implements ConfigService {


    @Autowired
    private ConfigRepository configRepository;


    @Override
    public void persist(Config child) {
        configRepository.save(child);
    }

    @Override
    public Config getByParamAndEvenementId(String param, Integer evenementId) {

         Config config = configRepository.getByParamAndEvenementId(param, evenementId);
         if (config == null){
             config = new Config();
             config.setParam(param);
         }
         return  config;
    }

    @Override
    public List<Config> findByEvenementId(Integer evenementId){
        return configRepository.findByEvenementId(evenementId);
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public List<Config> findAll() {
        return configRepository.findAll();
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public Config findById(Integer childId) {
        return configRepository.getOne(childId);
    }

}

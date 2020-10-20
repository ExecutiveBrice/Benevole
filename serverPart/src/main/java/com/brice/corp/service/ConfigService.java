package com.brice.corp.service;


import com.brice.corp.model.Config;

import java.util.List;

/**
 * Classe des services portant sur les IG
 */
public interface ConfigService {

    void persist(Config child);

    Config getByParamAndEvenementId(String param, Integer evenementId);

    List<Config> findByEvenementId(Integer evenementId);

    List<Config> findAll();

    Config findById(Integer childId);
}

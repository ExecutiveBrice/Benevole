package com.brice.corp.repositories;


import com.brice.corp.model.Config;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


/**
 * Classe d'encapsulation de la couche DAO PM
 */
@Repository
public interface ConfigRepository extends JpaRepository<Config, Integer> {

    Config getOne(Integer id);

    Config getByParamAndEvenementId(String param, Integer evenementId);

    List<Config> findByEvenementId(Integer evenementId);


    List<Config> findAll();
}

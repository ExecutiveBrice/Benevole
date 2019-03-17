package com.brice.corp.repositories;


import com.brice.corp.model.Benevole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


/**
 * Classe d'encapsulation de la couche DAO PM
 */
@Repository
public interface BenevoleRepository extends JpaRepository<Benevole, Integer> {

    Benevole getOne(Integer childId);


    List<Benevole> findByEvenementId(Integer evenementId);

    List<Benevole> findAll();
}
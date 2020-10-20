package com.brice.corp.repositories;


import com.brice.corp.model.Creneau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


/**
 * Classe d'encapsulation de la couche DAO PM
 */
@Repository
public interface CreneauRepository extends JpaRepository<Creneau, Integer> {


    List<Creneau> findByEvenementId(Integer evenementId);

    List<Creneau> findAll();
}

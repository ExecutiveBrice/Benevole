package com.brice.corp.service;


import com.brice.corp.model.Stand;


import java.util.List;

/**
 * Classe des services portant sur les IG
 */
public interface StandService {

    void persist(Stand child);

    List<Stand> findByEvenementId(Integer evenementId);

    List<Stand> findAll();

    Stand findById(Integer childId);
}

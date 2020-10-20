package com.brice.corp.service;

import com.brice.corp.model.Evenement;

import java.util.List;

/**
 * Classe des services portant sur les IG
 */
public interface EvenementService {

    void persist(Evenement child);

    List<Evenement> findAll();

    Evenement findById(Integer childId);
}

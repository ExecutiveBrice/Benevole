package com.wild.corp.service;

import com.wild.corp.model.Evenement;

import java.util.List;

public interface EvenementService {

    void persist(Evenement evenement);

    List<Evenement> findAll();

    Evenement update(Evenement evenement);

    Evenement findById(Integer evenementId);

    Evenement updateAffiche(Integer evenementId, String affiche);

    void deleteById(Integer evenementId);

    void reset();

    Boolean authorize(Integer evenementId, String password);

    Boolean isOpen(Integer evenementId);

    String getAffiche(Integer evenementId);

    String getLogo(Integer evenementId);


    Boolean updateOpening(Integer evenementId);

}

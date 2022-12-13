package com.wild.corp.service;


import com.wild.corp.model.Creneau;

import java.util.List;

public interface CreneauService {

    void persist(Creneau creneau);

    void addCreneau(Creneau creneau, Integer evenementId);

    void updateCreneau(Creneau creneau);

    void delete(Integer idCreneau);

    List<Creneau> findByGroupeAndEvenementId(Integer groupe, Integer evenementId);

    List<Creneau> findByEvenementId(Integer evenementId);

    List<Creneau> findAll();

    Creneau findById(Integer childId);
}

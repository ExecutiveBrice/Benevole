package com.brice.corp.service;


import com.brice.corp.model.Evenement;
import com.brice.corp.repositories.EvenementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Classe implémentant les services IG
 */
@Service("EvenementService")
@Transactional
public class EvenementServiceImpl implements EvenementService {


    @Autowired
    private EvenementRepository evenementRepository;


    @Override
    public void persist(Evenement child) {
        evenementRepository.save(child);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Evenement> findAll() {
        return evenementRepository.findAll();
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public Evenement findById(Integer childId) {
        return evenementRepository.getOne(childId);
    }

}

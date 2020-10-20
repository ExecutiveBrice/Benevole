package com.brice.corp.service;


import com.brice.corp.model.Stand;

import com.brice.corp.repositories.StandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

/**
 * Classe implémentant les services IG
 */
@Service("StandService")
@Transactional
public class StandServiceImpl implements StandService {


    @Autowired
    private StandRepository standRepository;


    @Override
    public void persist(Stand child) {
        standRepository.save(child);
    }

     /**
     * {@inheritDoc}
     */
    @Override
    public List<Stand> findAll() {
        return standRepository.findAll();
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public Stand findById(Integer childId) {
        return standRepository.getOne(childId);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Stand> findByEvenementId(Integer evenementId) {
        return standRepository.findByEvenementId(evenementId);
    }


}

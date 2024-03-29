package com.wild.corp.repositories;



import com.wild.corp.model.Stand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StandRepository extends JpaRepository<Stand, Integer> {

    List<Stand> findAll();

    List<Stand> findByEvenementId(Integer evenementId);
}

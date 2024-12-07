package com.wild.corp.repositories;

import com.wild.corp.model.Benevole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BenevoleRepository extends JpaRepository<Benevole, Integer> {

    Benevole findByEmailAndEvenementId(String email, Integer evenementId);

    List<Benevole> findByEvenementId(Integer evenementId);

    List<Benevole> findAll();
}

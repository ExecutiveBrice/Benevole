package com.wild.corp.repositories;

import com.wild.corp.model.Benevole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BenevoleRepository extends JpaRepository<Benevole, Integer> {

    Benevole getOne(Integer benevoleId);

    Benevole findByEmailAndEvenementId(String email, Integer evenementId);

//    @Query("SELECT b FROM Benevole b WHERE b.evenement.id = :evenementId")
//    List<Benevole> findByEvenementId(@Param("evenementId") Integer evenementId);

    List<Benevole> findByEvenementId(Integer evenementId);

    List<Benevole> findAll();
}

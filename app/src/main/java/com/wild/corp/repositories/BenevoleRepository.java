package com.wild.corp.repositories;

import com.wild.corp.model.Benevole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BenevoleRepository extends JpaRepository<Benevole, Integer> {

    Benevole findByEmailAndEvenementId(String email, Integer evenementId);

    List<Benevole> findByEvenementId(Integer evenementId);

    List<Benevole> findAll();

    @Query("SELECT b FROM Benevole b WHERE b.dateMaj < :nowMinusFiveMin AND b.adviseSent = false ")
    List<Benevole> findBenevolesToAdvise(@Param("nowMinusFiveMin")  LocalDateTime nowMinusFiveMin);
}

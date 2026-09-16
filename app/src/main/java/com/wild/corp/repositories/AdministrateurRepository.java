package com.wild.corp.repositories;

import com.wild.corp.model.Administrateur;
import com.wild.corp.model.Evenement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AdministrateurRepository extends JpaRepository<Administrateur, Integer> {

    Optional<Administrateur> findByUsername(String username);

    Optional<Administrateur> findByUsernameIgnoreCase(String username);

    boolean existsByUsername(String username);

    @Query("select e from Administrateur a join a.evenements e where a.username = :username")
    List<Evenement> findEvenementsByUsername(String username);
}

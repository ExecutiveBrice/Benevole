package com.wild.corp.repositories;

import com.wild.corp.model.Administrateur;
import com.wild.corp.model.Evenement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface AdministrateurRepository extends JpaRepository<Administrateur, Integer> {

    Optional<Administrateur> findByUsername(String username);

    Optional<Administrateur> findByUsernameIgnoreCase(String username);

    boolean existsByUsername(String username);

    @Query("select e from Administrateur a join a.evenements e where a.username = :username")
    List<Evenement> findEvenementsByUsername(String username);

    /** Migration de l'ancien modèle où l'absence d'évènement signifiait accès global. */
    @Modifying
    @Transactional
    @Query("update Administrateur a set a.superadmin = true where a.superadmin = false and a.evenements is empty")
    void migrerAdministrateursGlobauxHistoriques();
}

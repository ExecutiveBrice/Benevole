package com.wild.corp.repositories;

import com.wild.corp.model.MouvementBenevole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface MouvementBenevoleRepository extends JpaRepository<MouvementBenevole, Long> {
    @Query("select distinct m.evenement.id from MouvementBenevole m where m.evenement.recapitulatifQuotidien = true and m.envoyeLe is null and m.survenuLe < :fin")
    List<Integer> findEvenementsARecapituler(@Param("fin") Instant fin);

    List<MouvementBenevole> findByEvenementIdAndEnvoyeLeIsNullAndSurvenuLeBeforeOrderBySurvenuLeAscIdAsc(
            Integer evenementId, Instant fin);
}

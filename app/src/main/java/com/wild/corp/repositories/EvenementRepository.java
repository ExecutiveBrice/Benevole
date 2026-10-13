package com.wild.corp.repositories;



import com.wild.corp.model.Evenement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvenementRepository extends JpaRepository<Evenement, Integer> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Evenement e where e.id = :id")
    java.util.Optional<Evenement> findForRecapitulatif(@org.springframework.data.repository.query.Param("id") Integer id);


    List<Evenement> findAllById(Integer evenementId);

    void deleteById(Integer evenementId);

/*
    @Query("SELECT c FROM Child c WHERE c.name = :name AND c.firstName = :firstName")
    Evenement findByNameAndFirstname(@Param("name") String name, @Param("firstName") String firstName);
*/

    List<Evenement> findAll();
}

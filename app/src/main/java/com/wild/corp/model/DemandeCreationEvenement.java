package com.wild.corp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/** Demande publique, à valider par un super-administrateur avant toute création d'évènement. */
@Entity
@Data
@NoArgsConstructor
@Table(name = "DEMANDE_CREATION_EVENEMENT")
public class DemandeCreationEvenement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String eventName;
    private String contact;
    private String contactEmail;
    private String contactTel;
    private Date endDate;
    private String sitepersourl;
    private Date dateDemande;
}

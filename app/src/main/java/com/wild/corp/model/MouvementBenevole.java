package com.wild.corp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** Instantané indépendant du bénévole et du créneau, conservé après leur suppression. */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "mouvement_benevole", indexes = {
        @Index(name = "idx_mouvement_recap", columnList = "evenement_id, envoye_le, survenu_le")
})
public class MouvementBenevole {
    public enum Type { CREATION, INSCRIPTION, DESINSCRIPTION, SUPPRESSION }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Evenement evenement;

    @Column(name = "survenu_le", nullable = false)
    private Instant survenuLe;

    @Column(name = "envoye_le")
    private Instant envoyeLe;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    private Integer benevoleId;
    private String prenom;
    private String nom;
    private String email;
    private String telephone;
    private String stand;
    private String creneau;
}

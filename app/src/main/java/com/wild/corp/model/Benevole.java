package com.wild.corp.model;


import com.fasterxml.jackson.annotation.*;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Table(name = "BENEVOLE")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Benevole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @Column(name = "PRENOM")
    private String prenom;

    @Column(name = "NOM")
    private String nom;

    @Column(name = "TELEPHONE")
    private String telephone;

    @Column(name = "EMAIL", nullable = false)
    private String email;

    @Column(name = "COMMENTAIRE")
    private String commentaire;

    @Column(name = "REPONSE")
    private String reponse;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.EAGER)
    @ToString.Exclude
    private List<Croisement> croisements;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"affiche", "sitepersologo"})
    @ToString.Exclude
    private Evenement evenement;

}

package com.wild.corp.model;


import com.fasterxml.jackson.annotation.*;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
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

    @Column(name = "DATE_MAJ")
    private LocalDateTime dateMaj;

    @ManyToMany
    @JsonIgnoreProperties({"benevoles"})
    private List<Croisement> croisements;

    @JsonIgnore
    @ManyToOne
    @ToString.Exclude
    private Evenement evenement;

}

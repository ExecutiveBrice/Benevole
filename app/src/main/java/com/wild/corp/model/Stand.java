package com.wild.corp.model;

import com.fasterxml.jackson.annotation.*;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Objects;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Table(name = "STAND")
public class Stand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @Column(name = "NOM", nullable = false)
    private String nom;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "BULLE")
    private String bulle;

    @Column(name = "ORDRE")
    private Integer ordre;

    @Column(name = "TYPE")
    private Integer type;

    @JsonIgnore
    @OneToMany(mappedBy="stand", orphanRemoval=true)
    private List<Croisement> croisements;

    @JsonIgnore
    @ManyToOne
    private Evenement evenement;

}

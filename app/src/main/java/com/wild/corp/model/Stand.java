package com.wild.corp.model;

import com.fasterxml.jackson.annotation.*;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "STAND")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Stand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @Column(name = "NOM", nullable = false)
    private String nom;

    @Column(name = "ORDRE")
    private Integer ordre;

    @Column(name = "TYPE")
    private Integer type;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @ToString.Exclude
    private Evenement evenement;

    @OneToMany(mappedBy="stand", orphanRemoval=true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"stand"})
    @ToString.Exclude
    private List<Croisement> croisements;



}

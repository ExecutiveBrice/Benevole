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
@Table(name = "STAND")
@JsonIgnoreProperties(ignoreUnknown = true)
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
    @OneToMany(mappedBy="stand", orphanRemoval=true, fetch = FetchType.EAGER)
    @ToString.Exclude
    private List<Croisement> croisements;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"affiche", "sitepersologo"})
    @ToString.Exclude
    private Evenement evenement;

}

package com.wild.corp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;


@Entity
@Data
@NoArgsConstructor
@Table(name = "CRENEAU")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Creneau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @Column(name = "PLAGE", nullable = false)
    private String plage;

    @Column(name = "ORDRE")
    private Integer ordre;

    @OneToMany(mappedBy="creneau", orphanRemoval=true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"stand"})
    @ToString.Exclude
    private List<Croisement> croisements;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @ToString.Exclude
    private Evenement evenement;

}

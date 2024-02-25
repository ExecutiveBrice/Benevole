package com.wild.corp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
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

    @Column(name = "GROUPE")
    private Integer groupe;

    @Column(name = "CHEVAUCHEMENT")
    private Integer[] chevauchement;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"affiche", "sitepersologo"})
    @ToString.Exclude
    private Evenement evenement;

}

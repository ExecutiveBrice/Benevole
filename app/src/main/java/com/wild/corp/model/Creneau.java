package com.wild.corp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.Objects;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Table(name = "CRENEAU")
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
    @ManyToOne
    private Evenement evenement;

}

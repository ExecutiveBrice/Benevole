package com.wild.corp.model;



import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "CROISEMENT")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Croisement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @Column(name = "LIMITE", nullable = false)
    private Integer limite;

    @Column(name = "BESOIN", nullable = false)
    private Boolean besoin;

    @ManyToMany(mappedBy="croisements")
    @JsonIgnoreProperties({"croisements", "evenement", "telephone", "email"})
    private List<Benevole> benevoles;

    @ManyToOne
    @JsonIgnoreProperties({"croisements"})
    private Stand stand;

    @ManyToOne
    @JsonIgnoreProperties({"croisements"})
    private Creneau creneau;



}

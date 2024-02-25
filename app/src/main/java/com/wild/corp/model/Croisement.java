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
@AllArgsConstructor
@EqualsAndHashCode
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

    @Column(name = "SELECTED", nullable = false)
    private Boolean selected;

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"croisements", "evenement"})
    private Stand stand;

    @ManyToOne(fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"evenement"})
    private Creneau creneau;

    @ManyToMany(mappedBy="croisements", fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"croisements", "evenement"})
    private List<Benevole> benevoles;

}

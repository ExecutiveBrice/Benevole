package com.brice.corp.model;

import javax.persistence.*;
import java.util.List;


@Entity
@Table(name = "STAND")
public class Stand implements java.io.Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @Column(name = "NOM", nullable = false)
    private Integer nom;

    @Column(name = "DESCRIPTION")
    private Integer description;

    @Column(name = "ETAT", nullable = false)
    private Integer etat;

    @Column(name = "ORDRE", nullable = false)
    private Integer ordre;

    @Column(name = "BULLE")
    private Integer bulle;

    @OneToMany(mappedBy="stand")
    private List<Croisement> croisements;

    @ManyToOne
    private Evenement evenement;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getNom() {
        return nom;
    }

    public void setNom(Integer nom) {
        this.nom = nom;
    }

    public Integer getDescription() {
        return description;
    }

    public void setDescription(Integer description) {
        this.description = description;
    }

    public Integer getEtat() {
        return etat;
    }

    public void setEtat(Integer etat) {
        this.etat = etat;
    }

    public Integer getOrdre() {
        return ordre;
    }

    public void setOrdre(Integer ordre) {
        this.ordre = ordre;
    }

    public Integer getBulle() {
        return bulle;
    }

    public void setBulle(Integer bulle) {
        this.bulle = bulle;
    }

    public List<Croisement> getCroisements() {
        return croisements;
    }

    public void setCroisements(List<Croisement> croisements) {
        this.croisements = croisements;
    }

    public Evenement getEvenement() {
        return evenement;
    }

    public void setEvenement(Evenement evenement) {
        this.evenement = evenement;
    }
}

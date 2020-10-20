package com.brice.corp.model;

import javax.persistence.*;

import java.util.List;



@Entity
@Table(name = "CRENEAU")
public class Creneau implements java.io.Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @Column(name = "PLAGE", nullable = false)
    private Integer plage;

    @Column(name = "ORDRE", nullable = false)
    private Integer ordre;

    @Column(name = "GROUPE")
    private Integer groupe;

    @Column(name = "CHEVAUCHEMENT")
    private String chevauchement;

    @OneToMany(mappedBy="creneau")
    private List<Croisement> croisements;

    @ManyToOne
    private Evenement evenement;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getPlage() {
        return plage;
    }

    public void setPlage(Integer plage) {
        this.plage = plage;
    }

    public Integer getOrdre() {
        return ordre;
    }

    public void setOrdre(Integer ordre) {
        this.ordre = ordre;
    }

    public Integer getGroupe() {
        return groupe;
    }

    public void setGroupe(Integer groupe) {
        this.groupe = groupe;
    }

    public String getChevauchement() {
        return chevauchement;
    }

    public void setChevauchement(String chevauchement) {
        this.chevauchement = chevauchement;
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

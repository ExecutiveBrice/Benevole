package com.brice.corp.model;

import javax.persistence.*;
import java.util.List;


@Entity
@Table(name = "CROISEMENT")
public class Croisement implements java.io.Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @Column(name = "LIMITE", nullable = false)
    private Integer limite;

    @Column(name = "BESOIN", nullable = false)
    private Integer besoin;

    @Column(name = "SELECTED", nullable = false)
    private Integer selected;

    @ManyToOne
    private Stand stand;

    @ManyToOne
    private Creneau creneau;

    @ManyToMany(mappedBy="croisements")
    private List<Benevole> benvoles;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getLimite() {
        return limite;
    }

    public void setLimite(Integer limite) {
        this.limite = limite;
    }

    public Integer getBesoin() {
        return besoin;
    }

    public void setBesoin(Integer besoin) {
        this.besoin = besoin;
    }

    public Integer getSelected() {
        return selected;
    }

    public void setSelected(Integer selected) {
        this.selected = selected;
    }

    public Stand getStand() {
        return stand;
    }

    public void setStand(Stand stand) {
        this.stand = stand;
    }

    public Creneau getCreneau() {
        return creneau;
    }

    public void setCreneau(Creneau creneau) {
        this.creneau = creneau;
    }

}

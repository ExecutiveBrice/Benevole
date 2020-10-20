package com.brice.corp.model;

import javax.persistence.*;


@Entity
@Table(name = "EVENEMENT")
public class Evenement implements java.io.Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @Column(name = "PRENOM", nullable = false)
    private Integer prenom;

    @Column(name = "NOM", nullable = false)
    private Boolean nom;

    @Column(name = "TELEPHONE")
    private Boolean telephone;

    @Column(name = "EMAIL", nullable = false)
    private Boolean email;

    @Column(name = "COMMENTAIRE")
    private Boolean commentaire;

    @Column(name = "REPONSE")
    private Boolean reponse;


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getPrenom() {
        return prenom;
    }

    public void setPrenom(Integer prenom) {
        this.prenom = prenom;
    }

    public Boolean getNom() {
        return nom;
    }

    public void setNom(Boolean nom) {
        this.nom = nom;
    }

    public Boolean getTelephone() {
        return telephone;
    }

    public void setTelephone(Boolean telephone) {
        this.telephone = telephone;
    }

    public Boolean getEmail() {
        return email;
    }

    public void setEmail(Boolean email) {
        this.email = email;
    }

    public Boolean getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(Boolean commentaire) {
        this.commentaire = commentaire;
    }

    public Boolean getReponse() {
        return reponse;
    }

    public void setReponse(Boolean reponse) {
        this.reponse = reponse;
    }
}

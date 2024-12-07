package com.wild.corp.model.Ressources;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.wild.corp.model.Benevole;
import com.wild.corp.model.Creneau;
import com.wild.corp.model.Stand;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;


@Data
@NoArgsConstructor
public class Evenement {

    private Integer id;

    private String contact;

    private String contactTel;

    private String contactEmail;

    private String eventName;

    private Date endDate;

    private String sitepersourl;

    private String password;

    private String validation;

    private String signature;

    private boolean afficherMessage;

    private String message;

    @Column(name = "NEEDTEL")
    private Boolean needtel;

    @Column(name = "LOCK")
    private boolean lock;

    @Column(name = "couleur_fond")
    private String couleurFond;

    @Column(name = "couleur_bandeau")
    private String couleurBandeau;

    @Column(name = "couleur_titre")
    private String couleurTitre;

    @Column(name = "couleur_bloc")
    private String couleurBloc;

    @JsonIgnore
    @OneToMany(mappedBy="evenement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Benevole> benevoles;

    @JsonIgnore
    @OneToMany(mappedBy="evenement" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Creneau> creneaus;

    @JsonIgnore
    @OneToMany(mappedBy="evenement" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Stand> stands;


}

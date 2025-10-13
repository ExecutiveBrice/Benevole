package com.wild.corp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "EVENEMENT")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Evenement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String contact;

    private String contactTel;

    private String contactEmail;

    private String eventName;

    private Date endDate;

    private String sitepersourl;

    @JsonIgnore
    private String password;

    private String validation;

    private String signature;

    private boolean afficherMessageAccueil;

    private String messageAccueil;

    private boolean afficherMessagePlanning;
    private String messagePlanning;

    private boolean afficherMessageInfo;

    private String messageInfo;

    private boolean afficherBenevoles;


    private Boolean basique;

    private Boolean needtel;

    private Boolean copie;

    private Boolean notification;

    private boolean lock;

    private String couleurFond;

    private String couleurBandeau;

    private String couleurText;

    private String couleurTitre;

    private String couleurCard;

    private String couleurBloc;

    private String titleFont;

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

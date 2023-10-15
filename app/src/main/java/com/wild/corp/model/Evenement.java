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
import java.util.Objects;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Table(name = "EVENEMENT")
public class Evenement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @Column(name = "CONTACT", nullable = false)
    private String contact;

    @Column(name = "CONTACT_TEL")
    private String contactTel;

    @Column(name = "CONTACT_EMAIL", nullable = false)
    private String contactEmail;

    @Column(name = "EVENT_NAME", nullable = false)
    private String eventName;

    @Column(name = "START_DATE", nullable = false)
    private Date startDate;

    @Column(name = "END_DATE")
    private Date endDate;

    @Column(name = "RAPPEL_DATE")
    private Date rappelDate;

    @Lob
    @Column(name = "IMAGE")
    private String affiche;

    @Column(name = "SITEPERSOURL")
    private String sitepersourl;

    @Lob
    @Column(name = "SITEPERSOLOGO")
    private String sitepersologo;

    @Column(name = "PASSWORD", nullable = false)
    private String password;

    @Column(name = "VALIDATION")
    private String validation;

    @Column(name = "RETOUR")
    private String retour;

    @Column(name = "SIGNATURE")
    private String signature;

    @Column(name = "RAPPEL")
    private String rappel;

    @Column(name = "NEEDTEL")
    private Boolean needtel;
    @Column(name = "LOCK")
    private boolean lock;

    //@JsonIgnoreProperties({"prenom","nom","telephone","email","commentaire","reponse", "evenement" })
    @JsonIgnore
    @OneToMany(mappedBy="evenement" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Benevole> benevoles;

    @JsonIgnore
    @OneToMany(mappedBy="evenement" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Creneau> creneaus;

    @JsonIgnore
    @OneToMany(mappedBy="evenement" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Stand> stands;


}

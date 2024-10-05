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

    @Column(name = "END_DATE")
    private Date endDate;

    @Column(name = "SITEPERSOURL")
    private String sitepersourl;

    @Column(name = "PASSWORD", nullable = false)
    private String password;

    @Column(name = "VALIDATION")
    private String validation;

    @Column(name = "SIGNATURE")
    private String signature;

    @Column(name = "AFFICHER_MESSAGE")
    private boolean afficherMessage;

    @Column(name = "MESSAGE")
    private String message;

    @Column(name = "NEEDTEL")
    private Boolean needtel;

    @Column(name = "LOCK")
    private boolean lock;

    //@JsonIgnoreProperties({"prenom","nom","telephone","email","commentaire","reponse", "evenement" })
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

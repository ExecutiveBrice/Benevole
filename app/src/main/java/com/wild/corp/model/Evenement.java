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
import java.util.Set;

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

    private Date startDate;

    private Date endDate;

    private String sitepersourl;

    @Column(columnDefinition = "TEXT")
    private String validation;

    @Column(columnDefinition = "TEXT")
    private String signature;

    private boolean afficherMessageAccueil;

    @Column(columnDefinition = "TEXT")
    private String messageAccueil;

    private boolean afficherMessagePlanning;

    @Column(columnDefinition = "TEXT")
    private String messagePlanning;

    private boolean afficherMessageInfo;

    @Column(columnDefinition = "TEXT")
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

    private String couleurTexteTitre;

    private String couleurCard;

    private String couleurBloc;

    private String titleFont;

    private String pageTitleFont;

    private String bodyFont;

    @JsonIgnore
    @OneToMany(mappedBy="evenement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Benevole> benevoles;

    @JsonIgnore
    @OneToMany(mappedBy="evenement" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Creneau> creneaus;

    @JsonIgnore
    @OneToMany(mappedBy="evenement" , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Stand> stands;

    /**
     * Administrateurs autorisés à gérer cet événement.
     * La table de jointure est définie côté {@link Administrateur}.
     */
    @JsonIgnore
    @ManyToMany(mappedBy = "evenements")
    private Set<Administrateur> administrateurs;


}

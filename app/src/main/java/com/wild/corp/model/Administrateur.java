package com.wild.corp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

/** Compte utilisé par Spring Security pour accéder à l'administration. */
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "ADMINISTRATEUR", uniqueConstraints = @UniqueConstraint(name = "UK_ADMINISTRATEUR_USERNAME", columnNames = "USERNAME"))
public class Administrateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "USERNAME", nullable = false, length = 100)
    private String username;

    /** Hash BCrypt uniquement : un mot de passe en clair n'est jamais persisté. */
    @JsonIgnore
    @Column(name = "PASSWORD_HASH", nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false)
    private boolean enabled = true;

    /** Autorise le paramétrage transversal, indépendamment des évènements affectés. */
    @Column(name = "SUPERADMIN", nullable = false, columnDefinition = "boolean default false")
    private boolean superadmin = false;

    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "ADMINISTRATEUR_EVENEMENT",
            joinColumns = @JoinColumn(name = "ADMINISTRATEUR_ID", nullable = false),
            inverseJoinColumns = @JoinColumn(name = "EVENEMENT_ID", nullable = false)
    )
    private Set<Evenement> evenements = new HashSet<>();
}

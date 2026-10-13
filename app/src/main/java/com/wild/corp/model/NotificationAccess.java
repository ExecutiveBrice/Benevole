package com.wild.corp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

/** Secret d'accès conservé uniquement sous forme de condensat côté serveur. */
@Entity
@Getter
@Setter
public class NotificationAccess {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Benevole benevole;
    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;
    @Column(nullable = false)
    private Instant expiresAt;
    private boolean invitation;

    // Supprimer les appareils avant l'accès, puis le bénévole, pour respecter les FK.
    @OneToMany(mappedBy = "access", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<PushSubscription> subscriptions = new java.util.ArrayList<>();
}

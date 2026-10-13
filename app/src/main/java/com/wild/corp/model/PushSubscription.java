package com.wild.corp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"benevole_id", "endpoint_hash"}))
public class PushSubscription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Benevole benevole;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private NotificationAccess access;
    @Column(nullable = false, length = 2048)
    private String endpoint;
    @Column(name = "endpoint_hash", nullable = false, length = 64)
    private String endpointHash;
    @Column(nullable = false, length = 128)
    private String p256dh;
    @Column(nullable = false, length = 64)
    private String auth;
}

package com.wild.corp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.time.Instant;

/** Une tentative indépendante par appareil ou par copie organisateur. */
@Entity
@Getter
@Setter
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"benevole_id", "revision", "recipient"}))
public class ConfirmationDelivery {
    public enum Status { PENDING, ACCEPTED, FAILED, EXPIRED, SKIPPED }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Benevole benevole;
    @Column(nullable = false)
    private LocalDateTime revision;
    @Column(nullable = false)
    private String recipient;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;
    private int attempts;
    private Instant nextAttemptAt;
    private Integer responseCode;
    @Column(length = 160)
    private String lastError;
}

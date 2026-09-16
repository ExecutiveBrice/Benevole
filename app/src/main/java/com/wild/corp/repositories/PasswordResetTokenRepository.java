package com.wild.corp.repositories;

import com.wild.corp.model.Administrateur;
import com.wild.corp.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHashAndUsedAtIsNull(String tokenHash);

    void deleteByAdministrateur(Administrateur administrateur);
}

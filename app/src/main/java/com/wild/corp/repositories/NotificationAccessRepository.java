package com.wild.corp.repositories;

import com.wild.corp.model.NotificationAccess;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import java.util.Optional;

public interface NotificationAccessRepository extends JpaRepository<NotificationAccess, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<NotificationAccess> findByTokenHash(String tokenHash);
}

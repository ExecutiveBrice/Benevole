package com.wild.corp.repositories;

import com.wild.corp.model.ConfirmationDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Optional;

public interface ConfirmationDeliveryRepository extends JpaRepository<ConfirmationDelivery, Long> {
    Optional<ConfirmationDelivery> findByBenevoleIdAndRevisionAndRecipient(Integer id, LocalDateTime revision, String recipient);
}

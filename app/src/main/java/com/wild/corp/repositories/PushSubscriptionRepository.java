package com.wild.corp.repositories;

import com.wild.corp.model.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findByBenevoleId(Integer benevoleId);
    Optional<PushSubscription> findByBenevoleIdAndEndpointHash(Integer benevoleId, String endpointHash);
}

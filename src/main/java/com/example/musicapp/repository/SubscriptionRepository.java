package com.example.musicapp.repository;

import com.example.musicapp.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findBySubscriberId(Long subscriberId);
    List<Subscription> findBySubscribedToId(Long subscribedToId);
    Optional<Subscription> findBySubscriberIdAndSubscribedToId(Long subscriberId, Long subscribedToId);
    int countBySubscribedToId(Long subscribedToId);
    int countBySubscriberId(Long subscriberId);
    Optional<Subscription> findBySubscriber_IdAndSubscribedTo_Id(Long subscriberId, Long subscribedToId);
}

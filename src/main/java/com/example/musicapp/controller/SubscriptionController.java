package com.example.musicapp.controller;

import com.example.musicapp.model.Subscription;
import com.example.musicapp.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @GetMapping("/{subscriberId}/{subscribedToId}")
    public ResponseEntity<String> checkSubscription(@PathVariable Long subscriberId, @PathVariable Long subscribedToId) {
        boolean isSubscribed = subscriptionService.isSubscribed(subscriberId, subscribedToId);

        if (isSubscribed) {
            return ResponseEntity.ok("Підписка існує");
        } else {
            return ResponseEntity.ok("Підписка не існує");
        }
    }

    @GetMapping("/{userId}/subscriptions")
    public ResponseEntity<Integer> getUserSubscriptionsCount(@PathVariable Long userId) {
        int subscriptionsCount = subscriptionService.countSubscriptionsBySubscriberId(userId);
        return ResponseEntity.ok(subscriptionsCount);
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<Integer> getUserFollowersCount(@PathVariable Long userId) {
        int followersCount = subscriptionService.countFollowersBySubscribedToId(userId);
        return ResponseEntity.ok(followersCount);
    }

    @PostMapping("/{subscriberId}/{subscribedToId}")
    public ResponseEntity<Subscription> subscribe(
            @PathVariable Long subscriberId,
            @PathVariable Long subscribedToId) {
        try {
            Subscription subscription = subscriptionService.subscribe(subscriberId, subscribedToId);
            return ResponseEntity.ok(subscription);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{subscriberId}/{subscribedToId}")
    public ResponseEntity<Void> cancelSubscription(
            @PathVariable Long subscriberId,
            @PathVariable Long subscribedToId) {
        try {
            subscriptionService.cancelSubscription(subscriberId, subscribedToId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/subscriptions/{subscriberId}")
    public ResponseEntity<List<Subscription>> getSubscriptions(
            @PathVariable Long subscriberId) {
        List<Subscription> subscriptions = subscriptionService.getSubscriptions(subscriberId);
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/subscribers/{subscribedToId}")
    public ResponseEntity<List<Subscription>> getSubscribers(
            @PathVariable Long subscribedToId) {
        List<Subscription> subscribers = subscriptionService.getSubscribers(subscribedToId);
        return ResponseEntity.ok(subscribers);
    }
}

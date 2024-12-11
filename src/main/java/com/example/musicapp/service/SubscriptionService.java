package com.example.musicapp.service;

import com.example.musicapp.model.Subscription;
import com.example.musicapp.model.Notification;
import com.example.musicapp.model.User;
import com.example.musicapp.repository.NotificationRepository;
import com.example.musicapp.repository.SubscriptionRepository;
import com.example.musicapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public int countSubscriptionsBySubscriberId(Long subscriberId) {
        return subscriptionRepository.countBySubscriberId(subscriberId);
    }

    public int countFollowersBySubscribedToId(Long subscribedToId) {
        return subscriptionRepository.countBySubscribedToId(subscribedToId);
    }

    @Transactional(readOnly = true)
    public boolean isSubscribed(Long subscriberId, Long subscribedToId) {
        Optional<Subscription> subscription = subscriptionRepository.findBySubscriber_IdAndSubscribedTo_Id(subscriberId, subscribedToId);
        return subscription.isPresent();  // Повертає true, якщо підписка існує, інакше false
    }

    // Метод для підписки користувача на іншого користувача
    @Transactional
    public Subscription subscribe(Long subscriberId, Long subscribedToId) {
        Optional<User> subscriberOptional = userRepository.findById(subscriberId);
        Optional<User> subscribedToOptional = userRepository.findById(subscribedToId);

        if (subscriberOptional.isEmpty() || subscribedToOptional.isEmpty()) {
            throw new IllegalArgumentException("Користувач не знайдений");
        }

        User subscriber = subscriberOptional.get();
        User subscribedTo = subscribedToOptional.get();

        // Перевірка чи не підписаний вже
        Optional<Subscription> existingSubscription = subscriptionRepository
                .findBySubscriberIdAndSubscribedToId(subscriberId, subscribedToId);

        if (existingSubscription.isPresent()) {
            throw new IllegalArgumentException("Ви вже підписані на цього користувача");
        }

        // Створення нової підписки
        Subscription subscription = new Subscription();
        subscription.setSubscriber(subscriber);
        subscription.setSubscribedTo(subscribedTo);
        subscription.setSubscriptionDate(LocalDateTime.now());

        // Збереження підписки в БД
        Subscription savedSubscription = subscriptionRepository.save(subscription);

        // Створення повідомлення для користувача, на якого підписалися
        createSubscriptionNotification(subscriber, subscribedTo);

        return savedSubscription;
    }

    // Метод для створення повідомлення при підписці
    private void createSubscriptionNotification(User subscriber, User subscribedTo) {
        // Створення повідомлення
        Notification notification = new Notification();
        notification.setUserId(subscribedTo);
        notification.setNotificationText("На вас підписався <a href='/user-profile/" + subscriber.getId() + "'>" + subscriber.getName() + "</a>");
        notification.setStatus("unread");
        notification.setDateReceiving(LocalDateTime.now());

        // Збереження повідомлення в БД
        notificationRepository.save(notification);
    }

    // Метод для скасування підписки
    @Transactional
    public void cancelSubscription(Long subscriberId, Long subscribedToId) {
        Optional<Subscription> subscriptionOptional = subscriptionRepository
                .findBySubscriberIdAndSubscribedToId(subscriberId, subscribedToId);

        if (subscriptionOptional.isEmpty()) {
            throw new IllegalArgumentException("Підписка не знайдена");
        }

        subscriptionRepository.delete(subscriptionOptional.get());
    }

    @Transactional(readOnly = true)
    // Метод для отримання всіх підписок користувача
    public List<Subscription> getSubscriptions(Long subscriberId) {
        return subscriptionRepository.findBySubscriberId(subscriberId);
    }

    @Transactional(readOnly = true)
    // Метод для отримання всіх підписників користувача
    public List<Subscription> getSubscribers(Long subscribedToId) {
        return subscriptionRepository.findBySubscribedToId(subscribedToId);
    }
}

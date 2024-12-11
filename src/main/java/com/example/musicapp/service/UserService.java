package com.example.musicapp.service;

import com.example.musicapp.model.Subscription;
import com.example.musicapp.model.User;
import com.example.musicapp.repository.SubscriptionRepository;
import com.example.musicapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByName(String name) {
        return userRepository.findByName(name);
    }

    @Transactional(readOnly = true)
    public List<User> getSubscribers(Long userId) {
        // Отримуємо список всіх підписників користувача за його ID
        List<Subscription> subscriptions = subscriptionRepository.findBySubscribedToId(userId);

        // Перетворюємо підписки на список користувачів
        List<User> subscribers = subscriptions.stream()
                .map(subscription -> subscription.getSubscriber())  // Отримуємо користувача, який підписався
                .collect(Collectors.toList());

        return subscribers;
    }

    public User registerUser(User user) {
        User newUser = new User();
        newUser.setName(user.getName());
        newUser.setEmail(user.getEmail());
        newUser.setPassword(passwordEncoder.encode(user.getPassword()));
        // Призначаємо роль USER за замовчуванням
        Set<String> roles = new HashSet<>();
        roles.add("USER");
        newUser.setRoles(roles);
        // Встановлюємо дату реєстрації
        newUser.setRegistrationDate(LocalDateTime.now());
        // Встановлюємо зображення профілю за замовчуванням
        try {
            newUser.setProfilePicture(Files.readAllBytes(Paths.get("src/main/resources/static/images/default-profile.jpg")));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        newUser.setMusicFiles(new HashSet<>());
        newUser.setUserPlaylistsList(new HashSet<>());
        newUser.setUserCommentsList(new HashSet<>());
        newUser.setSubscriptions(new HashSet<>());
        newUser.setSubscribers(new HashSet<>());
        newUser.setUserNotificationsList(new HashSet<>());
        return userRepository.save(newUser);
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User updateProfilePicture(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Перевірка чи файл не порожній
        if (!file.isEmpty()) {
            user.setProfilePicture(file.getBytes());  // Перетворюємо файл в масив байтів і зберігаємо
        }

        return userRepository.save(user);
    }

    public User updateUser(String userId, User updatedUser) {
        // Знайдемо користувача за його ID
        Optional<User> optionalUser = userRepository.findById(Long.valueOf(userId));
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // Оновлюємо дані користувача
            if (updatedUser.getName() != null) {
                user.setName(updatedUser.getName());
            }
            if (updatedUser.getEmail() != null) {
                user.setEmail(updatedUser.getEmail());
            }

            // Збережемо оновленого користувача в базі даних
            return userRepository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

}

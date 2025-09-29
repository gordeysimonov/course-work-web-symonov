package com.example.musicapp.service;

import com.example.musicapp.model.Category;
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
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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
        List<Subscription> subscriptions = subscriptionRepository.findBySubscribedToId(userId);

        List<User> subscribers = subscriptions.stream()
                .map(subscription -> subscription.getSubscriber())
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
        newUser.setProfilePicturePath("src/main/resources/static/images/default-profile.jpg");
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

        if (!file.isEmpty()) {
            String filePath = "src/main/resources/static/images/" + user.getName() + ".jpg";
            Path path = Paths.get(filePath);
            Files.createDirectories(path.getParent()); Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            user.setProfilePicturePath(filePath);
        }

        return userRepository.save(user);
    }

    public String getProfilePicture(Long id) {
        Optional<User> user = findById(id);
        return user.get().getProfilePicturePath();
    }

    public User updateUser(String userId, User updatedUser) {
        Optional<User> optionalUser = userRepository.findById(Long.valueOf(userId));
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (updatedUser.getName() != null) {
                user.setName(updatedUser.getName());
            }
            if (updatedUser.getEmail() != null) {
                user.setEmail(updatedUser.getEmail());
            }

            return userRepository.save(user);
        } else {
            throw new RuntimeException("User not found");
        }
    }

}

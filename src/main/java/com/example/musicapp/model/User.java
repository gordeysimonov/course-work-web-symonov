package com.example.musicapp.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String password;

    private String profilePicturePath;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime registrationDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    private Set<String> roles;

    @OneToMany(mappedBy = "uploadedBy", cascade = CascadeType.PERSIST)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private Set<MusicFile> musicFiles;

    @JsonIgnore
    @OneToMany(mappedBy = "userId", cascade = CascadeType.ALL)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Set<Playlist> userPlaylistsList;

    @OneToMany(mappedBy = "userId", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<Comment> userCommentsList;

    @OneToMany(mappedBy = "subscriber", cascade = CascadeType.ALL)
    @JsonIgnore
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Set<Subscription> subscriptions;

    @OneToMany(mappedBy = "subscribedTo", cascade = CascadeType.ALL)
    @JsonIgnore
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Set<Subscription> subscribers;

    @OneToMany(mappedBy = "userId", cascade = CascadeType.ALL)
    @JsonIgnore
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Set<Notification> userNotificationsList;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public Set<MusicFile> getMusicFiles() {
        return musicFiles;
    }

    public void setMusicFiles(Set<MusicFile> musicFiles) {
        this.musicFiles = musicFiles;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public Set<Comment> getUserCommentsList() {
        return userCommentsList;
    }

    public void setUserCommentsList(Set<Comment> userCommentsList) {
        this.userCommentsList = userCommentsList;
    }

    public Set<Subscription> getSubscriptions() {
        return subscriptions;
    }

    public void setSubscriptions(Set<Subscription> subscriptions) {
        this.subscriptions = subscriptions;
    }

    public Set<Subscription> getSubscribers() {
        return subscribers;
    }

    public void setSubscribers(Set<Subscription> subscribers) {
        this.subscribers = subscribers;
    }

    public Set<Notification> getUserNotificationsList() {
        return userNotificationsList;
    }

    public void setUserNotificationsList(Set<Notification> userNotificationsList) {
        this.userNotificationsList = userNotificationsList;
    }

    public Set<Playlist> getUserPlaylistsList() {
        return userPlaylistsList;
    }

    public void setUserPlaylistsList(Set<Playlist> userPlaylistsList) {
        this.userPlaylistsList = userPlaylistsList;
    }

    public String getProfilePicturePath() {
        return profilePicturePath;
    }

    public void setProfilePicturePath(String profilePicturePath) {
        this.profilePicturePath = profilePicturePath;
    }

    // Реалізація методів UserDetails

}

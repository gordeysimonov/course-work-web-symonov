package com.example.musicapp.data;

import java.time.LocalDateTime;

public class CommentDTO {
    private Long id;
    private String commentText;
    private LocalDateTime postDate;
    private Long userId;
    private String userName;

    public CommentDTO(Long id, String commentText, LocalDateTime postDate, Long userId, String userName) {
        this.id = id;
        this.commentText = commentText;
        this.postDate = postDate;
        this.userId = userId;
        this.userName = userName;
    }

    // Геттери та сеттери

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

    public LocalDateTime getPostDate() {
        return postDate;
    }

    public void setPostDate(LocalDateTime postDate) {
        this.postDate = postDate;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

}


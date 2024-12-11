package com.example.musicapp.data;

public class CommentRequest {

    private Long musicFileId;
    private Long userId;
    private String commentText;

    // Getters and setters
    public Long getMusicFileId() {
        return musicFileId;
    }

    public void setMusicFileId(Long musicFileId) {
        this.musicFileId = musicFileId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCommentText() {
        return commentText;
    }

    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }

}



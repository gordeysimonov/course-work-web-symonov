package com.example.musicapp.service;

import com.example.musicapp.model.Comment;
import com.example.musicapp.model.MusicFile;
import com.example.musicapp.model.User;
import com.example.musicapp.repository.CommentRepository;
import com.example.musicapp.repository.MusicFileRepository;
import com.example.musicapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MusicFileRepository musicFileRepository;

    @Transactional(readOnly = true)
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Comment> getCommentsByMusicFileId(Long musicFileId) {
        return commentRepository.findByMusicFileId_Id(musicFileId);
    }

    public Comment addComment(Long musicFileId, Long userId, String commentText) {
        MusicFile musicFile = musicFileRepository.findById(musicFileId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);

        if (musicFile == null || user == null) {
            throw new IllegalArgumentException("Invalid music file or user ID");
        }

        Comment comment = new Comment();
        comment.setMusicFileId(musicFile);
        comment.setUserId(user);
        comment.setCommentText(commentText);
        comment.setPostDate(LocalDateTime.now());

        return commentRepository.save(comment); // Зберігаємо коментар у базі даних
    }

    // Редагування коментаря
    public Comment updateComment(Long commentId, String newCommentText) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setCommentText(newCommentText);
        return commentRepository.save(comment);
    }

    // Видалення коментаря та всіх його відповідей
    @Transactional
    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        commentRepository.delete(comment);
    }

}


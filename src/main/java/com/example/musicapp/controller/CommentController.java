package com.example.musicapp.controller;

import com.example.musicapp.data.CommentRequest;
import com.example.musicapp.model.Comment;
import com.example.musicapp.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping
    public List<Comment> getAllComments() {
        return commentService.getAllComments();
    }

    @GetMapping("/music-file/{musicFileId}")
    public List<Comment> getCommentsByMusicFileId(@PathVariable Long musicFileId) {
        return commentService.getCommentsByMusicFileId(musicFileId);
    }

    @PostMapping("/add")
    public ResponseEntity<Comment> addComment(@RequestBody CommentRequest commentRequest) {
        try {
            Comment comment = commentService.addComment(
                    commentRequest.getMusicFileId(),
                    commentRequest.getUserId(),
                    commentRequest.getCommentText()
            );
            return new ResponseEntity<>(comment, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<String> updateComment(@PathVariable Long id, @RequestBody String newCommentText) {
        Comment updatedComment = commentService.updateComment(id, newCommentText);
        return ResponseEntity.ok(updatedComment.getCommentText());
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }

}

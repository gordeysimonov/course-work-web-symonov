package com.example.musicapp.repository;

import com.example.musicapp.model.Comment;
import com.example.musicapp.model.MusicFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Optional<Comment> findById(Long id);
    //@Query("SELECT c FROM Comment c WHERE c.musicFileId.id = :musicFileId")
    List<Comment> findByMusicFileId_Id(Long musicFileId);
}

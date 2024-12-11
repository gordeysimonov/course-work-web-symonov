package com.example.musicapp.repository;

import com.example.musicapp.model.Playlist;
import com.example.musicapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    @Query("SELECT p FROM Playlist p WHERE p.userId.id = :userId")
    List<Playlist> findByUserId(@Param("userId") Long userId);
}
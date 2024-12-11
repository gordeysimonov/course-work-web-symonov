package com.example.musicapp.repository;

import com.example.musicapp.model.MusicFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MusicFileRepository extends JpaRepository<MusicFile, Long> {
    @Query("SELECT mf FROM MusicFile mf JOIN FETCH mf.uploadedBy")
    List<MusicFile> findAll();
    List<MusicFile> findByUploadedById(Long userId);
    List<MusicFile> findByCategoriesId(Long categoryId);
    List<MusicFile> findByPlaylistsId(Long playlistId);
}
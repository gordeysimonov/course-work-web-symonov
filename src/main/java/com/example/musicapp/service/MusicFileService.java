package com.example.musicapp.service;

import com.example.musicapp.model.Category;
import com.example.musicapp.model.Comment;
import com.example.musicapp.model.Genre;
import com.example.musicapp.model.MusicFile;
import com.example.musicapp.repository.CategoryRepository;
import com.example.musicapp.repository.CommentRepository;
import com.example.musicapp.repository.MusicFileRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class MusicFileService {

    @Autowired
    private MusicFileRepository musicFileRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CommentRepository commentRepository;

    public List<MusicFile> getAllMusicFiles() {
        return musicFileRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<MusicFile> getMusicFilesByUserId(Long userId) {
        return musicFileRepository.findByUploadedById(userId);
    }

    public MusicFile createMusicFile(MusicFile musicFile) {
        musicFile.setDownloadDate(LocalDateTime.now());

        Set<Genre> genres = musicFile.getGenres();

        Category popCategory = categoryRepository.getById(1L);

        if (genres.stream().anyMatch(genre -> "Pop".equals(genre.getGenre()))) {
            musicFile.getCategories().add(popCategory);
        }

        Category lastWeekCategory = categoryRepository.getById(2L);

        if (musicFile.getDownloadDate().isAfter(LocalDateTime.now().minusWeeks(1))) {
            musicFile.getCategories().add(lastWeekCategory);
        }

        return musicFileRepository.save(musicFile);
    }

    @Transactional(readOnly = true)
    public Optional<MusicFile> getMusicFileById(Long id) {
        return musicFileRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Comment> getCommentsForMusicFile(Long musicFileId) {
        MusicFile musicFile = musicFileRepository.findById(musicFileId).orElse(null);

        if (musicFile == null) {
            return List.of();
        }

        List<Comment> comments = new ArrayList<>();
        for (Comment comment : musicFile.getMusicFileCommentList()) {
            Comment foundComment = commentRepository.findById(comment.getId()).orElse(null);
            if (foundComment != null) {
                comments.add(foundComment);
            }
        }

        return comments;
    }

    public MusicFile updateMusicFile(Long id, String title, String artist, int year, MultipartFile coverImage, Long userId, Set<String> userRoles) throws AccessDeniedException {
        MusicFile musicFile = musicFileRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Файл не знайдено."));

        if (!userRoles.contains("ADMIN") && !musicFile.getUploadedBy().getId().equals(userId)) {
            throw new AccessDeniedException("Ви не маєте доступу до цього файлу.");
        }

        if (title != null) {
            musicFile.setTitle(title);
        }
        if (artist != null) {
            musicFile.setArtist(artist);
        }
        if (year >= 0) {
            musicFile.setYear(year);
        }
        if (coverImage != null) {
            try {
                musicFile.setCoverImage(coverImage.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Помилка при обробці обкладинки.");
            }
        }

        musicFileRepository.save(musicFile);
        return musicFile;
    }

    public void deleteMusicFile(Long id, Long userId, Set<String> userRoles) throws AccessDeniedException, EntityNotFoundException {
        MusicFile musicFile = musicFileRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Файл не знайдено"));

        if (!userRoles.contains("ADMIN") && !musicFile.getUploadedBy().getId().equals(userId)) {
            throw new AccessDeniedException("У вас немає прав видаляти цей файл.");
        }

        musicFile.setGenres(new HashSet<>());
        musicFile.setTags(new HashSet<>());
        musicFile.setCategories(new HashSet<>());
        musicFile.setPlaylists(new HashSet<>());
        musicFileRepository.save(musicFile);

        musicFileRepository.delete(musicFile);
    }

    @Transactional(readOnly = true)
    public List<MusicFile> getMusicFilesByCategory(Long categoryId) {
        return musicFileRepository.findByCategoriesId(categoryId);
    }

}
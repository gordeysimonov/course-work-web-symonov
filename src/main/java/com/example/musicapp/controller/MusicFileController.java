package com.example.musicapp.controller;

import com.example.musicapp.model.Comment;
import com.example.musicapp.model.Notification;
import com.example.musicapp.model.Genre;
import com.example.musicapp.model.MusicFile;
import com.example.musicapp.model.User;
import com.example.musicapp.repository.NotificationRepository;
import com.example.musicapp.service.GenreService;
import com.example.musicapp.service.MusicFileService;
import com.example.musicapp.service.TagService;
import com.example.musicapp.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/music-files")
public class MusicFileController {

    @Autowired
    private MusicFileService musicFileService;

    @Autowired
    private UserService userService;

    @Autowired
    private GenreService genreService;

    @Autowired
    private TagService tagService;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<MusicFile> getAllMusicFiles() {
        return musicFileService.getAllMusicFiles();
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getMusicFile(@PathVariable Long id) {
        Optional<MusicFile> musicFileOptional = musicFileService.getMusicFileById(id);

        if (musicFileOptional.isPresent()) {
            MusicFile musicFile = musicFileOptional.get();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, musicFile.getContentType())
                    .body(musicFile.getFileData());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/cover/{id}")
    public ResponseEntity<byte[]> getMusicFileCoverImage(@PathVariable Long id) {
        Optional<MusicFile> musicFileOptional = musicFileService.getMusicFileById(id);

        if (musicFileOptional.isPresent()) {
            MusicFile musicFile = musicFileOptional.get();

            return ResponseEntity.ok()
                    .body(musicFile.getCoverImage());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{musicFileId}/comments")
    public List<Comment> getComments(@PathVariable Long musicFileId) {
        return musicFileService.getCommentsForMusicFile(musicFileId);
    }

    @GetMapping("/user/{userId}")
    public List<MusicFile> getUserMusicFiles(@PathVariable Long userId) {
        return musicFileService.getMusicFilesByUserId(userId);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<MusicFile> uploadMusicFile(@RequestParam("file") MultipartFile file,
                                                     @RequestParam("coverImage") MultipartFile coverImage,
                                                     @RequestParam("title") String title,
                                                     @RequestParam("artist") String artist,
                                                     @RequestHeader("userId") Long userId,
                                                     @RequestParam("genreIds") List<Long> genreIds,
                                                     @RequestParam("year") int year) {
        try {
            // Перевірка користувача
            Optional<User> userOptional = userService.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            // Отримання жанрів
            Set<Genre> genres = genreService.findGenresByIds(genreIds);

            // Створення нового MusicFile об'єкта
            MusicFile musicFile = new MusicFile();
            musicFile.setTitle(title);
            musicFile.setArtist(artist);
            musicFile.setFileData(file.getBytes());
            musicFile.setContentType(file.getContentType());
            musicFile.setUploadedBy(userOptional.get());
            musicFile.setCoverImage(coverImage.getBytes());
            musicFile.setGenres(genres);
            musicFile.setYear(year);
            musicFile.setCategories(new HashSet<>());
            musicFile.setPlaylists(new HashSet<>());

            // Виклик сервісу для збереження файлу
            MusicFile savedMusicFile = musicFileService.createMusicFile(musicFile);

            // Створення повідомлення для підписників
            List<User> subscribers = userService.getSubscribers(userId);
            String notificationText = String.format("<a href='/user-profile/%d'>%s</a> поділився новим файлом: <a href='/music-file/%d'>%s</a>",
                    userOptional.get().getId(), userOptional.get().getName(),
                    savedMusicFile.getId(), savedMusicFile.getTitle());

            for (User subscriber : subscribers) {
                // Створення повідомлення для кожного підписника
                Notification notification = new Notification();
                notification.setUserId(subscriber);
                notification.setNotificationText(notificationText);
                notification.setStatus("unread");
                notification.setDateReceiving(LocalDateTime.now());

                // Збереження повідомлення в БД
                notificationRepository.save(notification);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(savedMusicFile);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMusicFile(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "artist", required = false) String artist,
            @RequestParam(value = "year", required = false) int year,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage,
            @RequestHeader("userId") Long userId,
            @RequestHeader("roles") String roles) {
        try {
            // Отримуємо набір ролей з заголовка
            Set<String> userRoles = Arrays.stream(roles.split(","))
                    .collect(Collectors.toSet());

            // Сервіс перевіряє права доступу та виконує оновлення
            MusicFile updatedMusicFile = musicFileService.updateMusicFile(id, title, artist, year, coverImage, userId, userRoles);

            return ResponseEntity.ok(updatedMusicFile);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Ви не маєте доступу до цього файлу.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Файл не знайдено.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Помилка при оновленні файлу.");
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMusicFile(
            @PathVariable Long id,
            @RequestHeader("userId") Long userId,
            @RequestHeader("roles") String roles) {
        try {
            // Отримуємо набір ролей з заголовка
            Set<String> userRoles = Arrays.stream(roles.split(","))
                    .collect(Collectors.toSet());

            // Передаємо ролі у сервіс для перевірки доступу
            musicFileService.deleteMusicFile(id, userId, userRoles);
            return ResponseEntity.ok("Файл успішно видалено.");
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Ви не маєте доступу до цього файлу.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Файл не знайдено.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Помилка при видаленні файлу.");
        }
    }

    @PostMapping("/{id}/tags")
    public ResponseEntity<?> addTagsToMusicFile(@PathVariable Long id, @RequestBody Set<String> tagNames) {
        try {
            tagService.addTagsToMusicFile(id, tagNames);
            return ResponseEntity.ok("Теги успішно додано до музичного файлу.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Помилка при додаванні тегів: " + e.getMessage());
        }
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<MusicFile>> getMusicFilesByCategory(@PathVariable Long categoryId) {
        List<MusicFile> musicFiles = musicFileService.getMusicFilesByCategory(categoryId);
        return ResponseEntity.ok(musicFiles);
    }

}
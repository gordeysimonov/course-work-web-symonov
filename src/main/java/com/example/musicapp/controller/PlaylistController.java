package com.example.musicapp.controller;

import com.example.musicapp.model.MusicFile;
import com.example.musicapp.model.Playlist;
import com.example.musicapp.model.User;
import com.example.musicapp.repository.PlaylistRepository;
import com.example.musicapp.repository.UserRepository;
import com.example.musicapp.service.PlaylistService;
import com.example.musicapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlaylistRepository playlistRepository;

    @PostMapping
    public ResponseEntity<Playlist> createPlaylist(
            @RequestParam String name,
            @RequestParam Long userId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Playlist playlist = new Playlist();
        playlist.setName(name);
        playlist.setUserId(user);

        Playlist savedPlaylist = playlistService.createPlaylist(playlist);

        return ResponseEntity.ok(savedPlaylist);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Playlist>> getPlaylistsByUserId(@PathVariable Long userId) {
        // Передаємо userId у сервіс
        List<Playlist> playlists = playlistService.getPlaylistsByUserId(userId);

        // Повертаємо список плейлистів
        return ResponseEntity.ok(playlists);
    }

    @GetMapping("/{playlistId}")
    public ResponseEntity<Optional<Playlist>> getPlaylistById(@PathVariable Long playlistId) {
        return ResponseEntity.ok(playlistService.getPlaylistById(playlistId));
    }

    @PutMapping("{playlistId}")
    public ResponseEntity<Playlist> updatePlaylistName(@PathVariable Long playlistId, @RequestBody Map<String, String> request) {
        // Отримуємо нову назву плейлиста з поля "name"
        String newName = request.get("name");

        // Знаходимо плейлист по ID
        Optional<Playlist> optionalPlaylist = playlistRepository.findById(playlistId);

        if (optionalPlaylist.isEmpty()) {
            // Якщо плейлист не знайдений, повертаємо помилку 404 Not Found
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null); // Тіло відповіді буде порожнім
        }

        // Якщо плейлист знайдений, оновлюємо його
        Playlist playlist = optionalPlaylist.get();
        playlist.setName(newName);

        // Зберігаємо оновлений плейлист
        playlistRepository.save(playlist);

        // Повертаємо оновлений плейлист з HTTP статусом 200 OK
        return ResponseEntity.ok(playlist);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{playlistId}/add-music/{musicFileId}")
    public ResponseEntity<Playlist> addMusicToPlaylist(@PathVariable Long playlistId, @PathVariable Long musicFileId) {
        return ResponseEntity.ok(playlistService.addMusicToPlaylist(playlistId, musicFileId));
    }

    @DeleteMapping("/{playlistId}/remove-music/{musicFileId}")
    public ResponseEntity<Playlist> removeMusicFromPlaylist(@PathVariable Long playlistId, @PathVariable Long musicFileId) {
        return ResponseEntity.ok(playlistService.removeMusicFromPlaylist(playlistId, musicFileId));
    }

    @GetMapping("/{playlistId}/music-files")
    public ResponseEntity<List<MusicFile>> getMusicFilesByPlaylist(@PathVariable Long playlistId) {
        List<MusicFile> musicFiles = playlistService.getMusicFilesByPlaylistId(playlistId);
        return ResponseEntity.ok(musicFiles);
    }

}

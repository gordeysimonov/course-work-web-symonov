package com.example.musicapp.service;

import com.example.musicapp.model.Playlist;
import com.example.musicapp.model.User;
import com.example.musicapp.model.MusicFile;
import com.example.musicapp.repository.MusicFileRepository;
import com.example.musicapp.repository.PlaylistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PlaylistService {

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private MusicFileRepository musicFileRepository;

    public Playlist createPlaylist(Playlist playlist) {
        return playlistRepository.save(playlist);
    }

    @Transactional(readOnly = true)
    public List<Playlist> getPlaylistsByUserId(Long userId) {
        // Репозиторій виконує пошук за ID користувача
        return playlistRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<MusicFile> getMusicFilesByPlaylistId(Long playlistId) {
        // Отримуємо музичні файли для певного плейлиста
        return musicFileRepository.findByPlaylistsId(playlistId);
    }

    @Transactional(readOnly = true)
    public Optional<Playlist> getPlaylistById(Long playlistId) {
        return playlistRepository.findById(playlistId);
    }

    public Playlist updatePlaylistName(Long playlistId, String newName) {
        // Знаходимо плейлист за ID
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        // Оновлюємо назву
        playlist.setName(newName);

        // Зберігаємо оновлений плейлист
        return playlistRepository.save(playlist);
    }

    public void deletePlaylist(Long id) {
        playlistRepository.deleteById(id);
    }

    @Transactional
    public Playlist addMusicToPlaylist(Long playlistId, Long musicFileId) {
        Playlist playlist = playlistRepository.findById(playlistId).orElseThrow(() -> new RuntimeException("Playlist not found"));
        MusicFile musicFile = musicFileRepository.findById(musicFileId).orElseThrow(() -> new RuntimeException("Music file not found"));
        playlist.getMusicFiles().add(musicFile);
        musicFile.getPlaylists().add(playlist);
        return playlistRepository.save(playlist);
    }

    @Transactional
    public Playlist removeMusicFromPlaylist(Long playlistId, Long musicFileId) {
        Playlist playlist = playlistRepository.findById(playlistId).orElseThrow(() -> new RuntimeException("Playlist not found"));
        MusicFile musicFile = musicFileRepository.findById(musicFileId).orElseThrow(() -> new RuntimeException("Music file not found"));
        playlist.getMusicFiles().remove(musicFile);
        musicFile.getPlaylists().remove(playlist);
        return playlistRepository.save(playlist);
    }

}

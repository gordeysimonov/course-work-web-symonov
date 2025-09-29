import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/PlaylistCard.css'; // Підключення стилів

const PlaylistCard = ({ playlist, onDelete }) => {
    const [playlistSongsCount, setPlaylistSongsCount] = useState(0); // Стан для збереження кількості пісень
    const [allSongs, setAllSongs] = useState([]); // Стан для всіх пісень
    const [isEditing, setIsEditing] = useState(false); // Стан для визначення, чи редагується плейлист
    const [newPlaylistName, setNewPlaylistName] = useState(playlist.name); // Стан для нової назви плейлиста

    useEffect(() => {
        const fetchAllSongs = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/music-files');
                setAllSongs(response.data);
            } catch (error) {
                console.error('Error fetching all songs:', error);
            }
        };

        fetchAllSongs();
    }, []);

    useEffect(() => {
        const countSongsInPlaylist = () => {
            if (allSongs.length > 0) {
                const count = allSongs.filter(song =>
                    song.playlists.some(playlistItem => playlistItem.id === playlist.id)
                ).length;

                setPlaylistSongsCount(count);
            }
        };

        countSongsInPlaylist();
    }, [allSongs, playlist.id]);

    const handleDelete = () => {
        const confirmDelete = window.confirm('Ви впевнені, що хочете видалити цей плейлист?');
        if (confirmDelete) {
            onDelete(playlist.id);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        if (!newPlaylistName) {
            alert('Будь ласка, введіть нову назву плейлиста');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:8080/api/playlists/${playlist.id}`, {
                name: newPlaylistName,
            });

            if (response.status === 200) {
                alert('Назва плейлиста оновлена');
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating playlist name:', error);
            alert('Помилка при оновленні назви плейлиста');
        }
    };

    return (
        <div className="playlist-card">
            {isEditing ? (
                <div>
                    <input
                        type="text"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                    />
                    <button onClick={handleSaveClick}>Зберегти</button>
                    <button onClick={() => setIsEditing(false)}>Скасувати</button>
                </div>
            ) : (
                <div>
                    <h4>{playlist.name}</h4>
                    <button onClick={handleEditClick}>Редагувати плейлист</button>
                </div>
            )}

            <p>Кількість пісень: {playlistSongsCount}</p>
            <Link to={`/playlist/${playlist.id}`}>
                <button>Відкрити плейлист</button>
            </Link>
            <button onClick={handleDelete}>Видалити плейлист</button>
        </div>
    );
};

export default PlaylistCard;

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
                // Отримуємо всі пісні
                const response = await axios.get('http://localhost:8080/api/music-files');
                setAllSongs(response.data); // Зберігаємо всі пісні у стані
            } catch (error) {
                console.error('Error fetching all songs:', error);
            }
        };

        fetchAllSongs(); // Викликаємо функцію для завантаження всіх пісень
    }, []);

    useEffect(() => {
        const countSongsInPlaylist = () => {
            if (allSongs.length > 0) {
                // Фільтруємо пісні, які належать до поточного плейлиста
                const count = allSongs.filter(song =>
                    song.playlists.some(playlistItem => playlistItem.id === playlist.id)
                ).length;

                setPlaylistSongsCount(count); // Встановлюємо кількість пісень
            }
        };

        countSongsInPlaylist(); // Викликаємо функцію підрахунку пісень при зміні списку пісень або плейлиста
    }, [allSongs, playlist.id]); // Перераховуємо, коли змінюються всі пісні або playlist.id

    const handleDelete = () => {
        const confirmDelete = window.confirm('Ви впевнені, що хочете видалити цей плейлист?');
        if (confirmDelete) {
            onDelete(playlist.id); // викликаємо функцію видалення
        }
    };

    const handleEditClick = () => {
        setIsEditing(true); // Включаємо режим редагування
    };

    const handleSaveClick = async () => {
        if (!newPlaylistName) {
            alert('Будь ласка, введіть нову назву плейлиста');
            return;
        }

        try {
            // Відправляємо запит на сервер для оновлення назви плейлиста
            const response = await axios.put(`http://localhost:8080/api/playlists/${playlist.id}`, {
                name: newPlaylistName,
            });

            // Якщо запит успішний, оновлюємо дані плейлиста
            if (response.status === 200) {
                alert('Назва плейлиста оновлена');
                setIsEditing(false); // Виходимо з режиму редагування
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

            <p>Кількість пісень: {playlistSongsCount}</p> {/* Відображаємо кількість пісень */}
            <Link to={`/playlist/${playlist.id}`}>
                <button>Відкрити плейлист</button>
            </Link>
            <button onClick={handleDelete}>Видалити плейлист</button>
        </div>
    );
};

export default PlaylistCard;

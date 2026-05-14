// Сторінка створення нового плейлиста

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/PlaylistCreatePage.css';

const PlaylistCreatePage = ({ user }) => {

    // Назва нового плейлиста
    const [playlistName, setPlaylistName] = useState('');

    // Навігація між сторінками
    const navigate = useNavigate();

    // Обробка зміни назви плейлиста
    const handleNameChange = (e) => {
        setPlaylistName(e.target.value);
    };

    // Створення нового плейлиста
    const handleCreatePlaylist = () => {

        // Формування параметрів запиту
        const newPlaylist = new URLSearchParams();

        newPlaylist.append('name', playlistName);
        newPlaylist.append('userId', user.sub);

        // Надсилання запиту на сервер
        axios.post('http://localhost:8080/api/playlists', newPlaylist)

            .then((response) => {

                // Перехід до сторінки профілю після створення
                navigate('/profile');
            })

            .catch((error) => {

                // Виведення помилки у консоль
                console.error('Error creating playlist', error);
            });
    };

    return (
        <div className="playlist-create-container">

            {/* Заголовок сторінки */}
            <h2>Створити новий плейлист</h2>

            {/* Поле введення назви плейлиста */}
            <input
                type="text"
                placeholder="Назва плейлиста"
                value={playlistName}
                onChange={handleNameChange}
            />

            {/* Кнопка створення плейлиста */}
            <button onClick={handleCreatePlaylist}>
                Створити плейлист
            </button>
        </div>
    );
};

export default PlaylistCreatePage;
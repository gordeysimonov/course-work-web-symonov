import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/PlaylistCreatePage.css';

const PlaylistCreatePage = ({ user }) => {
    const [playlistName, setPlaylistName] = useState('');
    const navigate = useNavigate();

    const handleNameChange = (e) => {
        setPlaylistName(e.target.value);
    };

    const handleCreatePlaylist = () => {
        const newPlaylist = new URLSearchParams();
        newPlaylist.append('name', playlistName);
        newPlaylist.append('userId', user.sub);

        axios.post('http://localhost:8080/api/playlists', newPlaylist)
            .then((response) => {
                navigate('/profile');
            })
            .catch((error) => {
                console.error('Error creating playlist', error);
            });
    };

    return (
        <div className="playlist-create-container">
            <h2>Створити новий плейлист</h2>
            <input
                type="text"
                placeholder="Назва плейлиста"
                value={playlistName}
                onChange={handleNameChange}
            />
            <button onClick={handleCreatePlaylist}>Створити плейлист</button>
        </div>
    );
};

export default PlaylistCreatePage;

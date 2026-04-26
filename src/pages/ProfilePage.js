import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import PlaylistCard from '../components/PlaylistCard';
import { PlayerContext } from '../context/PlayerContext'; // ✅ додаємо контекст
import VerticalReadOnlyRating from '../components/VerticalReadOnlyRating';
import '../css/ProfilePage.css';

const ProfilePage = ({ user }) => {
    const [profileData, setProfileData] = useState(null);
    const [musicFiles, setMusicFiles] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [subscriptionsCount, setSubscriptionsCount] = useState(0);
    const [followersCount, setFollowersCount] = useState(0);
    const [ratings, setRatings] = useState({});

    const { playTrack } = useContext(PlayerContext); // ✅ доступ до глобального плеєра

    useEffect(() => {
        if (!user) return;
        axios.get(`http://localhost:8080/api/users/${user.sub}`)
            .then((response) => {
                setProfileData(response.data);
                setNewName(response.data.name);
                setNewEmail(response.data.email);
            })
            .catch((error) => console.error('Error fetching user profile', error));

        axios.get(`http://localhost:8080/api/music-files`)
            .then((response) => {
                const filteredFiles = response.data.filter(file => file.uploadedBy?.id === Number(user.sub));
                setMusicFiles(filteredFiles);
            })
            .catch((error) => console.error('Error fetching music files:', error));

        axios.get(`http://localhost:8080/api/playlists/user/${user.sub}`)
            .then((response) => setPlaylists(response.data))
            .catch((error) => console.error('Error fetching playlists:', error));

        axios.get(`http://localhost:8080/api/subscriptions/${user.sub}/subscriptions`)
            .then((response) => setSubscriptionsCount(response.data))
            .catch((error) => console.error('Error fetching subscriptions count:', error));

        axios.get(`http://localhost:8080/api/subscriptions/${user.sub}/followers`)
            .then((response) => setFollowersCount(response.data))
            .catch((error) => console.error('Error fetching followers count:', error));
    }, [user]);

    const handleProfilePictureChange = (e) => setNewProfilePicture(e.target.files[0]);

    const handleSaveProfilePicture = () => {
        if (newProfilePicture) {
            const formData = new FormData();
            formData.append('file', newProfilePicture);

            axios.put(`http://localhost:8080/api/users/${user.sub}/profile-picture`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
                .then((response) => setProfileData(response.data))
                .catch((error) => console.error('Error updating profile picture', error));
        }
    };

    const handleSaveChanges = () => {
        const updatedData = { name: newName, email: newEmail };

        axios.put(`http://localhost:8080/api/users/${user.sub}`, updatedData)
            .then((response) => setProfileData(response.data))
            .catch((error) => console.error('Error updating profile data', error));
    };

    const handleDeleteMusicFile = (id) => {
        const confirmDelete = window.confirm('Натисніть ще раз, щоб підтвердити видалення.');
        if (confirmDelete) {
            axios.delete(`http://localhost:8080/api/music-files/${id}`, {
                headers: { userId: user.sub, roles: user.roles.join(',') },
            })
                .then(() => setMusicFiles(musicFiles.filter((file) => file.id !== id)))
                .catch((error) => console.error('Error deleting music file:', error));
        }
    };

    const handleDeletePlaylist = async (playlistId) => {
        const confirmDelete = window.confirm('Ви впевнені, що хочете видалити цей плейлист?');
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8080/api/playlists/${playlistId}`);
                setPlaylists(playlists.filter((playlist) => playlist.id !== playlistId));
            } catch (error) {
                console.error('Error deleting playlist:', error);
            }
        }
    };

    useEffect(() => {
        if (musicFiles.length === 0) return;

        musicFiles.forEach(file => {
            axios
                .get(`http://localhost:8080/api/rates/file/${file.id}/average`)
                .then(res => {
                    setRatings(prev => ({
                        ...prev,
                        [file.id]: res.data.averageRate
                    }));
                })
                .catch(err =>
                    console.error(`Error loading rating for file ${file.id}`, err)
                );
        });
    }, [musicFiles]);

    if (!user) return <p>Будь ласка, увійдіть до свого акаунту.</p>;

    return (
        <div className="profile-container">
            <h2>Мій профіль</h2>
            {profileData ? (
                <div>
                    {/* ⚙️ Дані профілю */}
                    <div className="profile-details-container">
                        <p><strong>Ім'я:</strong></p>
                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
                        <p><strong>Email:</strong></p>
                        <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                        <button onClick={handleSaveChanges}>Зберегти зміни</button>
                    </div>

                    {/* 🖼 Фото профілю */}
                    <div className="profile-picture-section">
                        <h3>Фото профілю</h3>
                        <img
                            src={`http://localhost:8080/api/users/${profileData.id}/image`}
                            alt="Profile"
                            width="100"
                            height="100"
                            className="profile-picture"
                        />
                        <input type="file" onChange={handleProfilePictureChange} />
                        <button onClick={handleSaveProfilePicture}>Зберегти нове фото</button>
                    </div>

                    {/* 👥 Підписки */}
                    <div className="subscription-info">
                        <p><strong>Підписок:</strong> <Link to="/subscriptions">{subscriptionsCount}</Link></p>
                        <p><strong>Підписників:</strong> <Link to="/followers">{followersCount}</Link></p>
                    </div>

                    {/* 🎵 Файли */}
                    <h2>Мої музичні файли</h2>
                    <div>
                        {musicFiles.length === 0 ? (
                            <p>Немає завантажених файлів.</p>
                        ) : (
                            <ul className="music-file-list">
                                {musicFiles.map((file) => (
                                    <li key={file.id} className="music-file-item">
                                        <div className="file-grid">
                                            <div>
                                                <strong>{file.title}</strong> від{' '}
                                                <strong>{file.uploadedBy?.name || 'Анонім'}</strong>
                                            </div>

                                            {file.id && (
                                                <div className="file-cover-container">
                                                    <Link to={`/music-file/${file.id}`}>
                                                        <img
                                                            src={`http://localhost:8080/api/music-files/cover/${file.id}`}
                                                            alt="Cover"
                                                            className="file-cover-image"
                                                        />
                                                    </Link>
                                                </div>
                                            )}

                                            {/* ✅ Велика кнопка Play */}
                                            <button
                                                className="play-btn"
                                                onClick={() =>
                                                    playTrack({
                                                        id: file.id,
                                                        src: `http://localhost:8080/api/music-files/${file.id}`,
                                                        coverImage: `http://localhost:8080/api/music-files/cover/${file.id}`,
                                                        title: file.title,
                                                    })
                                                }
                                            >
                                                ▶ Play
                                            </button>

                                            <div className="file-info-row">
                                                <div className="file-info-container">
                                                    {file.artist && <p><strong>Виконавець:</strong> {file.artist}</p>}
                                                    {file.genres?.length > 0 && (
                                                        <p>
                                                            <strong>Жанри:</strong> {file.genres.map((g) => g.genre).join(' • ')}
                                                        </p>
                                                    )}
                                                    {file.tags?.length > 0 && (
                                                        <p>
                                                            <strong>Теги:</strong> {file.tags.map((t) => t.tagName).join(' • ')}
                                                        </p>
                                                    )}
                                                    {file.year && <p><strong>Рік:</strong> {file.year}</p>}
                                                </div>

                                                {ratings[file.id] !== undefined && (
                                                    <VerticalReadOnlyRating averageRate={ratings[file.id]} />
                                                )}
                                            </div>
                                            </div>

                                            {user && (user.roles.includes('ADMIN') || Number(user.sub) === file.uploadedBy?.id) && (
                                            <div className="file-actions">
                                                <Link to={`/edit/${file.id}`} state={{ user }}>
                                                    <button>Редагувати</button>
                                                </Link>
                                                <button onClick={() => handleDeleteMusicFile(file.id)}>Видалити</button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 📂 Плейлисти */}
                    <div className="playlists-section">
                        <h3>Мої плейлисти</h3>
                        <Link to="/create-playlist">
                            <button>Створити плейлист</button>
                        </Link>
                        {playlists.length === 0 ? (
                            <p>У вас ще немає плейлистів.</p>
                        ) : (
                            <div>
                                {playlists.map((playlist) => (
                                    <PlaylistCard
                                        key={playlist.id}
                                        playlist={playlist}
                                        onDelete={handleDeletePlaylist}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p>Завантаження профілю...</p>
            )}
        </div>
    );
};

export default ProfilePage;

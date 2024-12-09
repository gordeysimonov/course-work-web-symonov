import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import PlaylistCard from '../components/PlaylistCard'; // Імпортуємо PlaylistCard
import '../css/ProfilePage.css';
import CustomAudioPlayer from "../components/CustomAudioPlayer";

const ProfilePage = ({ user }) => {
    const [profileData, setProfileData] = useState(null);
    const [musicFiles, setMusicFiles] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [subscriptionsCount, setSubscriptionsCount] = useState(0); // Стан для підписок
    const [followersCount, setFollowersCount] = useState(0); // Стан для підписників

    useEffect(() => {
        if (!user) return;

        // Отримання даних профілю
        axios.get(`http://localhost:8080/api/users/${user.sub}`)
            .then((response) => {
                setProfileData(response.data);
                setNewName(response.data.name);
                setNewEmail(response.data.email);
            })
            .catch((error) => {
                console.error('Error fetching user profile', error);
            });

        // Отримання музики користувача
        axios
            .get(`http://localhost:8080/api/music-files`)
            .then((response) => {
                const filteredFiles = response.data.filter(file => file.uploadedBy?.id === Number(user.sub));
                setMusicFiles(filteredFiles);
            })
            .catch((error) => {
                console.error('Error fetching music files:', error);
            });

        // Отримання плейлистів користувача
        axios.get(`http://localhost:8080/api/playlists/user/${user.sub}`)
            .then((response) => {
                setPlaylists(response.data);
            })
            .catch((error) => {
                console.error('Error fetching playlists:', error);
            });

        // Отримання кількості підписок
        axios.get(`http://localhost:8080/api/subscriptions/${user.sub}/subscriptions`)
            .then((response) => {
                setSubscriptionsCount(response.data);
            })
            .catch((error) => {
                console.error('Error fetching subscriptions count:', error);
            });

        // Отримання кількості підписників
        axios.get(`http://localhost:8080/api/subscriptions/${user.sub}/followers`)
            .then((response) => {
                setFollowersCount(response.data);
            })
            .catch((error) => {
                console.error('Error fetching followers count:', error);
            });
    }, [user]);

    const handleProfilePictureChange = (e) => {
        setNewProfilePicture(e.target.files[0]);
    };

    const handleSaveProfilePicture = () => {
        if (newProfilePicture) {
            const formData = new FormData();
            formData.append('file', newProfilePicture);

            axios.put(`http://localhost:8080/api/users/${user.sub}/profile-picture`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then((response) => {
                    setProfileData(response.data);
                })
                .catch((error) => {
                    console.error('Error updating profile picture', error);
                });
        }
    };

    const handleNameChange = (e) => {
        setNewName(e.target.value);
    };

    const handleEmailChange = (e) => {
        setNewEmail(e.target.value);
    };

    const handleSaveChanges = () => {
        const updatedData = { name: newName, email: newEmail };

        axios.put(`http://localhost:8080/api/users/${user.sub}`, updatedData)
            .then((response) => {
                setProfileData(response.data);
            })
            .catch((error) => {
                console.error('Error updating profile data', error);
            });
    };

    const handleDeleteMusicFile = (id) => {
        const confirmDelete = window.confirm('Натисніть ще раз, щоб підтвердити видалення.');
        if (confirmDelete) {
            axios
                .delete(`http://localhost:8080/api/music-files/${id}`, {
                    headers: {
                        userId: user.sub,
                        roles: user.roles.join(','),
                    },
                })
                .then(() => {
                    setMusicFiles(musicFiles.filter((file) => file.id !== id));
                })
                .catch((error) => {
                    console.error('Error deleting music file:', error);
                });
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

    const getProfilePicture = () => {
        if (profileData?.profilePicture) {
            return `data:image/jpeg;base64,${profileData.profilePicture}`;
        } else {
            return 'path/to/default/profile-picture.jpg'; // Шлях до дефолтного фото
        }
    };

    if (!user) {
        return <p>Будь ласка, увійдіть до свого акаунту.</p>;
    }

    return (
        <div className="profile-container">
            <h2>Мій профіль</h2>
            {profileData ? (
                <div>
                    <div className="profile-details-container">
                        <p><strong>Ім'я:</strong></p>
                        <input
                            type="text"
                            value={newName}
                            onChange={handleNameChange}
                        />
                        <p><strong>Email:</strong></p>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={handleEmailChange}
                        />
                        <button onClick={handleSaveChanges}>Зберегти зміни</button>
                    </div>

                    <div className="profile-picture-section">
                        <h3>Фото профілю</h3>
                        <img
                            src={getProfilePicture()}
                            alt="Profile"
                        />
                        <input type="file" onChange={handleProfilePictureChange}/>
                        <button onClick={handleSaveProfilePicture}>Зберегти нове фото</button>
                    </div>

                    <div className="subscription-info">
                        <p><strong>Підписок:</strong> <Link to="/subscriptions">{subscriptionsCount}</Link></p>
                        <p><strong>Підписників:</strong> <Link to="/followers">{followersCount}</Link></p>
                    </div>

                    <div className="create-file-container">
                        <Link to="/create-file">
                            <button>Перейти до створення файлу</button>
                        </Link>
                    </div>

                    <h2>Мої музичні файли</h2>
                    {/* Музика */}
                    <div>
                        {musicFiles.length === 0 ? (
                            <p>Немає завантажених файлів.</p>
                        ) : (
                            <ul className="music-file-list">
                                {musicFiles.map((file) => (
                                    <li key={file.id} className="music-file-item">
                                        <div className="file-grid">
                                            {/* Перша частина (Назва та хто опублікував) */}
                                            <div className="file-title-container">
                                                <strong>{file.title}</strong> від{' '}
                                                <strong>{file.uploadedBy?.name || 'Анонім'}</strong>
                                            </div>

                                            {/* Друга частина (Обкладинка) */}
                                            {file.coverImage && (
                                                <div className="file-cover-container">
                                                    <Link to={`/music-file/${file.id}`}>
                                                        <img
                                                            src={`data:image/jpeg;base64,${file.coverImage}`}
                                                            alt="Cover"
                                                            className="file-cover-image"
                                                        />
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Третя частина (Кастомний програвач) */}
                                            <div className="audio-player-container">
                                                <CustomAudioPlayer
                                                    src={`http://localhost:8080/api/music-files/${file.id}`}/>
                                            </div>

                                            {/* Четверта частина (Інформація про файл) */}
                                            <div className="file-info-container">
                                                {file.artist && <p><strong>Виконавець:</strong> {file.artist}</p>}
                                                {file.genres?.length > 0 && (
                                                    <p>
                                                        <strong>Жанри:</strong> {file.genres.map((genre) => genre.genre).join(' • ')}
                                                    </p>
                                                )}
                                                {file.tags?.length > 0 && (
                                                    <p>
                                                        <strong>Теги:</strong> {file.tags.map((tag) => tag.tagName).join(' • ')}
                                                    </p>
                                                )}
                                                {file.year && <p><strong>Рік:</strong> {file.year}</p>}
                                            </div>
                                        </div>

                                        {/* Кнопки редагування та видалення внизу блоку */}
                                        {user && (user.roles.includes('ADMIN') || Number(user.sub) === file.uploadedBy?.id) && (
                                            <div className="file-actions">
                                                <Link to={`/edit/${file.id}`} state={{user}}>
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

                    {/* Плейлисти */}
                    <div className="playlists-section">
                        <h3>Мої плейлисти</h3>
                        <Link to="/create-playlist">
                            <button>Створити плейлист</button>
                        </Link>
                        {playlists.length === 0 ? (
                            <p>У вас ще немає плейлистів.</p>
                        ) : (
                            <div>
                                {playlists.map(playlist => (
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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import CustomAudioPlayer from '../components/CustomAudioPlayer'; // Імпортуємо кастомний програвач
import '../css/UserProfile.css'; // Імпортуємо файл стилів

const UserProfile = ({ user }) => {
    const { userId } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [musicFiles, setMusicFiles] = useState([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/users/${userId}`)
            .then((response) => {
                setProfileData(response.data);
            })
            .catch((error) => {
                console.error('Error fetching user profile:', error);
                setError('Не вдалося завантажити профіль користувача.');
            });
    }, [userId]);

    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/music-files`)
            .then((response) => {
                const filteredFiles = response.data.filter(file => file.uploadedBy?.id === Number(userId));
                setMusicFiles(filteredFiles);
            })
            .catch((error) => {
                console.error('Error fetching music files:', error);
                setError('Не вдалося завантажити список музичних файлів.');
            });
    }, [userId]);

    useEffect(() => {
        if (user) {
            axios
                .get(`http://localhost:8080/api/subscriptions/${user.sub}/${userId}`)
                .then((response) => {
                    if (response.data === "Підписка існує") {
                        setIsSubscribed(true);
                    } else {
                        setIsSubscribed(false);
                    }
                })
                .catch((error) => {
                    console.error('Error checking subscription:', error);
                    setError('Не вдалося перевірити підписку.');
                });
        }
    }, [user, userId]);

    const handleSubscribe = () => {
        if (user) {
            axios
                .post(`http://localhost:8080/api/subscriptions/${user.sub}/${userId}`)
                .then(() => {
                    setIsSubscribed(true);
                })
                .catch((error) => {
                    console.error('Error subscribing:', error);
                });
        }
    };

    const handleUnsubscribe = () => {
        if (user) {
            axios
                .delete(`http://localhost:8080/api/subscriptions/${user.sub}/${userId}`)
                .then(() => {
                    setIsSubscribed(false);
                })
                .catch((error) => {
                    console.error('Error unsubscribing:', error);
                    alert('Не вдалося відписатися.');
                });
        }
    };

    const handleDelete = (id) => {
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

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="profile-container">
            <h2>Профіль користувача</h2>
            {profileData ? (
                <>
                    <div className="profile-info">
                        <img
                            src={profileData.profilePicture ? `data:image/jpeg;base64,${profileData.profilePicture}` : 'path/to/default/profile-picture.jpg'}
                            alt="Profile"
                            width="100"
                            height="100"
                            className="profile-picture"
                        />
                        <div className="profile-details">
                            <p><strong>Ім'я:</strong> {profileData.name}</p>
                            <p><strong>Email:</strong> {profileData.email}</p>
                            <p><strong>Дата реєстрації:</strong> {new Date(profileData.registrationDate).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {user && user.sub !== userId && (
                        <div className="subscribe-buttons">
                            {!isSubscribed ? (
                                <button className="subscribe-button" onClick={handleSubscribe}>Підписатися</button>
                            ) : (
                                <button className="unsubscribe-button" onClick={handleUnsubscribe}>Відписатися</button>
                            )}
                        </div>
                    )}

                    <h2>Музичні файли</h2>
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
                                            <button onClick={() => handleDelete(file.id)}>Видалити</button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            ) : (
                <p>Завантаження профілю...</p>
            )}
        </div>
    );
};

export default UserProfile;

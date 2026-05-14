import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/MusicList.css';
import { PlayerContext } from '../context/PlayerContext';
import ReadOnlyStarRating from "../components/ReadOnlyStarRating";

const PlaylistPage = ({ user }) => {

    // Отримання ID плейлиста з URL
    const { playlistId } = useParams();

    // Стани сторінки
    const [playlistData, setPlaylistData] = useState(null);
    const [musicFiles, setMusicFiles] = useState([]);
    const [error, setError] = useState(null);
    const [ratings, setRatings] = useState({});

    // Функція запуску всього плейлиста
    const { playPlaylist } = useContext(PlayerContext);

    // Завантаження інформації про плейлист
    useEffect(() => {
        const fetchPlaylistData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/playlists/${playlistId}`);
                setPlaylistData(response.data);
            } catch (error) {
                console.error('Error fetching playlist data:', error);
                setError('Не вдалося завантажити дані плейлиста.');
            }
        };

        fetchPlaylistData();
    }, [playlistId]);

    // Завантаження музичних файлів, які належать до плейлиста
    useEffect(() => {
        const fetchMusicFiles = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/music-files');

                const filteredFiles = response.data.filter((file) =>
                    file.playlists?.some((playlist) => playlist.id === Number(playlistId))
                );

                setMusicFiles(filteredFiles);
            } catch (error) {
                console.error('Error fetching music files:', error);
                setError('Не вдалося завантажити список музичних файлів.');
            }
        };

        fetchMusicFiles();
    }, [playlistId]);

    // Видалення треку з плейлиста
    const handleRemoveFromPlaylist = async (fileId) => {
        try {
            await axios.delete(`http://localhost:8080/api/playlists/${playlistId}/remove-music/${fileId}`);

            setMusicFiles(musicFiles.filter((file) => file.id !== fileId));
        } catch (error) {
            console.error('Error removing music from playlist:', error);
        }
    };

    // Завантаження рейтингу для кожного треку
    useEffect(() => {
        if (musicFiles.length === 0) return;

        musicFiles.forEach(file => {
            Promise.all([
                axios.get(`http://localhost:8080/api/rates/file/${file.id}/average`),
                axios.get(`http://localhost:8080/api/rates/file/${file.id}`)
            ])
                .then(([avgRes, countRes]) => {
                    setRatings(prev => ({
                        ...prev,
                        [file.id]: {
                            averageRate: avgRes.data.averageRate,
                            ratesCount: countRes.data.length
                        }
                    }));
                })
                .catch(err =>
                    console.error(`Error loading rating for file ${file.id}`, err)
                );
        });
    }, [musicFiles]);

    // Повідомлення про помилку
    if (error) {
        return <div>{error}</div>;
    }

    // Повідомлення під час завантаження
    if (!playlistData) {
        return <div>Завантаження...</div>;
    }

    return (
        <div className="music-list">

            {/* Назва плейлиста */}
            <h2 className="playlist-title">{playlistData.name}</h2>

            <h3>Пісні цього плейлиста</h3>

            {musicFiles.length > 0 ? (

                <ul className="music-list">

                    {musicFiles.map((file, index) => (

                        <li key={file.id} className="file-item">

                            {/* Назва треку */}
                            <div className="file-title">
                                <strong>{file.title}</strong>
                            </div>

                            {/* Автор завантаження */}
                            <div className="file-user">
                                <span>від </span>

                                <Link
                                    to={user?.sub === file.uploadedBy?.id.toString()
                                        ? `/profile`
                                        : `/user-profile/${file.uploadedBy?.id}`}
                                >
                                    {file.uploadedBy?.name || 'Анонім'}
                                </Link>
                            </div>

                            {/* Обкладинка треку */}
                            {file.id && (
                                <div className="file-cover">
                                    <Link to={`/music-file/${file.id}`}>
                                        <img
                                            src={`http://localhost:8080/api/music-files/cover/${file.id}`}
                                            alt="Cover"
                                            width="200"
                                            height="200"
                                        />
                                    </Link>
                                </div>
                            )}

                            {/* Рейтинг треку */}
                            <div className="readonly-rating">
                                {ratings[file.id] && (
                                    <ReadOnlyStarRating
                                        averageRate={ratings[file.id].averageRate}
                                        ratesCount={ratings[file.id].ratesCount}
                                    />
                                )}
                            </div>

                            {/* Запуск плейлиста з поточного треку */}
                            <button
                                className="play-btn"
                                onClick={() =>
                                    playPlaylist(
                                        musicFiles.map(f => ({
                                            id: f.id,
                                            src: `http://localhost:8080/api/music-files/${f.id}`,
                                            coverImage: `http://localhost:8080/api/music-files/cover/${f.id}`,
                                            title: f.title,
                                        })),
                                        index
                                    )
                                }
                            >
                                ▶ Play
                            </button>

                            {/* Детальна інформація про трек */}
                            <div className="file-details">
                                {file.artist && (
                                    <p><strong>Виконавець:</strong> {file.artist}</p>
                                )}

                                {file.genres && file.genres.length > 0 && (
                                    <p><strong>Жанри:</strong> {file.genres.map(genre => genre.genre).join(' • ')}</p>
                                )}

                                {file.tags && file.tags.length > 0 && (
                                    <p><strong>Теги:</strong> {file.tags.map(tag => tag.tagName).join(' • ')}</p>
                                )}

                                {file.year && (
                                    <p><strong>Рік:</strong> {file.year}</p>
                                )}
                            </div>

                            {/* Видалення треку з плейлиста */}
                            <button
                                className="remove-button"
                                onClick={() => handleRemoveFromPlaylist(file.id)}
                            >
                                Видалити з плейлиста
                            </button>
                        </li>
                    ))}
                </ul>

            ) : (

                // Повідомлення про порожній плейлист
                <p>Цей плейлист не містить пісень.</p>
            )}

            {/* Перехід до сторінки додавання треку */}
            <Link to={`/add-music-to-playlist/${playlistId}`}>
                <button className="add-music-button">
                    Додати пісню до цього плейлиста
                </button>
            </Link>
        </div>
    );
};

export default PlaylistPage;
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/MusicList.css';
import CustomAudioPlayer from "../components/CustomAudioPlayer"; // Імпортуємо стилі

const PlaylistPage = ({ user }) => {
    const { playlistId } = useParams(); // Отримуємо ID плейлиста з URL
    const [playlistData, setPlaylistData] = useState(null);
    const [musicFiles, setMusicFiles] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Отримуємо плейлист для відображення його інформації
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

    useEffect(() => {
        // Отримуємо всі музичні файли та фільтруємо їх за плейлистом
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

    const handleAddToPlaylist = async (fileId) => {
        try {
            await axios.post(`http://localhost:8080/api/playlists/${playlistId}/add-music/${fileId}`);
            setMusicFiles([...musicFiles, { id: fileId }]); // Оновлюємо список пісень
        } catch (error) {
            console.error('Error adding music to playlist:', error);
        }
    };

    const handleRemoveFromPlaylist = async (fileId) => {
        try {
            await axios.delete(`http://localhost:8080/api/playlists/${playlistId}/remove-music/${fileId}`);
            setMusicFiles(musicFiles.filter((file) => file.id !== fileId)); // Оновлюємо список пісень
        } catch (error) {
            console.error('Error removing music from playlist:', error);
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!playlistData) {
        return <div>Завантаження...</div>;
    }

    return (
        <div className="music-list"> {/* Контейнер для списку */}
            <h2 className="playlist-title">{playlistData.name}</h2>

            <h3>Пісні цього плейлиста</h3>
            {musicFiles.length > 0 ? (
                <ul className="music-list">
                    {musicFiles.map((file) => (
                        <li key={file.id} className="file-item">
                            <div className="file-title">
                                <strong>{file.title}</strong>
                            </div>
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
                            {file.coverImage && (
                                <div className="file-cover">
                                    <Link to={`/music-file/${file.id}`}>
                                        <img
                                            src={`data:image/jpeg;base64,${file.coverImage}`}
                                            alt="Cover"
                                            width="200"
                                            height="200"
                                        />
                                    </Link>
                                </div>
                            )}
                            {/* Використовуємо кастомний програвач */}
                            <CustomAudioPlayer src={`http://localhost:8080/api/music-files/${file.id}`}/>
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

                            <button className="remove-button" onClick={() => handleRemoveFromPlaylist(file.id)}>
                                Видалити з плейлиста
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Цей плейлист не містить пісень.</p>
            )}

            <Link to={`/add-music-to-playlist/${playlistId}`}>
                <button className="add-music-button">Додати пісню до цього плейлиста</button>
            </Link>
        </div>
    );
};

export default PlaylistPage;

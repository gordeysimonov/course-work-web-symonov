import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/MusicList.css';
import { PlayerContext } from '../context/PlayerContext';

const PlaylistPage = ({ user }) => {
    const { playlistId } = useParams();
    const [playlistData, setPlaylistData] = useState(null);
    const [musicFiles, setMusicFiles] = useState([]);
    const [error, setError] = useState(null);

    const { playPlaylist } = useContext(PlayerContext); // ✅ замість playTrack

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

    const handleRemoveFromPlaylist = async (fileId) => {
        try {
            await axios.delete(`http://localhost:8080/api/playlists/${playlistId}/remove-music/${fileId}`);
            setMusicFiles(musicFiles.filter((file) => file.id !== fileId));
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
        <div className="music-list">
            <h2 className="playlist-title">{playlistData.name}</h2>

            <h3>Пісні цього плейлиста</h3>
            {musicFiles.length > 0 ? (
                <ul className="music-list">
                    {musicFiles.map((file, index) => (
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

                            {/* ✅ запуск плейлиста з цього треку */}
                            <button
                                className="play-btn"
                                onClick={() =>
                                    playPlaylist(
                                        musicFiles.map(f => ({
                                            id: f.id,
                                            src: `http://localhost:8080/api/music-files/${f.id}`,
                                            coverImage: f.coverImage,
                                            title: f.title,
                                        })),
                                        index
                                    )
                                }
                            >
                                ▶ Play
                            </button>

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
                <p>Цей плейлист не містить пісень.</p>
            )}

            <Link to={`/add-music-to-playlist/${playlistId}`}>
                <button className="add-music-button">Додати пісню до цього плейлиста</button>
            </Link>
        </div>
    );
};

export default PlaylistPage;

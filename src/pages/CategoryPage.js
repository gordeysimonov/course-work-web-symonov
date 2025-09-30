import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/CategoryPage.css';
import { PlayerContext } from '../context/PlayerContext'; // ✅ підключаємо контекст

const CategoryPage = ({ user }) => {
    const { id } = useParams();
    const [category, setCategory] = useState(null);
    const [musicFiles, setMusicFiles] = useState([]);

    const { playTrack } = useContext(PlayerContext); // ✅ функція для запуску треку

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const categoryResponse = await axios.get(`http://localhost:8080/api/categories/${id}`);
                setCategory(categoryResponse.data);

                const musicFilesResponse = await axios.get('http://localhost:8080/api/music-files');
                const filteredFiles = musicFilesResponse.data.filter((file) =>
                    file.categories.some((category) => category.id === parseInt(id))
                );
                setMusicFiles(filteredFiles);
            } catch (error) {
                console.error('Error fetching category or music files:', error);
            }
        };

        fetchCategory();
    }, [id]);

    if (!category) {
        return <div className="loading">Завантаження...</div>;
    }

    return (
        <div className="category-page-container">
            <h2>{category.name}</h2>
            {category.categoryImagePath && (
                <img
                    className="category-image"
                    src={`http://localhost:8080/api/categories/${category.id}/image`}
                    alt={category.name}
                />
            )}
            <p className="category-description">{category.description}</p>

            <h2>Музичні файли цієї категорії</h2>
            <div className="music-list">
                {musicFiles.length === 0 ? (
                    <p>Наразі немає завантажених файлів, що відповідають пошуковому запиту.</p>
                ) : (
                    <ul className="music-list">
                        {musicFiles.map((file) => (
                            <li key={file.id} className="file-item">
                                <div className="file-title">
                                    <strong>{file.title}</strong>
                                </div>
                                <div className="file-user">
                                    <span>від </span>
                                    <Link
                                        to={
                                            user?.sub === file.uploadedBy.id.toString()
                                                ? '/profile'
                                                : `/user-profile/${file.uploadedBy.id}`
                                        }
                                    >
                                        {file.uploadedBy.name || 'Анонім'}
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

                                {/* ✅ кнопка Play як у MusicList */}
                                <button
                                    className="play-btn"
                                    onClick={() =>
                                        playTrack({
                                            id: file.id,
                                            src: `http://localhost:8080/api/music-files/${file.id}`,
                                            coverImage: file.coverImage,
                                            title: file.title,
                                        })
                                    }
                                >
                                    ▶ Play
                                </button>

                                <div className="file-details">
                                    {file.artist && (
                                        <p>
                                            <strong>Виконавець:</strong> {file.artist}
                                        </p>
                                    )}
                                    {file.genres && file.genres.length > 0 && (
                                        <p>
                                            <strong>Жанри:</strong>{' '}
                                            {file.genres.map((genre) => genre.genre).join(' • ')}
                                        </p>
                                    )}
                                    {file.tags && file.tags.length > 0 && (
                                        <p>
                                            <strong>Теги:</strong>{' '}
                                            {file.tags.map((tag) => tag.tagName).join(' • ')}
                                        </p>
                                    )}
                                    {file.year && (
                                        <p>
                                            <strong>Рік:</strong> {file.year}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;

import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/CategoryPage.css';
import { PlayerContext } from '../context/PlayerContext';
import ReadOnlyStarRating from "../components/ReadOnlyStarRating";

const CategoryPage = ({ user }) => {

    const { id } = useParams();

    const [category, setCategory] = useState(null);
    const [musicFiles, setMusicFiles] = useState([]);
    const [ratings, setRatings] = useState({});
    const [error, setError] = useState('');

    const { playTrack } = useContext(PlayerContext);

    // Завантаження інформації про категорію та музичні файли
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setError('');

                const categoryResponse = await axios.get(`http://localhost:8080/api/categories/${id}`);
                const categoryData = categoryResponse.data;

                setCategory(categoryData);

                // Якщо відкрита категорія рекомендацій
                if (categoryData.name === 'RECOMMENDATIONS') {

                    // Для рекомендацій користувач повинен бути авторизований.
                    if (!user) {
                        setMusicFiles([]);
                        return;
                    }

                    const recommendationsResponse = await axios.get(
                        `http://localhost:8080/api/recommendations/user/${user.sub}`
                    );

                    setMusicFiles(recommendationsResponse.data);

                } else {

                    // Завантаження музичних файлів категорії
                    const musicFilesResponse = await axios.get('http://localhost:8080/api/music-files');

                    const filteredFiles = musicFilesResponse.data.filter((file) =>
                        file.categories?.some((category) => category.id === parseInt(id))
                    );

                    setMusicFiles(filteredFiles);
                }

            } catch (error) {
                console.error('Error fetching category or music files:', error);
                setError('Не вдалося завантажити дані категорії.');
            }
        };

        fetchCategory();

    }, [id, user]);

    // Завантаження рейтингу для кожного музичного файлу
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

    // Відображення індикатора завантаження
    if (!category) {
        return <div className="loading">Завантаження...</div>;
    }

    const isRecommendationsCategory = category.name === 'RECOMMENDATIONS';

    return (
        <div className="category-page-container">

            {/* Назва категорії */}
            <h2>{category.name}</h2>

            {/* Зображення категорії */}
            {category.categoryImagePath && (
                <img
                    className="category-image"
                    src={`http://localhost:8080/api/categories/${category.id}/image`}
                    alt={category.name}
                />
            )}

            {/* Опис категорії */}
            <p className="category-description">{category.description}</p>

            {error && <p className="error">{error}</p>}

            <h2>
                {isRecommendationsCategory
                    ? 'Рекомендовані для вас треки'
                    : 'Музичні файли цієї категорії'}
            </h2>

            <div className="music-list">

                {/* Повідомлення для неавторизованого користувача */}
                {isRecommendationsCategory && !user ? (

                    <p>Увійдіть у систему, щоб переглянути персональні рекомендації.</p>

                ) : musicFiles.length === 0 ? (

                    <p>Наразі немає завантажених файлів, що відповідають пошуковому запиту.</p>

                ) : (

                    <ul className="music-list">
                        {musicFiles.map((file) => {

                            // Дані автора треку
                            const uploadedById = isRecommendationsCategory
                                ? file.uploadedById
                                : file.uploadedBy?.id;

                            const uploadedByName = isRecommendationsCategory
                                ? file.uploadedByName
                                : file.uploadedBy?.name;

                            return (
                                <li key={file.id} className="file-item">

                                    {/* Назва треку */}
                                    <div className="file-title">
                                        <strong>{file.title}</strong>

                                        {/* Рівень рекомендації */}
                                        {isRecommendationsCategory && (
                                            <p className="recommendation-score">
                                                Рекомендованість: {(file.recommendationScore * 100).toFixed(1)}%
                                            </p>
                                        )}
                                    </div>

                                    {/* Інформація про автора */}
                                    <div className="file-user">
                                        <span>від </span>

                                        <Link
                                            to={
                                                user?.sub === uploadedById?.toString()
                                                    ? '/profile'
                                                    : `/user-profile/${uploadedById}`
                                            }
                                        >
                                            {uploadedByName || 'Анонім'}
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

                                    {/* Відображення рейтингу */}
                                    <div className="readonly-rating">
                                        {ratings[file.id] && (
                                            <ReadOnlyStarRating
                                                averageRate={ratings[file.id].averageRate}
                                                ratesCount={ratings[file.id].ratesCount}
                                            />
                                        )}
                                    </div>

                                    {/* Кнопка відтворення треку */}
                                    <button
                                        className="play-btn"
                                        onClick={() => {

                                            // Запуск треку у плеєрі
                                            playTrack({
                                                id: file.id,
                                                src: `http://localhost:8080/api/music-files/${file.id}`,
                                                coverImage: `http://localhost:8080/api/music-files/cover/${file.id}`,
                                                title: file.title,
                                            });

                                            // Фіксація прослуховування для рекомендацій
                                            if (user) {
                                                axios.post(
                                                    `http://localhost:8080/api/recommendations/user/${user.sub}/play/${file.id}`
                                                );
                                            }
                                        }}
                                    >
                                        ▶ Play
                                    </button>

                                    {/* Додаткова інформація про трек */}
                                    <div className="file-details">

                                        {file.artist && (
                                            <p>
                                                <strong>Виконавець:</strong> {file.artist}
                                            </p>
                                        )}

                                        {!isRecommendationsCategory && file.genres && file.genres.length > 0 && (
                                            <p>
                                                <strong>Жанри:</strong>{' '}
                                                {file.genres.map((genre) => genre.genre).join(' • ')}
                                            </p>
                                        )}

                                        {!isRecommendationsCategory && file.tags && file.tags.length > 0 && (
                                            <p>
                                                <strong>Теги:</strong>{' '}
                                                {file.tags.map((tag) => tag.tagName).join(' • ')}
                                            </p>
                                        )}

                                        {!isRecommendationsCategory && file.year && (
                                            <p>
                                                <strong>Рік:</strong> {file.year}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
// Сторінка завантаження музичних файлів користувачем

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/CreateFilePage.css';

const UploadMusicPage = ({ user }) => {

    // Стани для збереження даних форми
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [cover, setCover] = useState(null);
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [tags, setTags] = useState([]);
    const [year, setYear] = useState(2024);

    // Повідомлення та помилки
    const [message, setMessage] = useState('');
    const [fileError, setFileError] = useState('');
    const [coverError, setCoverError] = useState('');

    // Дані прогнозування жанрів
    const [predictedGenres, setPredictedGenres] = useState([]);
    const [predictionError, setPredictionError] = useState('');
    const [isPredicting, setIsPredicting] = useState(false);

    const navigate = useNavigate();

    // Завантаження списку жанрів із сервера
    useEffect(() => {
        axios.get('http://localhost:8080/api/genres')
            .then((response) => {
                setGenres(response.data);
            })
            .catch((error) => {
                console.error('Error fetching genres:', error);
            });
    }, []);

    // Обробка вибору жанрів
    const handleGenreChange = (event) => {
        const genreId = event.target.value;

        setSelectedGenres((prevSelectedGenres) =>
            prevSelectedGenres.includes(genreId)
                ? prevSelectedGenres.filter((id) => id !== genreId)
                : [...prevSelectedGenres, genreId]
        );
    };

    // Обробка введення тегів
    const handleTagsChange = (e) => {
        const value = e.target.value;

        const tagList = value
            .split(' ')
            .filter(tag => tag.startsWith('#'))
            .map(tag => tag.trim());

        setTags(tagList);
    };

    // Обробка вибору музичного файлу
    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];

        // Перевірка формату MP3
        if (selectedFile && !selectedFile.name.endsWith('.mp3')) {
            setFileError('Будь ласка, виберіть MP3 файл.');
            setFile(null);
            setPredictedGenres([]);
            return;
        }

        setFileError('');
        setFile(selectedFile);
        setPredictedGenres([]);
        setPredictionError('');

        if (!selectedFile) return;

        try {

            // Запуск аналізу жанру
            setIsPredicting(true);

            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await axios.post(
                'http://localhost:8080/api/music-files/predict-genres',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Отримання рекомендованих жанрів
            if (response.data?.predictions) {
                setPredictedGenres(response.data.predictions);

            } else if (response.data?.error) {
                setPredictionError(response.data.error);
            }

        } catch (error) {
            console.error('Помилка при аналізі жанру:', error);

            setPredictionError(
                error.response?.data?.error || 'Не вдалося визначити жанр'
            );

        } finally {
            setIsPredicting(false);
        }
    };

    // Обробка вибору обкладинки
    const handleCoverChange = (e) => {
        const selectedCover = e.target.files[0];

        // Перевірка формату зображення
        if (selectedCover && !selectedCover.type.startsWith('image/')) {

            setCoverError('Будь ласка, виберіть файл зображення (наприклад, JPG, PNG).');
            setCover(null);

        } else {

            setCoverError('');
            setCover(selectedCover);
        }
    };

    // Відправка форми завантаження
    const handleSubmit = (e) => {
        e.preventDefault();

        // Перевірка вибору жанру
        if (!selectedGenres || selectedGenres.length === 0) {
            setMessage('Ви повинні вибрати хоча б один жанр.');
            return;
        }

        const formData = new FormData();

        formData.append('file', file);
        formData.append('title', title);
        formData.append('artist', artist);

        if (cover) {
            formData.append('coverImage', cover);
        }

        formData.append('genreIds', selectedGenres);
        formData.append('year', year);

        // Завантаження музичного файлу
        axios.post(`http://localhost:8080/api/music-files`, formData, {
            headers: {
                'userId': Number(user.sub),
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => {

                const musicFileId = response.data.id;

                // Додавання тегів до файлу
                axios.post(`http://localhost:8080/api/music-files/${musicFileId}/tags`, tags, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                    .then(() => {

                        setMessage('Файл і теги успішно завантажено!');
                        navigate('/');

                    })
                    .catch((error) => {

                        console.error('Помилка при додаванні тегів:', error);
                        setMessage('Файл завантажено, але теги не додано.');
                    });

            })
            .catch((error) => {

                console.error('Помилка при завантаженні файлу:', error);
                setMessage('Помилка при завантаженні файлу.');
            });
    };

    return (
        <div className="upload-music-page">

            {/* Заголовок сторінки */}
            <h1>Завантажити музику</h1>

            {user ? (

                <form onSubmit={handleSubmit}>

                    {/* Поле назви треку */}
                    <div>
                        <input
                            type="text"
                            placeholder="Назва пісні"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Поле виконавця */}
                    <div>
                        <input
                            type="text"
                            placeholder="Виконавець"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            required
                        />
                    </div>

                    {/* Завантаження MP3 файлу */}
                    <div>
                        <label>Файл MP3:</label>

                        <input
                            type="file"
                            accept=".mp3"
                            onChange={handleFileChange}
                            required
                        />

                        {fileError && <p className="error-message">{fileError}</p>}
                    </div>

                    {/* Відображення рекомендованих жанрів */}
                    <div>

                        <label>Рекомендовані жанри:</label>

                        {isPredicting && <p>Аналіз треку...</p>}

                        {predictionError && (
                            <p className="error-message">{predictionError}</p>
                        )}

                        {!isPredicting && predictedGenres.length > 0 && (
                            <div className="predicted-genres-box">

                                <p><strong>Модель рекомендує:</strong></p>

                                <ul>
                                    {predictedGenres.map((item, index) => (
                                        <li key={index}>
                                            {item.genre} — {(item.probability * 100).toFixed(1)}%
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Завантаження обкладинки */}
                    <div>

                        <label>Обкладинка (зображення):</label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            required
                        />

                        {coverError && <p className="error-message">{coverError}</p>}
                    </div>

                    {/* Вибір жанрів */}
                    <div>

                        <label>Виберіть жанри:</label>

                        {genres.length > 0 ? (

                            genres.map((genre) => (
                                <div key={genre.id}>

                                    <input
                                        type="checkbox"
                                        value={genre.id}
                                        onChange={handleGenreChange}
                                    />

                                    {genre.genre}
                                </div>
                            ))

                        ) : (
                            <p>Жанри не знайдені.</p>
                        )}
                    </div>

                    {/* Вибір року */}
                    <div>

                        <label>Рік випуску:</label>

                        <input
                            type="number"
                            min="0"
                            max="2026"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        />
                    </div>

                    {/* Поле тегів */}
                    <div>

                        <label>Теги:</label>

                        <input
                            type="text"
                            value={tags.join(' ')}
                            onChange={handleTagsChange}
                            placeholder="Введіть теги (наприклад: #музика #пісня)"
                        />
                    </div>

                    {/* Кнопка завантаження */}
                    <button type="submit">Завантажити</button>
                </form>

            ) : (

                // Повідомлення про неавторизованого користувача
                <p>Будь ласка, увійдіть, щоб завантажити музику.</p>
            )}

            {/* Повідомлення про результат операції */}
            {message && (
                <p className={`message ${message.includes('успішно') ? 'success' : ''}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default UploadMusicPage;;
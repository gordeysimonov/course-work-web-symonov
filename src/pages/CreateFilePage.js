import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/CreateFilePage.css';

const UploadMusicPage = ({ user }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [cover, setCover] = useState(null);
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [tags, setTags] = useState([]);
    const [year, setYear] = useState(2024);
    const [message, setMessage] = useState('');
    const [fileError, setFileError] = useState('');
    const [coverError, setCoverError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/api/genres')
            .then((response) => {
                setGenres(response.data);
            })
            .catch((error) => {
                console.error('Error fetching genres:', error);
            });
    }, []);

    const handleGenreChange = (event) => {
        const genreId = event.target.value;
        setSelectedGenres((prevSelectedGenres) =>
            prevSelectedGenres.includes(genreId)
                ? prevSelectedGenres.filter((id) => id !== genreId)
                : [...prevSelectedGenres, genreId]
        );
    };

    const handleTagsChange = (e) => {
        const value = e.target.value;
        const tagList = value
            .split(' ')
            .filter(tag => tag.startsWith('#'))
            .map(tag => tag.trim());
        setTags(tagList);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && !selectedFile.name.endsWith('.mp3')) {
            setFileError('Будь ласка, виберіть MP3 файл.');
            setFile(null);
        } else {
            setFileError('');
            setFile(selectedFile);
        }
    };

    const handleCoverChange = (e) => {
        const selectedCover = e.target.files[0];
        if (selectedCover && !selectedCover.type.startsWith('image/')) {
            setCoverError('Будь ласка, виберіть файл зображення (наприклад, JPG, PNG).');
            setCover(null);
        } else {
            setCoverError('');
            setCover(selectedCover);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

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

        axios.post(`http://localhost:8080/api/music-files`, formData, {
            headers: {
                'userId': Number(user.sub),
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => {
                const musicFileId = response.data.id;
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
            <h1>Завантажити музику</h1>
            {user ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="text"
                            placeholder="Назва пісні"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Виконавець"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            required
                        />
                    </div>
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
                    <div>
                        <label>Рік випуску:</label>
                        <input
                            type="number"
                            min="0"
                            max="2024"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>Теги:</label>
                        <input
                            type="text"
                            value={tags.join(' ')}
                            onChange={handleTagsChange}
                            placeholder="Введіть теги (наприклад: #музика #пісня)"
                        />
                    </div>

                    <button type="submit">Завантажити</button>
                </form>
            ) : (
                <p>Будь ласка, увійдіть, щоб завантажити музику.</p>
            )}
            {message && <p className={`message ${message.includes('успішно') ? 'success' : ''}`}>{message}</p>}
        </div>
    );
};

export default UploadMusicPage;

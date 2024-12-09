import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../css/MusicList.css';
import CustomAudioPlayer from './CustomAudioPlayer';

const MusicList = ({ user }) => {
    const [musicFiles, setMusicFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('year');
    const [yearRange, setYearRange] = useState([0, new Date().getFullYear()]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        axios
            .get('http://localhost:8080/api/genres')
            .then((response) => {
                setGenres(response.data);
            })
            .catch((error) => {
                console.error('Error fetching genres:', error);
                setError('Не вдалося завантажити список жанрів.');
            });
    }, []);

    const handleSearchChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const handleYearRangeChange = (event) => {
        const [startYear, endYear] = event.target.value.split('-').map(Number);
        setYearRange([startYear, endYear]);
    };

    const handleGenreChange = (event) => {
        const selected = Array.from(event.target.selectedOptions, (option) => option.value);
        setSelectedGenres(selected);
    };

    useEffect(() => {
        axios
            .get('http://localhost:8080/api/music-files')
            .then((response) => {
                setMusicFiles(response.data);
                setFilteredFiles(response.data);
            })
            .catch((error) => {
                console.error('Error fetching music files:', error);
                setError('Не вдалося завантажити список музичних файлів.');
            });
    }, []);

    const filterAndSortFiles = () => {
        let files = [...musicFiles];

        if (searchQuery.trim()) {
            files = files.filter((file) =>
                file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (file.tags?.some(tag => tag.tagName.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                (file.genres?.some(genre => genre.genre.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                (file.uploadedBy?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (file.year?.toString().includes(searchQuery.trim()))
            );
        }

        files = files.filter(file => file.year >= yearRange[0] && file.year <= yearRange[1]);

        if (selectedGenres.length > 0) {
            files = files.filter(file => file.genres?.some(genre => selectedGenres.includes(genre.genre)));
        }

        if (sortOption === 'year') {
            files.sort((a, b) => b.year - a.year);
        } else if (sortOption === 'date') {
            files.sort((a, b) => new Date(b.downloadDate) - new Date(a.downloadDate));
        }

        setFilteredFiles(files);
    };

    useEffect(() => {
        filterAndSortFiles();
    }, [searchQuery, sortOption, yearRange, selectedGenres, musicFiles]);

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
                    alert('Файл успішно видалено!');
                    setMusicFiles(musicFiles.filter((file) => file.id !== id));
                    setFilteredFiles(filteredFiles.filter((file) => file.id !== id));
                })
                .catch((error) => {
                    console.error('Error deleting music file:', error);
                    if (error.response) {
                        alert(`Помилка: ${error.response.data}`);
                    } else {
                        alert('Не вдалося видалити файл.');
                    }
                });
        }
    };

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="music-list">
            <h2>Список музики</h2>

            <div className="filter-group">
                <input
                    type="text"
                    placeholder="Пошук..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="filter-group">
                <label>Фільтрувати за роком:</label>
                <input
                    type="text"
                    placeholder="0-2024"
                    value={`${yearRange[0]}-${yearRange[1]}`}
                    onChange={handleYearRangeChange}
                />
            </div>

            <div className="filter-group">
                <label>Фільтрувати за жанром:</label>
                <select multiple value={selectedGenres} onChange={handleGenreChange}>
                    {genres.map((genre) => (
                        <option key={genre.id} value={genre.genre}>
                            {genre.genre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label>Сортувати за:</label>
                <select value={sortOption} onChange={handleSortChange}>
                    <option value="year">Рік (від найновішого до найстарішого)</option>
                    <option value="date">Дата завантаження (від новішого до старішого)</option>
                </select>
            </div>

            {filteredFiles.length === 0 ? (
                <p>Наразі немає завантажених файлів, що відповідають пошуковому запиту.</p>
            ) : (
                <ul className="music-list">
                    {filteredFiles.map((file) => (
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
                            <CustomAudioPlayer src={`http://localhost:8080/api/music-files/${file.id}`} />
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
        </div>
    );
};

export default MusicList;

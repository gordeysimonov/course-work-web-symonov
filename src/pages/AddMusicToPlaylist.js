import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import '../css/MusicList.css';
import CustomAudioPlayer from "../components/CustomAudioPlayer";  // Імпортуємо стилі

const AddMusicToPlaylistPage = ({ user }) => {
    const { playlistId } = useParams(); // Отримуємо ID плейлиста з параметрів URL
    const [musicFiles, setMusicFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('year');
    const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [genres, setGenres] = useState([]);
    const [playlistData, setPlaylistData] = useState(null);

    // Отримуємо жанри
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

    // Отримуємо дані плейлиста
    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/playlists/${playlistId}`)
            .then((response) => {
                setPlaylistData(response.data);
            })
            .catch((error) => {
                console.error('Error fetching playlist data:', error);
                setError('Не вдалося завантажити дані плейлиста.');
            });
    }, [playlistId]);

    // Отримуємо музичні файли
    useEffect(() => {
        axios
            .get('http://localhost:8080/api/music-files')
            .then((response) => {
                const files = response.data;
                setMusicFiles(files);
                setFilteredFiles(files);
            })
            .catch((error) => {
                console.error('Error fetching music files:', error);
                setError('Не вдалося завантажити список музичних файлів.');
            });
    }, []);

    // Фільтрація та сортування файлів за введеними даними
    useEffect(() => {
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

        // Фільтруємо файли, які вже є в плейлисті
        files = files.filter(file => {
            return !file.playlists.some(playlist => playlist.id === Number(playlistId));
        });

        setFilteredFiles(files);
    }, [searchQuery, sortOption, yearRange, selectedGenres, musicFiles, playlistData]);

    const handleAddToPlaylist = async (fileId) => {
        try {
            await axios.post(`http://localhost:8080/api/playlists/${playlistId}/add-music/${fileId}`);
            alert('Пісня успішно додана до плейлиста!');
        } catch (error) {
            console.error('Error adding music to playlist:', error);
            alert('Помилка при додаванні пісні.');
        }
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
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

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="music-list">
            <h2>Додати пісню до плейлиста: {playlistData?.name}</h2>

            {/* Пошуковий рядок */}
            <div className="filter-group">
                <input
                    type="text"
                    placeholder="Пошук..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>

            {/* Фільтр за роком */}
            <div className="filter-group">
                <label>Фільтрувати за роком:</label>
                <input
                    type="text"
                    placeholder="1900-2024"
                    value={`${yearRange[0]}-${yearRange[1]}`}
                    onChange={handleYearRangeChange}
                />
            </div>

            {/* Фільтр за жанром */}
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

            {/* Сортування */}
            <div className="filter-group">
                <label>Сортувати за:</label>
                <select value={sortOption} onChange={handleSortChange}>
                    <option value="year">Рік (від найновішого до найстарішого)</option>
                    <option value="date">Дата завантаження (від новішого до старішого)</option>
                </select>
            </div>

            {/* Список музики */}
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

                            <button onClick={() => handleAddToPlaylist(file.id)}>Додати до плейлиста</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AddMusicToPlaylistPage;

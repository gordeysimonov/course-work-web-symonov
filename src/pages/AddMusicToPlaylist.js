import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import '../css/MusicList.css';
import CustomAudioPlayer from "../components/CustomAudioPlayer";
import ReadOnlyStarRating from "../components/ReadOnlyStarRating";
import MusicFilters from '../components/MusicFilters';

const AddMusicToPlaylistPage = ({ user }) => {
    const { playlistId } = useParams();
    const [musicFiles, setMusicFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('year');
    const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [genres, setGenres] = useState([]);
    const [playlistData, setPlaylistData] = useState(null);
    const [ratings, setRatings] = useState({});

    // Завантаження жанрів
    useEffect(() => {
        axios.get('http://localhost:8080/api/genres')
            .then(res => setGenres(res.data))
            .catch(err => {
                console.error('Error fetching genres:', err);
                setError('Не вдалося завантажити список жанрів.');
            });
    }, []);

    // Завантаження даних плейлиста
    useEffect(() => {
        axios.get(`http://localhost:8080/api/playlists/${playlistId}`)
            .then(res => setPlaylistData(res.data))
            .catch(err => {
                console.error('Error fetching playlist data:', err);
                setError('Не вдалося завантажити дані плейлиста.');
            });
    }, [playlistId]);

    // Завантаження всіх музичних файлів
    useEffect(() => {
        axios.get('http://localhost:8080/api/music-files')
            .then(res => {
                setMusicFiles(res.data);
                setFilteredFiles(res.data);
            })
            .catch(err => {
                console.error('Error fetching music files:', err);
                setError('Не вдалося завантажити список музичних файлів.');
            });
    }, []);

    // Завантаження рейтингів для всіх файлів
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
                .catch(err => console.error(`Error loading rating for file ${file.id}`, err));
        });
    }, [musicFiles]);

    // Фільтрація та сортування
    useEffect(() => {
        let files = [...musicFiles];

        if (searchQuery.trim()) {
            files = files.filter(file =>
                file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.tags?.some(tag => tag.tagName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                file.genres?.some(genre => genre.genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
                file.uploadedBy?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                file.year?.toString().includes(searchQuery.trim())
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
        } else if (sortOption === 'rating') {
            files.sort((a, b) => {
                const rateA = ratings[a.id]?.averageRate || 0;
                const rateB = ratings[b.id]?.averageRate || 0;
                return rateB - rateA;
            });
        }

        // Вилучаємо пісні, що вже в плейлисті
        files = files.filter(file => !file.playlists.some(pl => pl.id === Number(playlistId)));

        setFilteredFiles(files);
    }, [searchQuery, sortOption, yearRange, selectedGenres, musicFiles, playlistData, ratings, playlistId]);

    // Додавання в плейлист
    const handleAddToPlaylist = async (fileId) => {
        try {
            await axios.post(`http://localhost:8080/api/playlists/${playlistId}/add-music/${fileId}`);
            alert('Пісня успішно додана до плейлиста!');
        } catch (error) {
            console.error('Error adding music to playlist:', error);
            alert('Помилка при додаванні пісні.');
        }
    };

    // Обробники фільтрів
    const handleSearchChange = (e) => setSearchQuery(e.target.value);
    const handleSortChange = (e) => setSortOption(e.target.value);
    const handleYearRangeChange = (e) => {
        const [start, end] = e.target.value.split('-').map(Number);
        setYearRange([start, end]);
    };
    const handleGenreChange = (e) => {
        const selected = Array.from(e.target.selectedOptions, opt => opt.value);
        setSelectedGenres(selected);
    };

    if (error) return <div className="error">{error}</div>;

    return (
        <div className="music-list">
            <h2>Додати пісню до плейлиста: {playlistData?.name}</h2>

            <div className="filters-container">
            <MusicFilters
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                sortOption={sortOption}
                handleSortChange={handleSortChange}
                yearRange={yearRange}
                handleYearRangeChange={handleYearRangeChange}
                selectedGenres={selectedGenres}
                handleGenreChange={handleGenreChange}
                genres={genres}
            />
            </div>

            {filteredFiles.length === 0 ? (
                <p>Наразі немає завантажених файлів, що відповідають пошуковому запиту.</p>
            ) : (
                <ul className="music-list">
                    {filteredFiles.map(file => (
                        <li key={file.id} className="file-item">
                            <div className="file-title"><strong>{file.title}</strong></div>
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

                            <div className="readonly-rating">
                                {ratings[file.id] && (
                                    <ReadOnlyStarRating
                                        averageRate={ratings[file.id].averageRate}
                                        ratesCount={ratings[file.id].ratesCount}
                                    />
                                )}
                            </div>

                            <CustomAudioPlayer src={`http://localhost:8080/api/music-files/${file.id}`} />

                            <div className="file-details">
                                {file.artist && <p><strong>Виконавець:</strong> {file.artist}</p>}
                                {file.genres?.length > 0 && (
                                    <p><strong>Жанри:</strong> {file.genres.map(g => g.genre).join(' • ')}</p>
                                )}
                                {file.tags?.length > 0 && (
                                    <p><strong>Теги:</strong> {file.tags.map(t => t.tagName).join(' • ')}</p>
                                )}
                                {file.year && <p><strong>Рік:</strong> {file.year}</p>}
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

// Кастомний аудіоплеєр для відтворення музичних файлів

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/CustomAudioPlayer.css';
import AddToPlaylistModal from './AddToPlaylistModal';

const CustomAudioPlayer = ({
                               track,
                               onClose,
                               onEnded,
                               onNext,
                               onPrev,
                               hasPlaylist,
                               repeatTrack,
                               setRepeatTrack,
                               playlistMode,
                               setPlaylistMode,
                               user
                           }) => {

    // Посилання на HTML audio-елемент
    const audioRef = useRef(null);

    // Стани плеєра
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    // Стан модального вікна додавання у плейлист
    const [showModal, setShowModal] = useState(false);

    // Запуск або пауза треку
    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }

        setIsPlaying(!isPlaying);
    };

    // Оновлення поточного часу відтворення
    const updateTime = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
    };

    // Зміна гучності
    const handleVolumeChange = (e) => {
        const volume = e.target.value;

        if (audioRef.current) {
            audioRef.current.volume = volume;
        }

        setVolume(volume);
    };

    // Перемотування треку
    const handleSeek = (e) => {
        const seekTime = e.target.value;

        if (audioRef.current) {
            audioRef.current.currentTime = seekTime;
        }

        setCurrentTime(seekTime);
    };

    // Отримання тривалості треку після завантаження метаданих
    const handleLoadedMetadata = () =>
        setDuration(audioRef.current?.duration || 0);

    // Автоматичний запуск нового треку при його зміні
    useEffect(() => {
        if (track?.src && audioRef.current) {
            audioRef.current.src = track.src;
            audioRef.current.currentTime = 0;

            audioRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch((err) => console.error("Не вдалося відтворити:", err));
        }
    }, [track]);

    // Обробка кнопки попереднього треку
    const handlePrevClick = () => {
        if (!onPrev) return;

        const action = onPrev(currentTime);

        // Якщо трек програвався більше кількох секунд, він перезапускається
        if (action === "restart" && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    };

    // Перемикання режиму плейлиста
    const cyclePlaylistMode = () => {
        if (playlistMode === "normal") {
            setPlaylistMode("loop");
        } else if (playlistMode === "loop") {
            setPlaylistMode("shuffle");
        } else {
            setPlaylistMode("normal");
        }
    };

    // Дії після завершення треку
    const handleEnded = () => {

        // Повтор поточного треку
        if (repeatTrack && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();

            // Перехід до наступного треку плейлиста
        } else if (hasPlaylist) {
            if (onEnded) onEnded();

            // Закриття плеєра після завершення одиночного треку
        } else {
            if (onClose) onClose();
        }
    };

    // Якщо трек не передано, плеєр не відображається
    if (!track) {
        return null;
    }

    return (
        <div className="custom-audio-player">

            {/* Кнопка закриття плеєра */}
            <button className="close-btn" onClick={onClose}>✖</button>

            {/* Кнопка відкриття модального вікна додавання у плейлист */}
            <button
                className="add-to-playlist-btn"
                onClick={() => setShowModal(true)}
            >
                ➕
            </button>

            {/* Обкладинка треку з переходом на сторінку файлу */}
            {track.coverImage && (
                <Link to={`/music-file/${track.id}`}>
                    <img
                        src={track.coverImage}
                        alt={track.title}
                        className="player-cover"
                    />
                </Link>
            )}

            {/* Кнопка запуску або паузи */}
            <button className="play-btn" onClick={togglePlay}>
                {isPlaying ? "❚❚" : "▶"}
            </button>

            {/* Керування плейлистом */}
            <div className="playlist-controls">

                {/* Попередній трек */}
                {hasPlaylist && (
                    <button className="prev-btn" onClick={handlePrevClick}>
                        ⏮
                    </button>
                )}

                <div className="modes-column">

                    {/* Повтор поточного треку */}
                    <button
                        className={`repeat-track-btn ${repeatTrack ? "active" : ""}`}
                        onClick={() => setRepeatTrack(!repeatTrack)}
                    >
                        {repeatTrack ? "🔂" : "🔁"}
                    </button>

                    {/* Режим плейлиста */}
                    {hasPlaylist && (
                        <button
                            className={`playlist-mode-btn ${playlistMode}`}
                            onClick={cyclePlaylistMode}
                        >
                            {playlistMode === "normal" && "➡"}
                            {playlistMode === "loop" && "🔄"}
                            {playlistMode === "shuffle" && "🔀"}
                        </button>
                    )}
                </div>

                {/* Наступний трек */}
                {hasPlaylist && (
                    <button className="next-btn" onClick={onNext}>
                        ⏭
                    </button>
                )}
            </div>

            {/* Блок перемотування та гучності */}
            <div className="seek-volume-container">

                {/* Таймлайн треку */}
                <div className="timeline-container">
                    <div className="seek-time">
                        <span>
                            {Math.floor(currentTime / 60)}:
                            {("0" + Math.floor(currentTime % 60)).slice(-2)}
                        </span>

                        <span>
                            {Math.floor(duration / 60)}:
                            {("0" + Math.floor(duration % 60)).slice(-2)}
                        </span>
                    </div>

                    {/* Повзунок перемотування */}
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className="seek-bar"
                    />
                </div>

                {/* Повзунок гучності */}
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-control"
                />
            </div>

            {/* Прихований audio-елемент, який виконує фактичне відтворення */}
            <audio
                ref={audioRef}
                onTimeUpdate={updateTime}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            {/* Модальне вікно додавання треку до плейлиста */}
            {showModal && (
                <AddToPlaylistModal
                    trackId={track.id}
                    user={user}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default CustomAudioPlayer;
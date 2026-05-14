// Контекст глобального аудіоплеєра
// Дозволяє запускати треки та плейлисти з будь-якої сторінки застосунку

import React, { createContext, useState } from 'react';
import CustomAudioPlayer from '../components/CustomAudioPlayer';
import '../css/GlobalPlayer.css';

// Створення контексту плеєра
export const PlayerContext = createContext();

export const PlayerProvider = ({ children, user }) => {

    // Поточний трек, який відтворюється
    const [track, setTrack] = useState(null);

    // Поточний плейлист, якщо користувач запустив не один трек, а список треків
    const [playlist, setPlaylist] = useState(null);

    // Індекс поточного треку у плейлисті
    const [currentIndex, setCurrentIndex] = useState(null);

    // Стан згортання глобального плеєра
    const [isMinimized, setIsMinimized] = useState(false);

    // Повтор поточного треку
    const [repeatTrack, setRepeatTrack] = useState(false);

    // Режим роботи плейлиста: normal, loop або shuffle
    const [playlistMode, setPlaylistMode] = useState("normal");

    // Запуск одного окремого треку
    const playTrack = (file) => {

        // Встановлення поточного треку
        setTrack(file);

        // Очищення плейлиста, оскільки запускається один файл
        setPlaylist(null);

        // Скидання індексу треку
        setCurrentIndex(null);

        // Відкриття плеєра, якщо він був згорнутий
        setIsMinimized(false);
    };

    // Запуск плейлиста з конкретного треку
    const playPlaylist = (files, index) => {

        // Збереження списку треків
        setPlaylist(files);

        // Збереження індексу вибраного треку
        setCurrentIndex(index);

        // Встановлення поточного треку
        setTrack(files[index]);

        // Відкриття плеєра
        setIsMinimized(false);
    };

    // Перехід до наступного треку
    const playNext = () => {

        // Якщо плейлист відсутній, перехід неможливий
        if (!playlist) return;

        // Якщо увімкнено повтор треку, поточний трек запускається знову
        if (repeatTrack) {
            setTrack({ ...playlist[currentIndex] });
            return;
        }

        // Випадковий режим відтворення
        if (playlistMode === "shuffle") {
            let randomIndex;

            // Вибір випадкового треку, який не збігається з поточним
            do {
                randomIndex = Math.floor(Math.random() * playlist.length);
            } while (randomIndex === currentIndex && playlist.length > 1);

            setCurrentIndex(randomIndex);
            setTrack(playlist[randomIndex]);
            return;
        }

        // Звичайний перехід до наступного треку
        if (currentIndex < playlist.length - 1) {
            const nextIndex = currentIndex + 1;

            setCurrentIndex(nextIndex);
            setTrack(playlist[nextIndex]);

        } else {

            // Якщо увімкнено повтор плейлиста, після останнього треку запускається перший
            if (playlistMode === "loop") {
                setCurrentIndex(0);
                setTrack(playlist[0]);

            } else {

                // Якщо повтор не увімкнено, плеєр закривається після завершення плейлиста
                closeTrack();
            }
        }
    };

    // Перехід до попереднього треку або перезапуск поточного
    const playPrev = (currentTime) => {

        // Якщо плейлист відсутній, дія не виконується
        if (!playlist) return null;

        // Якщо поточний трек перший, він просто перезапускається
        if (currentIndex === 0) {
            return "restart";

        } else {

            // Якщо трек програвався більше 5 секунд, він перезапускається
            if (currentTime > 5) {
                return "restart";

            } else {

                // Якщо трек програвався менше 5 секунд, виконується перехід до попереднього
                const prevIndex = currentIndex - 1;

                setCurrentIndex(prevIndex);
                setTrack(playlist[prevIndex]);

                return "prev";
            }
        }
    };

    // Закриття плеєра та очищення поточного стану
    const closeTrack = () => {
        setTrack(null);
        setPlaylist(null);
        setCurrentIndex(null);
        setIsMinimized(false);
    };

    return (
        <PlayerContext.Provider value={{

            // Функції для запуску треку або плейлиста
            playTrack,
            playPlaylist,

            // Керування згортанням плеєра
            setIsMinimized,
            isMinimized,

            // Керування повтором треку
            repeatTrack,
            setRepeatTrack,

            // Керування режимом плейлиста
            playlistMode,
            setPlaylistMode,

            // Закриття плеєра
            closeTrack
        }}>

            {/* Відображення всіх дочірніх компонентів застосунку */}
            {children}

            {/* Глобальний плеєр відображається тільки якщо є активний трек */}
            {track && (
                <>

                    {/* Кнопка згортання або розгортання плеєра */}
                    <button
                        className="toggle-arrow"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        {isMinimized ? "⬆" : "⬇"}
                    </button>

                    {/* Обгортка глобального плеєра */}
                    <div className={`global-player-wrapper ${isMinimized ? "minimized" : ""}`}>
                        <div className="global-player">

                            {/* Компонент аудіоплеєра */}
                            <CustomAudioPlayer
                                track={track}
                                onClose={closeTrack}
                                onEnded={playNext}
                                onNext={playNext}
                                onPrev={playPrev}
                                hasPlaylist={!!playlist}
                                repeatTrack={repeatTrack}
                                setRepeatTrack={setRepeatTrack}
                                playlistMode={playlistMode}
                                setPlaylistMode={setPlaylistMode}
                                user={user}
                            />
                        </div>
                    </div>
                </>
            )}
        </PlayerContext.Provider>
    );
};
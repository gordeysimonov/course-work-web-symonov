import React, { createContext, useState } from 'react';
import CustomAudioPlayer from '../components/CustomAudioPlayer';
import '../css/GlobalPlayer.css';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children, user }) => {
    const [track, setTrack] = useState(null);
    const [playlist, setPlaylist] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(null);
    const [isMinimized, setIsMinimized] = useState(false);

    const [repeatTrack, setRepeatTrack] = useState(false);
    const [playlistMode, setPlaylistMode] = useState("normal"); // normal | loop | shuffle

    const playTrack = (file) => {
        setTrack(file);
        setPlaylist(null);
        setCurrentIndex(null);
        setIsMinimized(false);
    };

    const playPlaylist = (files, index) => {
        setPlaylist(files);
        setCurrentIndex(index);
        setTrack(files[index]);
        setIsMinimized(false);
    };

    const playNext = () => {
        if (!playlist) return;

        if (repeatTrack) {
            setTrack({ ...playlist[currentIndex] });
            return;
        }

        if (playlistMode === "shuffle") {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * playlist.length);
            } while (randomIndex === currentIndex && playlist.length > 1);

            setCurrentIndex(randomIndex);
            setTrack(playlist[randomIndex]);
            return;
        }

        if (currentIndex < playlist.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setTrack(playlist[nextIndex]);
        } else {
            if (playlistMode === "loop") {
                setCurrentIndex(0);
                setTrack(playlist[0]);
            } else {
                closeTrack();
            }
        }
    };

    const playPrev = (currentTime) => {
        if (!playlist) return null;

        if (currentIndex === 0) {
            return "restart";
        } else {
            if (currentTime > 5) {
                return "restart";
            } else {
                const prevIndex = currentIndex - 1;
                setCurrentIndex(prevIndex);
                setTrack(playlist[prevIndex]);
                return "prev";
            }
        }
    };

    const closeTrack = () => {
        setTrack(null);
        setPlaylist(null);
        setCurrentIndex(null);
        setIsMinimized(false);
    };

    return (
        <PlayerContext.Provider value={{
            playTrack,
            playPlaylist,
            setIsMinimized,
            isMinimized,
            repeatTrack,
            setRepeatTrack,
            playlistMode,
            setPlaylistMode,
            closeTrack   // ✅ тепер доступний у контексті
        }}>
            {children}

            {track && (
                <>
                    <button
                        className="toggle-arrow"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        {isMinimized ? "⬆" : "⬇"}
                    </button>

                    <div className={`global-player-wrapper ${isMinimized ? "minimized" : ""}`}>
                        <div className="global-player">
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

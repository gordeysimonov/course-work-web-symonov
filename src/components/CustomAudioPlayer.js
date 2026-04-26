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
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const [showModal, setShowModal] = useState(false);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const updateTime = () => setCurrentTime(audioRef.current?.currentTime || 0);

    const handleVolumeChange = (e) => {
        const volume = e.target.value;
        if (audioRef.current) audioRef.current.volume = volume;
        setVolume(volume);
    };

    const handleSeek = (e) => {
        const seekTime = e.target.value;
        if (audioRef.current) audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const handleLoadedMetadata = () =>
        setDuration(audioRef.current?.duration || 0);

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

    const handlePrevClick = () => {
        if (!onPrev) return;
        const action = onPrev(currentTime);
        if (action === "restart" && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    };

    const cyclePlaylistMode = () => {
        if (playlistMode === "normal") {
            setPlaylistMode("loop");
        } else if (playlistMode === "loop") {
            setPlaylistMode("shuffle");
        } else {
            setPlaylistMode("normal");
        }
    };

    const handleEnded = () => {
        if (repeatTrack && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        } else if (hasPlaylist) {
            if (onEnded) onEnded();
        } else {
            if (onClose) onClose();
        }
    };

    if (!track) {
        return null;
    }

    return (
        <div className="custom-audio-player">
            <button className="close-btn" onClick={onClose}>✖</button>
            <button
                className="add-to-playlist-btn"
                onClick={() => setShowModal(true)}
            >
                ➕
            </button>

            {track.coverImage && (
                <Link to={`/music-file/${track.id}`}>
                    <img
                        src={track.coverImage}
                        alt={track.title}
                        className="player-cover"
                    />
                </Link>
            )}

            <button className="play-btn" onClick={togglePlay}>
                {isPlaying ? "❚❚" : "▶"}
            </button>

            <div className="playlist-controls">
                {hasPlaylist && <button className="prev-btn" onClick={handlePrevClick}>⏮</button>}

                <div className="modes-column">
                    <button
                        className={`repeat-track-btn ${repeatTrack ? "active" : ""}`}
                        onClick={() => setRepeatTrack(!repeatTrack)}
                    >
                        {repeatTrack ? "🔂" : "🔁"}
                    </button>

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

                {hasPlaylist && <button className="next-btn" onClick={onNext}>⏭</button>}
            </div>

            <div className="seek-volume-container">
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
                    <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className="seek-bar"
                    />
                </div>

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

            <audio
                ref={audioRef}
                onTimeUpdate={updateTime}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

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

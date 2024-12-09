import React, { useState, useRef } from 'react';
import '../css/CustomAudioPlayer.css';

const CustomAudioPlayer = ({ src }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    // Обробник для відтворення/паузи
    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Обробник для оновлення поточного часу
    const updateTime = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    // Обробник для зміни гучності
    const handleVolumeChange = (event) => {
        const volume = event.target.value;
        audioRef.current.volume = volume;
        setVolume(volume);
    };

    // Обробник для перемотування
    const handleSeek = (event) => {
        const seekTime = event.target.value;
        audioRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    // Обробник для встановлення тривалості треку
    const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    return (
        <div className="custom-audio-player">
            <div className="controls">
                <button className="play-btn" onClick={togglePlay}>
                    {isPlaying ? 'Pause' : 'Play'}
                </button>

                <div className="seek-volume-container">
                    <div className="seek-time">
                        <input
                            type="range"
                            min="0"
                            max={duration}
                            value={currentTime}
                            onChange={handleSeek}
                            className="seek-bar"
                        />
                        <span className="time">
                            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60)} /{' '}
                            {Math.floor(duration / 60)}:{Math.floor(duration % 60)}
                        </span>
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
            </div>

            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={updateTime}
                onLoadedMetadata={handleLoadedMetadata}
            />
        </div>
    );
};

export default CustomAudioPlayer;

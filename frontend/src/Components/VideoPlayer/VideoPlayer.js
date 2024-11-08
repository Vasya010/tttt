import React, { useRef, useState } from 'react';
import './VideoPlayer.css';

// Import videos in different resolutions
import video144p from './../../video/Grand Theft Auto VI Trailer 1.mp4';
import video180p from './../../video/Grand Theft Auto VI Trailer 1.mp4';
import video720p from './../../video/Grand Theft Auto VI Trailer 1.mp4';
import video4k from './../../video/Grand Theft Auto VI Trailer 1.mp4';

const VideoPlayer = () => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentQuality, setCurrentQuality] = useState('720p'); // Default quality

    // Map resolutions to video files
    const videoSources = {
        '144p': video144p,
        '180p': video180p,
        '720p': video720p,
        '4K': video4k,
    };

    // Play/pause the video
    const handlePlayPause = () => {
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                console.error('Error attempting to play the video:', error);
            });
        }
    };

    // Handle quality change
    const handleQualityChange = (event) => {
        const selectedQuality = event.target.value;
        setCurrentQuality(selectedQuality);
        const wasPlaying = isPlaying; // Check if video was playing
        videoRef.current.pause(); // Pause to prevent flicker

        videoRef.current.src = videoSources[selectedQuality]; // Change video source
        videoRef.current.load(); // Reload the video element with the new source

        if (wasPlaying) {
            videoRef.current.play(); // Resume playing if it was playing before
        }
    };

    return (
        <div className="video-player-container">
            <video ref={videoRef} className="video-player" width="100%" height="auto" controls>
                <source src={videoSources[currentQuality]} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className="controls">
                <button onClick={handlePlayPause} className="play-pause-btn">
                    {isPlaying ? 'Pause' : 'Play'}
                </button>

                <select onChange={handleQualityChange} value={currentQuality} className="quality-selector">
                    <option value="144p">144p</option>
                    <option value="180p">180p</option>
                    <option value="720p">720p</option>
                    <option value="4K">4K</option>
                </select>
            </div>
        </div>
    );
};

export default VideoPlayer;

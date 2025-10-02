import React, { forwardRef } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import backgroundmusic from '../audio/darren-curtis-i-am-not-what-i-thought.mp3';

const AudioPlayer = forwardRef((props, ref) => {
    return (
        <ReactAudioPlayer
            ref={ref}
            src={backgroundmusic}
            onEnded={() => ref.current.audioEl.current.play()}
            volume={0.1}
        />
    );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
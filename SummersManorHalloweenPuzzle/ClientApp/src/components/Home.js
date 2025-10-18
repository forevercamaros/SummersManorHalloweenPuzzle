import React, { useEffect, useRef, useState } from 'react';
import Riddle from '../RiddleComponents/Riddle';
import { Transition } from 'react-transition-group';
import GroupLogin from './GroupLogin';
import GameTimer from './GameTimer';
import AudioPlayer from './AudioPlayer';
import SpookyCountdown from './SpookyCountdown';
import ResultsModal from './modals/ResultsModal';
import OutOfTimeModal from './modals/OutOfTimeModal';
import GameCompletedModal from './modals/GameCompletedModal';
import { useGameState } from '../hooks/useGameState';
import { useGameLogic } from '../hooks/useGameLogic';
import { formatTimeString } from '../utils/timeUtils';
import {
    SpookyWrapper,
    MistSVG,
    SpookyTitle,
    FlickerStyle,
    FadeContainer,
    BottomPadding
} from './styles/HomeStyles';

export default function Home() {
    const fadeDuration = 1000;
    const [timerDuration, setTimerDuration] = useState(2400); // Default fallback
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    
    const gameState = useGameState(timerDuration);
    const gameLogic = useGameLogic(gameState, timerDuration);
    
    const timerNodeRef = useRef(null);
    const loginNodeRef = useRef(null);
    const countdownNodeRef = useRef(null);
    const riddleNodeRef = useRef(null);
    const solvedNodeRef = useRef(null);
    const audioElement = useRef(null);

    // Replace the useMemo block with a ref-backed object
    const riddlePropsRef = useRef({
        RiddleData: null,
        onSolved: () => {},
        onAddTime: () => {}
    });

    // Update the ref’s current on each render without changing the object identity
    riddlePropsRef.current.RiddleData = gameState.riddle;
    riddlePropsRef.current.onSolved = gameLogic.onSolved;
    riddlePropsRef.current.onAddTime = gameLogic.addTime;

    // Function to safely attempt audio play without throwing errors
    const tryPlayAudio = () => {
        if (!audioElement.current?.audioEl?.current) return;
        
        const audioEl = audioElement.current.audioEl.current;
        const playPromise = audioEl.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Audio autoplay was prevented - this is normal browser behavior
                // Don't log error as it's expected behavior in many browsers
                console.debug('Audio autoplay prevented by browser policy (this is normal)');
            });
        }
    };

    // Function to safely attempt audio pause without throwing errors
    const tryPauseAudio = () => {
        if (!audioElement.current?.audioEl?.current) return;
        
        try {
            audioElement.current.audioEl.current.pause();
        } catch (error) {
            console.debug('Could not pause audio:', error);
        }
    };

    // Fetch game settings including timer duration
    const fetchGameSettings = async () => {
        try {
            setIsLoadingSettings(true);
            const response = await fetch('/GetGameSettings');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success && data.settings && data.settings.timerDuration) {
                setTimerDuration(data.settings.timerDuration);
            } else {
                console.warn('Failed to get game settings, using default timer duration:', data.error);
                setTimerDuration(2400); // Default fallback
            }
        } catch (error) {
            console.error('Error fetching game settings:', error);
            setTimerDuration(2400); // Default fallback
        } finally {
            setIsLoadingSettings(false);
        }
    };

    // Initialize window events and fetch settings
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchGameSettings();
        gameLogic.initBeforeUnLoad(gameState.showExitPrompt);
    }, []);

    useEffect(() => {
        gameLogic.initBeforeUnLoad(gameState.showExitPrompt);
    }, [gameState.showExitPrompt, gameLogic]);

    const handleCloseSolved = () => {
        gameState.setShowSolved(false);
        gameLogic.handleViewResults();
    };

    const handleSetGroupName = (inGroupName) => {
        gameLogic.onSetGroupName(inGroupName);
        gameState.setShowCountdown(true);
        localStorage.setItem("showCountdown", true);
    };

    const handleCountdownComplete = () => {
        gameState.setShowCountdown(false);
        localStorage.setItem("showCountdown", false);
        gameState.setShowTimer(true);
        localStorage.setItem("showTimer", true);
        gameState.setShowRiddle(true);
        localStorage.setItem("showRiddle", true);
        
        if (gameState.riddle?.type !== 'audio') {
            tryPlayAudio();
        }
    };

    // Show loading state while fetching settings
    if (isLoadingSettings) {
        return (
            <SpookyWrapper>
                <SpookyTitle>
                    Loading Game Settings...
                </SpookyTitle>
                <div style={{ 
                    textAlign: 'center', 
                    color: '#ff6b1a', 
                    fontSize: '1.2rem',
                    fontFamily: 'Crimson Text, serif'
                }}>
                    Preparing the manor for your arrival...
                </div>
            </SpookyWrapper>
        );
    }

    return (
        <SpookyWrapper>
            <MistSVG>
                <svg viewBox="0 0 1200 180" fill="none">
                    <path d="M0,120 Q300,180 600,120 Q900,60 1200,120 L1200,180 L0,180 Z" fill="#dedede" opacity="0.3"/>
                </svg>
            </MistSVG>
            <SpookyTitle>
                Summers Manor Halloween Puzzle
            </SpookyTitle>
            {gameState.showLogin && (
                <FlickerStyle>
                    <div style={{
                        textAlign: 'center',
                        color: '#dedede',
                        marginBottom: '2rem',
                        fontSize: '1.3rem',
                        textShadow: '0 0 12px #8b0000, 0 0 24px #ff6b1a',
                        animation: 'flicker 1.3s infinite'
                    }}>
                        Welcome, brave souls! Solve riddles, unlock secrets, and survive the night.<br />
                        <span style={{
                            color: '#8b0000',
                            fontWeight: 'bold',
                            animation: 'flicker 1.1s infinite'
                        }}>Are you ready to play?</span>
                    </div>
                </FlickerStyle>
            )}

            {/* Modals */}
            <ResultsModal
                show={gameState.viewResults}
                onHide={() => gameState.setViewResults(false)}
                groupResults={gameState.groupResults}
                groupName={gameState.groupName}
            />
            
            <OutOfTimeModal
                show={gameState.showOutOfTime}
                onHide={() => gameState.setShowOutOfTime(false)}
            />
            
            <GameCompletedModal
                show={gameState.showSolved}
                onHide={handleCloseSolved}
            />

            {/* Timer */}
            <Transition
                in={gameState.showTimer}
                timeout={fadeDuration}
                mountOnEnter={true}
                nodeRef={timerNodeRef}
            >
                {state => (
                    <FadeContainer ref={timerNodeRef} state={state} duration={fadeDuration}>
                        <GameTimer
                            gameCompleted={gameState.gameCompleted}
                            timerKey={gameState.timerKey}
                            isPlaying={gameState.isPlaying}
                            timerDuration={timerDuration}
                            initialRemainingTime={gameState.initialRemainingTime}
                            groupName={gameState.groupName}
                            onComplete={gameLogic.onTimerComplete}
                            onTimeUpdate={gameLogic.onTimeUpdate}
                            onViewResults={gameLogic.handleViewResults}
                        />
                    </FadeContainer>
                )}
            </Transition>

            {/* Login */}
            <Transition
                in={gameState.showLogin}
                timeout={fadeDuration}
                onExited={() => {
                    // Countdown will now handle the transition to timer and riddles
                }}
                mountOnEnter={true}
                unmountOnExit={true}
                nodeRef={loginNodeRef}
            >
                {state => (
                    <FadeContainer ref={loginNodeRef} state={state} duration={fadeDuration}>
                        <GroupLogin
                            riddleCount={gameState.riddleDataFromDB ? Object.keys(gameState.riddleDataFromDB.riddles).length : 0}
                            countDownTime={formatTimeString(timerDuration, true)}
                            onClick={handleSetGroupName}
                        />
                    </FadeContainer>
                )}
            </Transition>

            {/* Spooky Countdown */}
            <Transition
                in={gameState.showCountdown}
                timeout={fadeDuration}
                onExited={handleCountdownComplete}
                mountOnEnter={true}
                unmountOnExit={true}
                nodeRef={countdownNodeRef}
            >
                {state => (
                    <FadeContainer ref={countdownNodeRef} state={state} duration={fadeDuration}>
                        <SpookyCountdown onComplete={() => gameState.setShowCountdown(false)} />
                    </FadeContainer>
                )}
            </Transition>

            {/* Riddle */}
            <Transition
                in={gameState.showRiddle && !gameState.gameCompleted}
                timeout={fadeDuration}
                onExited={gameLogic.nextRiddle}
                mountOnEnter={true}
                unmountOnExit={true}
                onEntered={() => {
                    if (gameState.riddle?.type === 'audio') {
                        tryPauseAudio();
                    }
                }}
                nodeRef={riddleNodeRef}
            >
                {state => (
                    <FadeContainer ref={riddleNodeRef} state={state} duration={fadeDuration}>
                        <Riddle
                            {...riddlePropsRef.current}
                        />
                    </FadeContainer>
                )}
            </Transition>

            {/* Riddle Solved */}
            <Transition
                in={gameState.showRiddleSolved}
                timeout={fadeDuration}
                onEntered={() => {
                    gameState.setShowRiddleSolved(false);
                    localStorage.setItem("showRiddleSolved", false);
                    tryPlayAudio();
                }}
                onExited={() => {
                    gameState.setShowRiddle(true);
                    localStorage.setItem("showRiddle", true);
                }}
                unmountOnExit={true}
                nodeRef={solvedNodeRef}
            >
                {state => (
                    <FadeContainer ref={solvedNodeRef} state={state} duration={fadeDuration}>
                        Riddle Solved. Loading new riddle...
                    </FadeContainer>
                )}
            </Transition>

            <BottomPadding />
            <AudioPlayer ref={audioElement} />
        </SpookyWrapper>
    );
}

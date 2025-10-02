import React, { useEffect, useRef } from 'react';
import Riddle from '../RiddleComponents/Riddle';
import { Transition } from 'react-transition-group';
import GroupLogin from './GroupLogin';
import GameTimer from './GameTimer';
import AudioPlayer from './AudioPlayer';
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
    const timerDuration = 2400;
    
    const gameState = useGameState(timerDuration);
    const gameLogic = useGameLogic(gameState, timerDuration);
    
    const timerNodeRef = useRef(null);
    const loginNodeRef = useRef(null);
    const riddleNodeRef = useRef(null);
    const solvedNodeRef = useRef(null);
    const audioElement = useRef(null);

    // Initialize window events
    useEffect(() => {
        window.scrollTo(0, 0);
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
        if (gameState.riddle?.type !== 'audio') {
            audioElement.current.audioEl.current.play();
        }
    };

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
                    gameState.setShowTimer(true);
                    localStorage.setItem("showTimer", true);
                    gameState.setShowRiddle(true);
                    localStorage.setItem("showRiddle", true);
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

            {/* Riddle */}
            <Transition
                in={gameState.showRiddle && !gameState.gameCompleted}
                timeout={fadeDuration}
                onExited={gameLogic.nextRiddle}
                mountOnEnter={true}
                unmountOnExit={true}
                onEntered={() => {
                    if (gameState.riddle?.type === 'audio') {
                        audioElement.current.audioEl.current.pause();
                    }
                }}
                nodeRef={riddleNodeRef}
            >
                {state => (
                    <FadeContainer ref={riddleNodeRef} state={state} duration={fadeDuration}>
                        <Riddle
                            RiddleData={gameState.riddle}
                            onSolved={gameLogic.onSolved}
                            onAddTime={gameLogic.addTime}
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
                    audioElement.current.audioEl.current.play();
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

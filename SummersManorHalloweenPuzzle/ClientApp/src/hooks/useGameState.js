import { useState, useEffect } from 'react';

export const useGameState = (timerDuration) => {
    const [showLogin, setShowLogin] = useState(true);
    const [showCountdown, setShowCountdown] = useState(false);
    const [showTimer, setShowTimer] = useState(false);
    const [showRiddle, setShowRiddle] = useState(false);
    const [showRiddleSolved, setShowRiddleSolved] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [riddle, setRiddle] = useState(null);
    const [riddleDataFromDB, setRiddleDataFromDB] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [initialRemainingTime, setInitialRemainingTime] = useState(timerDuration);
    const [timerKey, setTimerKey] = useState(0);
    const [groupName, setGroupName] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [showExitPrompt, setShowExitPrompt] = useState(true);
    const [showOutOfTime, setShowOutOfTime] = useState(false);
    const [viewResults, setViewResults] = useState(false);
    const [groupResults, setGroupResults] = useState(null);
    const [showSolved, setShowSolved] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);

    // Load game state from localStorage
    useEffect(() => {
        const loadGameState = () => {
            const _gameCompleted = localStorage.getItem('gameCompleted');
            if (_gameCompleted) {
                setGameCompleted(_gameCompleted === "true");
            }

            const _lastUsedDate = localStorage.getItem('lastUsedDate');
            if (_lastUsedDate) {
                var minutes = Math.abs(Date.now() - _lastUsedDate) / 60000;
                if (minutes > timerDuration) {
                    localStorage.clear();
                }
            } else {
                localStorage.clear();
            }
            localStorage.setItem('lastUsedDate', Date.now());

            const _showLogin = localStorage.getItem('showLogin');
            if (_showLogin) {
                setShowLogin(_showLogin === "true");
            }

            const _showCountdown = localStorage.getItem('showCountdown');
            if (_showCountdown) {
                setShowCountdown(_showCountdown === "true");
            }

            const _showTimer = localStorage.getItem('showTimer');
            if (_showTimer) {
                setShowTimer(_showTimer === "true");
            }

            const _showRiddle = localStorage.getItem('showRiddle');
            if (_showRiddle) {
                setShowRiddle(_showRiddle === "true");
            }

            const _showRiddleSolved = localStorage.getItem('showRiddleSolved');
            if (_showRiddleSolved) {
                setShowRiddleSolved(_showRiddleSolved === "true");
            }

            const _currentIndex = localStorage.getItem('currentIndex');
            if (_currentIndex) {
                setCurrentIndex(parseInt(_currentIndex));
            }

            const _riddle = localStorage.getItem('riddle');
            if (_riddle) {
                setRiddle(JSON.parse(_riddle));
            }

            const _initialRemainingTime = localStorage.getItem('initialRemainingTime');
            if (_initialRemainingTime) {
                setInitialRemainingTime(parseInt(_initialRemainingTime));
                setTimerKey(prev => prev + 1);
            }
            setIsPlaying(true);

            const _groupName = localStorage.getItem('groupName');
            if (_groupName) {
                setGroupName(_groupName);
            }

            const _showOutOfTime = localStorage.getItem('showOutOfTime');
            if (_showOutOfTime) {
                setShowOutOfTime(_showOutOfTime === "true");
            }
        };

        loadGameState();
    }, [timerDuration]);

    return {
        showLogin, setShowLogin,
        showCountdown, setShowCountdown,
        showTimer, setShowTimer,
        showRiddle, setShowRiddle,
        showRiddleSolved, setShowRiddleSolved,
        currentIndex, setCurrentIndex,
        riddle, setRiddle,
        riddleDataFromDB, setRiddleDataFromDB,
        startIndex, setStartIndex,
        initialRemainingTime, setInitialRemainingTime,
        timerKey, setTimerKey,
        groupName, setGroupName,
        isPlaying, setIsPlaying,
        showExitPrompt, setShowExitPrompt,
        showOutOfTime, setShowOutOfTime,
        viewResults, setViewResults,
        groupResults, setGroupResults,
        showSolved, setShowSolved,
        gameCompleted, setGameCompleted
    };
};
import { useEffect, useCallback, useRef } from 'react';

export const useGameLogic = (gameState, timerDuration) => {
    const {
        riddleDataFromDB, setRiddleDataFromDB,
        setStartIndex, setCurrentIndex, setRiddle,
        setInitialRemainingTime, setTimerKey, setIsPlaying,
        setGroupName, setGameCompleted, setShowSolved, setShowRiddle,
        currentIndex, startIndex, groupName, setShowExitPrompt,
        setShowOutOfTime, setShowRiddleSolved, gameCompleted
    } = gameState;

    // Use useRef to persist remaining time across renders
    const remainingTimeRef = useRef(0);
    const lastUpdateTimeRef = useRef(0);
    const updateIntervalRef = useRef(null);
    // Add a ref to track completed riddles
    const completedRiddlesRef = useRef(new Set());

    const initBeforeUnLoad = useCallback((showExitPrompt) => {
        window.onbeforeunload = (event) => {
            if (showExitPrompt) {
                const e = event || window.event;
                e.preventDefault();
                if (e) {
                    e.returnValue = '';
                }
                return '';
            }
        };
    }, []);

    const fetchRiddleDataFromMongoDB = async () => {
        try {
            const response = await fetch('/GetRiddleData');
            const data = await response.json();
            if (data.success && data.riddles) {
                return { riddles: data.riddles };
            } else {
                console.warn('Failed to load riddle data from MongoDB');
                return { riddles: {} };
            }
        } catch (error) {
            console.error('Error fetching riddle data:', error);
            return { riddles: {} };
        }
    };

    // Function to update remaining time in database
    const updateRemainingTimeInDB = useCallback(async (remainingTime) => {
        if (!groupName || gameCompleted) return;
        
        try {
            const data = { groupName: groupName, remainingTime: remainingTime };
            await fetch('UpdateRemainingTime', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(`Updated remaining time in DB: ${remainingTime}s for group: ${groupName}`);
        } catch (error) {
            console.error('Error updating remaining time in database:', error);
        }
    }, [groupName, gameCompleted]);

    // Start continuous database updates
    const startDatabaseUpdates = useCallback(() => {
        // Clear any existing interval
        if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
        }

        // Only start updates if game is not completed and group name exists
        if (!gameCompleted && groupName) {
            updateIntervalRef.current = setInterval(() => {
                const currentTime = remainingTimeRef.current;
                if (currentTime > 0) {
                    updateRemainingTimeInDB(currentTime);
                }
            }, 1000); // Update every second
        }
    }, [gameCompleted, groupName, updateRemainingTimeInDB]);

    // Stop database updates
    const stopDatabaseUpdates = useCallback(() => {
        if (updateIntervalRef.current) {
            clearInterval(updateIntervalRef.current);
            updateIntervalRef.current = null;
        }
    }, []);

    const nextRiddle = useCallback(() => {
        if (!riddleDataFromDB || !riddleDataFromDB.riddles) return;
        
        const keys = Object.keys(riddleDataFromDB.riddles);
        let index = currentIndex + 1;

        if (index >= keys.length) {
            index = 0;
        }

        // Mark current riddle as completed
        completedRiddlesRef.current.add(currentIndex);

        // Check if all riddles are completed
        const totalRiddles = keys.length;
        const completedCount = completedRiddlesRef.current.size;

        if (completedCount >= totalRiddles) {
            // Game completed - all riddles have been solved
            const finalTime = remainingTimeRef.current;
            
            localStorage.setItem("showSolved", true);
            localStorage.setItem("gameCompleted", true);
            localStorage.setItem("showRiddle", false);
            localStorage.setItem("completedRiddles", JSON.stringify(Array.from(completedRiddlesRef.current)));
            
            // Final database update
            updateRemainingTimeInDB(finalTime);
            
            // Stop continuous updates
            stopDatabaseUpdates();
            
            setShowExitPrompt(false);
            setShowSolved(true);
            setShowRiddle(false);
            setGameCompleted(true);
        } else {
            setCurrentIndex(index);
            localStorage.setItem("currentIndex", index);
            setRiddle(riddleDataFromDB.riddles[keys[index]]);
            localStorage.setItem("riddle", JSON.stringify(riddleDataFromDB.riddles[keys[index]]));
            setShowRiddleSolved(true);
            localStorage.setItem("showRiddleSolved", true);
        }
    }, [riddleDataFromDB, currentIndex, setShowExitPrompt, setShowSolved, setShowRiddle, setGameCompleted, setCurrentIndex, setRiddle, setShowRiddleSolved, updateRemainingTimeInDB, stopDatabaseUpdates]);

    const addTime = useCallback((time) => {
        const newTime = remainingTimeRef.current + time;
        remainingTimeRef.current = newTime;
        setTimerKey(prev => prev + 1);
        setInitialRemainingTime(newTime);
        localStorage.setItem("initialRemainingTime", newTime);
        
        // Immediately update database with new time
        updateRemainingTimeInDB(newTime);
    }, [setTimerKey, setInitialRemainingTime, updateRemainingTimeInDB]);

    const onSetGroupName = useCallback((inGroupName) => {
        setGroupName(inGroupName);
        localStorage.setItem("groupName", inGroupName);
        gameState.setShowLogin(false);
        localStorage.setItem("showLogin", false);
        
        // Start database updates once group name is set
        setTimeout(() => {
            startDatabaseUpdates();
        }, 1000); // Small delay to ensure timer has started
    }, [setGroupName, gameState, startDatabaseUpdates]);

    const onSolved = useCallback(() => {
        setShowRiddle(false);
        localStorage.setItem("showRiddle", false);
    }, [setShowRiddle]);

    const handleViewResults = useCallback(() => {
        fetch('GroupResults')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(returnJson => {
                gameState.setGroupResults(returnJson);
                gameState.setViewResults(true);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }, [gameState]);

    const onTimeUpdate = useCallback((remainingTime) => {
        // Update the ref with current remaining time
        remainingTimeRef.current = remainingTime;
        localStorage.setItem("initialRemainingTime", remainingTime);
        
        // Throttle direct database updates from timer to avoid excessive calls
        // The interval-based update will handle regular updates
        const now = Date.now();
        if (now - lastUpdateTimeRef.current > 5000) { // Update every 5 seconds from timer
            lastUpdateTimeRef.current = now;
            updateRemainingTimeInDB(remainingTime);
        }
    }, [updateRemainingTimeInDB]);

    const onTimerComplete = useCallback(() => {
        // Stop database updates when timer completes
        stopDatabaseUpdates();
        
        setShowOutOfTime(true);
        localStorage.setItem("showOutOfTime", true);
        return [false, 0];
    }, [setShowOutOfTime, stopDatabaseUpdates]);

    // Load initial data
    useEffect(() => {
        window.scrollTo(0, 0);
        
        const loadInitialData = async () => {
            const data = await fetchRiddleDataFromMongoDB();
            setRiddleDataFromDB(data);  // ? FIXED: Changed from setRiddleDataFromMongoDB to setRiddleDataFromDB
            
            const keys = Object.keys(data.riddles);
            if (keys.length > 0) {
                const randomStart = Math.floor(Math.random() * keys.length);
                setStartIndex(randomStart);
                let initialRiddleIndex = randomStart;
                
                // Load completed riddles from localStorage
                const savedCompletedRiddles = localStorage.getItem('completedRiddles');
                if (savedCompletedRiddles) {
                    try {
                        const completedArray = JSON.parse(savedCompletedRiddles);
                        completedRiddlesRef.current = new Set(completedArray);
                    } catch (e) {
                        console.warn('Failed to parse completed riddles from localStorage');
                        completedRiddlesRef.current = new Set();
                    }
                }
                
                const _gameCompleted = localStorage.getItem('gameCompleted');
                if (_gameCompleted) {
                    setGameCompleted(_gameCompleted === "true");
                    if (_gameCompleted === "true") {
                        setShowSolved(true);
                        setShowRiddle(false);
                        return;
                    }
                }
            
                const _currentIndex = localStorage.getItem('currentIndex');
                if (_currentIndex) {
                    initialRiddleIndex = parseInt(_currentIndex);
                }
            
                setCurrentIndex(initialRiddleIndex);
                localStorage.setItem("currentIndex", initialRiddleIndex);
                setRiddle(data.riddles[keys[initialRiddleIndex]]);
                localStorage.setItem("riddle", JSON.stringify(data.riddles[keys[initialRiddleIndex]]));
                
                const _initialRemainingTime = localStorage.getItem('initialRemainingTime');
                if (_initialRemainingTime) {
                    const initialTime = parseInt(_initialRemainingTime);
                    remainingTimeRef.current = initialTime;
                    setInitialRemainingTime(initialTime);
                    setTimerKey(prev => prev + 1);
                } else {
                    remainingTimeRef.current = timerDuration;
                    setInitialRemainingTime(timerDuration);
                }
                
                setIsPlaying(true);
            
                const _groupName = localStorage.getItem('groupName');
                if (_groupName) {
                    setGroupName(_groupName);
                }
            }
        };
        
        loadInitialData();
    }, [setRiddleDataFromDB, setStartIndex, setCurrentIndex, setRiddle, setInitialRemainingTime, setTimerKey, setIsPlaying, setGroupName, setGameCompleted, setShowSolved, setShowRiddle, timerDuration]);

    // Start database updates when game starts (if group name already exists)
    useEffect(() => {
        if (groupName && !gameCompleted) {
            startDatabaseUpdates();
        }
        
        // Cleanup function to clear interval when component unmounts
        return () => {
            stopDatabaseUpdates();
        };
    }, [groupName, gameCompleted, startDatabaseUpdates, stopDatabaseUpdates]);

    // Stop database updates when game is completed
    useEffect(() => {
        if (gameCompleted) {
            stopDatabaseUpdates();
        }
    }, [gameCompleted, stopDatabaseUpdates]);

    return {
        initBeforeUnLoad,
        nextRiddle,
        addTime,
        onSetGroupName,
        onSolved,
        handleViewResults,
        onTimeUpdate,
        onTimerComplete
    };
};
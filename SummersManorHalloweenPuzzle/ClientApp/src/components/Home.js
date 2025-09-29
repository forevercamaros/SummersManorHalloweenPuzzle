import React, { useState, useEffect, useRef } from 'react';
import Riddle from '../RiddleComponents/Riddle';
import riddleData from '../data/riddle-data';
import styled from 'styled-components';
import { Transition } from 'react-transition-group';
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import GroupLogin from './GroupLogin';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import backgroundmusic from '../audio/darren-curtis-i-am-not-what-i-thought.mp3';
import ReactAudioPlayer from 'react-audio-player';
import victoryImage from '../images/haunted-house.jpg';
import scaryGhostBackground from '../images/ScaryGhost.png';

var riddleKeys = Object.keys(riddleData.riddles);
var startIndex = Math.floor(Math.random() * riddleKeys.length);

const BottomPadding = styled.div`  
  min-height: 100px;
`;

const FadeContainer = styled.div`
  transition: opacity  ${props => props.duration}ms ease-in-out;
  opacity: ${props => (props.state === 'entering' || props.state === 'entered' ? '1' : '0')};
  color: white;
`;

const BottomTimer = styled.div`
  position: fixed !important;
  bottom: 0 !important;
  z-index: 100;
  background-color: black;
  width: 100%;
`;

const GroupNameDiv = styled.div`
  padding: 10%;
`;

const SpookyWrapper = styled.div`
  height: 100vh;
  background-image: url(${scaryGhostBackground});
  background-repeat: no-repeat;
  background-position: center center;
  background-attachment: fixed;
  background-size: contain;
  position: relative;
  padding-top: 40px;
  padding-bottom: 40px;
  z-index: 1;
  overflow: hidden;
`;

const SpookyTitle = styled.h1`
  font-family: 'Creepster', cursive;
  color: #ff6b1a;
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 0 12px #8b0000, 0 0 24px #ff6b1a;
  animation: flicker 1.1s infinite;
  letter-spacing: 2px;
`;

const FlickerStyle = styled.div`
  @keyframes flicker {
    0%, 100% { opacity: 1; }
    10% { opacity: 0.7; }
    20% { opacity: 0.9; }
    30% { opacity: 0.5; }
    40% { opacity: 0.8; }
    50% { opacity: 0.6; }
    60% { opacity: 0.85; }
    70% { opacity: 0.7; }
    80% { opacity: 0.95; }
    90% { opacity: 0.8; }
  }
  animation: flicker 1.3s infinite;
`;

const MistSVG = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 180px;
  z-index: 0;
  opacity: 0.22;
  pointer-events: none;
`;

function formatTimeString(seconds, minutesOnly) {
    var sec_num = parseInt(seconds, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    if (minutesOnly) {
        return minutes;
    } else {
        return hours + ':' + minutes + ':' + seconds;
    }
}

export default function Home() {
    const fadeDuration = 1000;
    const timerDuration = 2400;
    const [showLogin, setShowLogin] = useState(true);
    const [showTimer, setShowTimer] = useState(false);
    const [showRiddle, setShowRiddle] = useState(false);
    const [showRiddleSolved, setShowRiddleSolved] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [riddle, setRiddle] = useState(null); // Initialize as null
    const [riddleDataFromDB, setRiddleDataFromDB] = useState(null); // Store fetched data
    const [initialRemainingTime, setInitialRemainingTime] = useState(timerDuration);
    const [timerKey, setTimerKey] = useState(0);
    const [groupName, setGroupName] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [showExitPrompt, setShowExitPrompt] = useState(true);
    const [showOutOfTime, setShowOutOfTime] = useState(false);
    const [viewResults, setViewResults] = useState(false);
    const [groupResults, setGroupResults] = useState(null);
    const handleCloseOutOfTime = () => setShowOutOfTime(false);
    const [showSolved, setShowSolved] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    
    const timerNodeRef = useRef(null);
    const loginNodeRef = useRef(null);
    const riddleNodeRef = useRef(null);
    const solvedNodeRef = useRef(null);

    const audioElement = useRef(null);
    
    const handleCloseSolved = () => 
    {
        setShowSolved(false);
        handleViewResults();
    }

    var _remainingTime = 0;
    var _finalTime = 0;    

    const initBeforeUnLoad = (showExitPrompt) => {
        window.onbeforeunload = (event) => {
            // Show prompt based on state
            if (showExitPrompt) {
                const e = event || window.event;
                e.preventDefault();
                if (e) {
                    e.returnValue = ''
                }
                return '';
            }
        };
    };

    window.onload = function () {
        initBeforeUnLoad(showExitPrompt);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    });

    useEffect(() => {
        const _gameCompleted = localStorage.getItem('gameCompleted');
        if (_gameCompleted) {
            setGameCompleted(_gameCompleted === "true" ? true : false);
        }
        const _lastUsedDate = localStorage.getItem('lastUsedDate');        
        if (_lastUsedDate) {
            var minutes = Math.abs(Date.now() - _lastUsedDate) / 60000;
            if (minutes > timerDuration)
            {
                localStorage.clear();
            }
        }else{
            localStorage.clear();
        }
        localStorage.setItem('lastUsedDate', Date.now());

        const _showLogin = localStorage.getItem('showLogin');
        if (_showLogin) {
            setShowLogin(_showLogin === "true" ? true : false);
        }

        const _showTimer = localStorage.getItem('showTimer');
        if (_showTimer) {
            setShowTimer(_showTimer === "true" ? true : false);
        }

        const _showRiddle = localStorage.getItem('showRiddle');
        if (_showRiddle) {
            setShowRiddle(_showRiddle === "true" ? true : false);
        }

        const _showRiddleSolved = localStorage.getItem('showRiddleSolved');
        if (_showRiddleSolved) {
            setShowRiddleSolved(_showRiddleSolved === "true" ? true : false);
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
            setTimerKey(timerKey + 1);            
        }
        setIsPlaying(true);

        const _groupName = localStorage.getItem('groupName');
        if (_groupName) {
            setGroupName(_groupName);
        }

        const _showOutOfTime = localStorage.getItem('showOutOfTime');
        if (_showOutOfTime) {
            setShowOutOfTime(_showOutOfTime === "true" ? true : false);
        }       
        
    }, []);

    // Re-Initialize the onbeforeunload event listener
    useEffect(() => {
        initBeforeUnLoad(showExitPrompt);
    }, [showExitPrompt]);
    
    const fetchRiddleDataFromMongoDB = async () => {
        try {
            const response = await fetch('/GetRiddleData');
            const data = await response.json();
            if (data.success && data.riddles) {
                return { riddles: data.riddles };
            } else {
                console.warn('Failed to load riddle data from MongoDB, using default');
                return riddleData; // fallback to default
            }
        } catch (error) {
            console.error('Error fetching riddle data:', error);
            return riddleData; // fallback to default
        }
    };

    useEffect(() => {
        const loadRiddleData = async () => {
            const data = await fetchRiddleDataFromMongoDB();
            const keys = Object.keys(data.riddles);
            setCurrentIndex(startIndex);
            setRiddle(data.riddles[keys[startIndex]]);
            // Store the fetched data globally so other functions can use it
            window.riddleDataFromMongoDB = data;
        };
        
        loadRiddleData();
        
        // ... rest of existing useEffect code
    }, []);

    function onSetGroupName(inGroupName) {
        setGroupName(inGroupName);
        localStorage.setItem("groupName", inGroupName);
        setShowLogin(false);
        localStorage.setItem("showLogin", false);
        if (riddle.type !== 'audio') {
            audioElement.current.audioEl.current.play();
        }        
    }

    const renderTime = ({ remainingTime }) => {
        _remainingTime = remainingTime;
        localStorage.setItem("initialRemainingTime", _remainingTime);
        if (remainingTime === 0) {
            return <div>0 Time</div>;
        }

        return (
            <div>
                {formatTimeString(remainingTime,false)}
            </div>
        );
    };

    function onSolved() {
        setShowRiddle(false);
        localStorage.setItem("showRiddle", false);
    }

    function nextRiddle() {
        var index = currentIndex+1;        
        const currentRiddleData = window.riddleDataFromMongoDB || riddleData;
        const keys = Object.keys(currentRiddleData.riddles);
        
        if (index + 1 > keys.length) {
            index = 0;
        }
        if (index === startIndex) {
            localStorage.setItem("showSolved", true);
            localStorage.setItem("gameCompleted", true);
            localStorage.setItem("showRiddle", false)
            _finalTime = _remainingTime;
            const data = { groupName: groupName, remainingTime: _remainingTime };
            fetch('UpdateRemainingTime', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
            }).catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
            setShowExitPrompt(false);
            setShowSolved(true);    
            setShowRiddle(false);
            setGameCompleted(true);
        } else {
            setCurrentIndex(index);
            localStorage.setItem("currentIndex", index);
            setRiddle(currentRiddleData.riddles[keys[index]]);
            localStorage.setItem("riddle", JSON.stringify(currentRiddleData.riddles[keys[index]]));
            setShowRiddleSolved(true);
            localStorage.setItem("showRiddleSolved", true);
        }
    }

    function addTime(time) {
        setTimerKey(timerKey + 1);
        setInitialRemainingTime(_remainingTime + time);
        localStorage.setItem("initialRemainingTime", _remainingTime + time);
    }

    const handleViewResults = () => {
        fetch('GroupResults')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(returnJson => {
                setGroupResults(returnJson);
                setViewResults(true);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }

    const resultsColumns = [{
        dataField: 'position',
        text: 'Position'
    }, {
        dataField: 'groupName',
        text: 'Group Name'
    }, {
        dataField: 'formattedRemainingTime',
        text: 'Time Remaining'
        }];

    const rowStyle = (row, rowIndex) => {
        console.log(row);
        if (row.groupName === groupName) {
            return { backgroundColor: 'black', color: 'white' }
        }        
    };

    // Helper to render the results table
    function ResultsTable({ data, columns, rowStyle, groupName }) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return <div>No results available.</div>;
        }
        return (
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col.dataField}>{col.text}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => {
                        const style = rowStyle ? rowStyle(row, idx) : {};
                        return (
                            <tr key={row.position ?? idx} style={style}>
                                {columns.map(col => (
                                    <td key={col.dataField}>
                                        {row[col.dataField]}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
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
        <FlickerStyle>
          <div style={{
            textAlign: 'center',
            color: '#dedede',
            marginBottom: '2rem',
            fontSize: '1.3rem',
            textShadow: '0 0 12px #8b0000, 0 0 24px #ff6b1a',
            animation: 'flicker 1.3s infinite'
          }}>
            Welcome, brave soul! Solve riddles, unlock secrets, and survive the night.<br />
            <span style={{
              color: '#8b0000',
              fontWeight: 'bold',
              animation: 'flicker 1.1s infinite'
            }}>Are you ready to play?</span>
          </div>
        </FlickerStyle>
        <Modal show={viewResults} onHide={() => setViewResults(false)} className="special_modal">
            <Modal.Header closeButton>
                <Modal.Title>Results</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ResultsTable
                    data={groupResults}
                    columns={resultsColumns}
                    rowStyle={rowStyle}
                    groupName={groupName}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setViewResults(false)}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
        <Modal show={showOutOfTime} onHide={handleCloseOutOfTime} className="special_modal">
            <Modal.Header closeButton>
                <Modal.Title>Your Time Has Expired</Modal.Title>
            </Modal.Header>
            <Modal.Body>Press close to continue the challenge beyond your allotted time.</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseOutOfTime}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
        <Modal show={showSolved} onHide={handleCloseSolved} className="special_modal">
            <Modal.Header closeButton>
                <img src={victoryImage} className="img-fluid" />
            </Modal.Header>
            <Modal.Body>You Have Succeeded.</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseSolved}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
        <Transition
  in={showTimer}
  timeout={fadeDuration}
  mountOnEnter={true}
  nodeRef={timerNodeRef}
>
  {state => (
    <FadeContainer ref={timerNodeRef} state={state} duration={fadeDuration}>                        
                        <BottomTimer>
                            <div className="container">
                                <div className="row">
                                    <div className="col">
                                        {gameCompleted
                                            ? <Button size="lg" variant="secondary" onClick={handleViewResults}>
                                                View Results
                                            </Button>
                                            : <CountdownCircleTimer
                                                key={timerKey}
                                                strokeWidth={5}
                                                isPlaying={isPlaying}
                                                size={70}
                                                duration={timerDuration}
                                                initialRemainingTime={initialRemainingTime}
                                                colors={[
                                                    ['#00FF00', 0.5],
                                                    ['#FF0000', 0.5]
                                                ]}
                                                onComplete={() => {
                                                    setShowOutOfTime(true);
                                                    localStorage.setItem("showOutOfTime", true);
                                                    return [false, 0];
                                                }}
                                            >
                                                {renderTime}
                                            </CountdownCircleTimer>
                                        }                                        
                                    </div>
                                    <div className="col">
                                        <GroupNameDiv>
                                            {groupName}
                                        </GroupNameDiv>
                                    </div>
                                </div>
                            </div>
                        </BottomTimer>
                    </FadeContainer>
  )}
</Transition>
            <Transition
  in={showLogin}
  timeout={fadeDuration}
  onExited={() => {
    setShowTimer(true);
    localStorage.setItem("showTimer", showTimer);
    setShowRiddle(true);
    localStorage.setItem("showRiddle", true);
  }}
  mountOnEnter={true}
  unmountOnExit={true}
  nodeRef={loginNodeRef}
>
  {state => (
    <FadeContainer ref={loginNodeRef} state={state} duration={fadeDuration}>
      <GroupLogin riddleCount={riddleKeys.length} countDownTime={formatTimeString(timerDuration, true)} onClick={onSetGroupName} />
    </FadeContainer>
  )}
</Transition>
            <Transition
  in={showRiddle && !gameCompleted}
  timeout={fadeDuration}
  onExited={nextRiddle}
  mountOnEnter={true}
  unmountOnExit={true}
  onEntered={() => {
    if (riddle.type === 'audio') {
      audioElement.current.audioEl.current.pause();
    }
  }}
  nodeRef={riddleNodeRef}
>
  {state => (
    <FadeContainer ref={riddleNodeRef} state={state} duration={fadeDuration}>
      <Riddle RiddleData={riddle} onSolved={onSolved} onAddTime={addTime} />
    </FadeContainer>
  )}
</Transition>
            <Transition
  in={showRiddleSolved}
  timeout={fadeDuration}
  onEntered={() => { setShowRiddleSolved(false); localStorage.setItem("showRiddleSolved", false); audioElement.current.audioEl.current.play(); }}
  onExited={() => { setShowRiddle(true); localStorage.setItem("showRiddle", true); } }
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
            <ReactAudioPlayer
                ref={audioElement}
                src={backgroundmusic}
                onEnded={() => audioElement.current.audioEl.current.play()}
                volume={0.1}
            />
        </SpookyWrapper>
    );    
}

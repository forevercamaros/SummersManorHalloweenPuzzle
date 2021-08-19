import React, { useState, useEffect, useRef } from 'react';
import Riddle from './Riddle';
import riddleData from './riddle-data';
import styled from 'styled-components';
import FinalPuzzle from './FinalPuzzle';
import { Transition } from 'react-transition-group';
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import GroupLogin from './GroupLogin';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import backgroundmusic from '../darren-curtis-i-am-not-what-i-thought.mp3';
import ReactAudioPlayer from 'react-audio-player';
import BootstrapTable from 'react-bootstrap-table-next';

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

const FinalFadeContainer = styled.div`
  transition: opacity  ${props => props.duration}ms ease-in-out;
  opacity: ${props => (props.state === 'entering' || props.state === 'entered' ? '1' : '0')};
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

function formatTimeString(seconds, minutesOnly) {
    var sec_num = parseInt(seconds, 10); // don't forget the second param
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
    const timerDuration = 600;
    const [showLogin, setShowLogin] = useState(true);
    const [showTimer, setShowTimer] = useState(false);
    const [showRiddle, setShowRiddle] = useState(false);
    const [showRiddleSolved, setShowRiddleSolved] = useState(false);
    const [showFinalPuzzle, setShowFinalPuzzle] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [riddle, setRiddle] = useState(riddleData.riddles[riddleKeys[startIndex]]);
    const [initialRemainingTime, setInitialRemainingTime] = useState(timerDuration);
    const [timerKey, setTimerKey] = useState(0);
    const [groupName, setGroupName] = useState("");
    const [isPlaying, setIsPlaying] = useState(true);
    const [showExitPrompt, setShowExitPrompt] = useState(true);
    const [showOutOfTime, setShowOutOfTime] = useState(false);
    const [finalPuzzleCompleted, setFinalPuzzleCompleted] = useState(false);
    const [viewResults, setViewResults] = useState(false);
    const [groupResults, setGroupResults] = useState(null);
    const handleCloseOutOfTime = () => setShowOutOfTime(false);


    const audioElement = useRef(null);
    

    var _remainingTime = 0;
    var _finalTime = 0;

    const onFinalPuzzleCompleted = () => {
        _finalTime = _remainingTime;
        setFinalPuzzleCompleted(true);
        const data = { groupName: groupName, remainingTime: _remainingTime };
        fetch('UpdateRemainingTime', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        }).catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
        });
        setShowExitPrompt(false);
    }

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
    })

    // Re-Initialize the onbeforeunload event listener
    useEffect(() => {
        initBeforeUnLoad(showExitPrompt);
    }, [showExitPrompt]);
    
    function onSetGroupName(inGroupName) {
        setGroupName(inGroupName);
        setShowLogin(false);
        if (riddle.type !== 'audio') {
            audioElement.current.audioEl.current.play();
        }        
    }

    const renderTime = ({ remainingTime }) => {
        _remainingTime = remainingTime;
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
    }

    function nextRiddle() {
        var index = currentIndex+1;        
        if (index + 1 > riddleKeys.length) {
            index = 0;
        }
        if (index === startIndex) {
            setShowFinalPuzzle(true);
        } else {
            setCurrentIndex(index);            
            setRiddle(riddleData.riddles[riddleKeys[index]]);
            setShowRiddleSolved(true);           
        }
    }

    function addTime(time) {
        setTimerKey(timerKey + 1);
        setInitialRemainingTime(_remainingTime + time);
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
        text: 'Remaining Time'
    }];
    
    return (
        <>
            <Modal show={viewResults} onHide={() => setViewResults(false)} className="special_modal">
                <Modal.Header closeButton>
                    <Modal.Title>Results</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <BootstrapTable keyField='position' data={groupResults} columns={resultsColumns} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setViewResults(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showOutOfTime} onHide={handleCloseOutOfTime} className="special_modal">
                <Modal.Header closeButton>
                    <Modal.Title>Time Out</Modal.Title>
                </Modal.Header>
                <Modal.Body>You are out of time.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseOutOfTime}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Transition in={showTimer} timeout={fadeDuration} mountOnEnter={true}>
                {state => (
                    <FadeContainer state={state} duration={fadeDuration}>                        
                        <BottomTimer>
                            <div className="container">
                                <div className="row">
                                    <div className="col">
                                        {finalPuzzleCompleted
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
            <Transition in={showLogin} timeout={fadeDuration} onExited={() => {
                setShowTimer(true);
                setShowRiddle(true);
            }} mountOnEnter={true} unmountOnExit={true}>
                {state => (
                    <FadeContainer state={state} duration={fadeDuration}>
                        <GroupLogin riddleCount={riddleKeys.length} countDownTime={formatTimeString(timerDuration, true)} onClick={onSetGroupName} />
                    </FadeContainer>
                )}                
            </Transition>
            <Transition in={showRiddle} timeout={fadeDuration} onExited={nextRiddle} mountOnEnter={true} unmountOnExit={true} onEntered={() => {
                if (riddle.type === 'audio') {
                    audioElement.current.audioEl.current.pause();
                }
            }}>
                {state => (
                    <FadeContainer state={state} duration={fadeDuration}>
                        <Riddle RiddleData={riddle} onSolved={onSolved} onAddTime={addTime} />
                    </FadeContainer>
                )}
            </Transition>
            <Transition in={showRiddleSolved} timeout={fadeDuration} onEntered={() => { setShowRiddleSolved(false); audioElement.current.audioEl.current.play(); }} onExited={() => { setShowRiddle(true) }} unmountOnExit={true}>
                {state => (
                    <FadeContainer state={state} duration={fadeDuration}>
                        Riddle Solved. Loading new riddle!!
                    </FadeContainer>
                )}
            </Transition>            
            <Transition in={showFinalPuzzle} timeout={fadeDuration} mountOnEnter={true}>
                {state => (
                    <FinalFadeContainer state={state} duration={fadeDuration}>
                        <FinalPuzzle onComplete={ onFinalPuzzleCompleted } />
                    </FinalFadeContainer>
                )}
            </Transition>
            <BottomPadding />
            <ReactAudioPlayer
                ref={audioElement}
                src={backgroundmusic}
                onEnded={() => audioElement.current.audioEl.current.play()}
                volume={0.1}
            />
        </>
    );    
}

import React, { useState, useEffect } from 'react';
import Riddle from './Riddle';
import riddleData from './riddle-data';
import styled from 'styled-components';
import FinalPuzzle from './FinalPuzzle';
import { Transition } from 'react-transition-group';
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import GroupLogin from './GroupLogin';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
    const [showExitPrompt, setShowExitPrompt] = useState(true);

    var _remainingTime = 0;

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
    }

    const renderTime = ({ remainingTime }) => {
        _remainingTime = remainingTime;
        if (remainingTime === 0) {
            return <div className="timer">Too late...</div>;
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

    return (
        <>
            <Transition in={showTimer} timeout={fadeDuration} mountOnEnter={true}>
                {state => (
                    <FadeContainer state={state} duration={fadeDuration}>                        
                        <BottomTimer>
                            <div className="container">
                                <div className="row">
                                    <div className="col">
                                        <CountdownCircleTimer
                                            key={timerKey}
                                            strokeWidth={5}
                                            isPlaying
                                            size={70}
                                            duration={timerDuration}
                                            initialRemainingTime={initialRemainingTime}
                                            colors={[
                                                ['#00FF00', 0.5],
                                                ['#FF0000', 0.5]
                                            ]}
                                            onComplete={() => [true, 1000]}
                                        >
                                            {renderTime}
                                        </CountdownCircleTimer>
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
            <Transition in={showRiddle} timeout={fadeDuration} onExited={nextRiddle} mountOnEnter={true} unmountOnExit={true}>
                {state => (
                    <FadeContainer state={state} duration={fadeDuration}>
                        <Riddle RiddleData={riddle} onSolved={onSolved} onAddTime={addTime} />
                    </FadeContainer>
                )}
            </Transition>
            <Transition in={showRiddleSolved} timeout={fadeDuration} onEntered={() => { setShowRiddleSolved(false) }} onExited={() => { setShowRiddle(true) }} unmountOnExit={true}>
                {state => (
                    <FadeContainer state={state} duration={fadeDuration}>
                        Riddle Solved. Loading new riddle!!
                    </FadeContainer>
                )}
            </Transition>            
            <Transition in={showFinalPuzzle} timeout={fadeDuration} mountOnEnter={true}>
                {state => (
                    <FinalFadeContainer state={state} duration={fadeDuration}>
                        <FinalPuzzle />
                    </FinalFadeContainer>
                )}
            </Transition>
            <BottomPadding />
        </>
    );    
}

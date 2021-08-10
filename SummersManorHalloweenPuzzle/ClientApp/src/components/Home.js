import React, { useState } from 'react';
import Riddle from './Riddle';
import riddleData from './riddle-data';
import styled from 'styled-components';
import FinalPuzzle from './FinalPuzzle';
import { Transition } from 'react-transition-group';

var riddleKeys = Object.keys(riddleData.riddles);
var startIndex = Math.floor(Math.random() * riddleKeys.length);

const FadeContainer = styled.div`
  transition: opacity  ${props => props.duration}ms ease-in-out;
  opacity: ${props => (props.state === 'entering' || props.state === 'entered' ? '1' : '0')};
  color: white;
`;

const FinalFadeContainer = styled.div`
  transition: opacity  ${props => props.duration}ms ease-in-out;
  opacity: ${props => (props.state === 'entering' || props.state === 'entered' ? '1' : '0')};
`;

export default function Home() {
    const fadeDuration = 1000;
    const [showRiddle, setShowRiddle] = useState(true);
    const [showRiddleSolved, setShowRiddleSolved] = useState(false);
    const [showFinalPuzzle, setShowFinalPuzzle] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [riddle, setRiddle] = useState(riddleData.riddles[riddleKeys[startIndex]]);
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
    return (
        <>
            <Transition in={showRiddle} timeout={fadeDuration} onExited={nextRiddle} mountOnEnter={true} unmountOnExit={true}>
                {state => (
                    <FadeContainer state={state} duration={fadeDuration}>
                        <Riddle RiddleData={riddle} onSolved={onSolved} />
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
            <Transition in={showFinalPuzzle} timeout={fadeDuration}>
                {state => (
                    <FinalFadeContainer state={state} duration={fadeDuration}>
                        <FinalPuzzle />
                    </FinalFadeContainer>
                )}
            </Transition>
        </>
    );    
}

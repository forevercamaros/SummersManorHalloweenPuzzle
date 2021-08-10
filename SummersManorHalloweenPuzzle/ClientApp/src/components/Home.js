import React, { useState } from 'react';
import Riddle from './Riddle';
import riddleData from './riddle-data';
import Button from 'react-bootstrap/Button';
import { Container, Row, Col } from 'react-grid-system';
import styled from 'styled-components';
import FinalPuzzle from './FinalPuzzle';

var riddleKeys = Object.keys(riddleData.riddles);
var startIndex = Math.floor(Math.random() * riddleKeys.length);

const NextRiddleText = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
`;

export default function Home() {
    const [solved, setSolved] = useState(false);
    const [finalPuzzle, setFinalPuzzle] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [riddle, setRiddle] = useState(riddleData.riddles[riddleKeys[startIndex]]);
    function onSolved() {
        setSolved(true);      
    }

    function nextRiddle() {
        var index = currentIndex+1;        
        if (index + 1 > riddleKeys.length) {
            index = 0;
        }
        if (index === startIndex) {
            setFinalPuzzle(true);
            //TODO Write Code to start final puzzle
        } else {
            setCurrentIndex(index);
            setRiddle(riddleData.riddles[riddleKeys[index]]);
            setSolved(false);            
        }
    }
    if (finalPuzzle === true) {
        return (
            <FinalPuzzle />            
        );
    } else if (solved === false) {
        return (
            <Riddle RiddleData={riddle} onSolved={onSolved} />
        );
    } else {
        return (
            <Container fluid>
                <Row>
                    <Col>
                        <NextRiddleText>Correct. Click Button For Next Riddle.</NextRiddleText>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button variant="primary" onClick={nextRiddle}>Next Riddle</Button>
                    </Col>
                </Row>
            </Container>
        );        
    }
    
}

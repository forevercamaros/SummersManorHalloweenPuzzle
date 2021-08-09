import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import ReactAudioPlayer from 'react-audio-player'
import soundFile from '../ChopinsFuneralMarch.mp3'
import { Container, Row, Col } from 'react-grid-system';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'


const RiddleText = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  color: white;
`;
const AudioHelpText = styled.div`
  margin: 8px;
  display: flex;
  flex-direction: column;
  color: white;
`;

export default function Riddle({ onSolved, RiddleData }) {
    var onSolved = onSolved;
    var answer = RiddleData.answer;
    const answerElement = useRef(null);
    var bonusText = Riddle.bonusText;

    const [showClue, setShowClue] = useState(false);
    const [clueRevealed, setClueRevealed] = useState(false);
    const handleCloseClue = () => setShowClue(false);
    const handleShowClue = () => {
        setClueRevealed(true);
        setShowClue(true);
    };

    const [showBonus, setShowBonus] = useState(false);
    const handleCloseBonus = () => setShowBonus(false);
    const handleShowBonus = () => setShowBonus(true);

    useEffect(() => {
        if (answerElement.current) {
            answerElement.current.focus();
        }
    }, []);

    function AddAudio({ type }) {
        if (type === "audio") {
            return (
                <>
                    <Row>
                        <Col>
                            <AudioHelpText>If Audio doesn't play automatically. Click the play button</AudioHelpText>
                        </Col>                    
                </Row>
                    <Row>
                    <Col>
                        <ReactAudioPlayer
                            src={soundFile}
                            autoPlay
                            controls
                        />
                    </Col>                    
                </Row>
                </>         
            )
        } else {
            return ("");
        }
    }

    function AddClue({ clueText, clue }) {
        if (clueText !== "" && typeof clueText !== 'undefined') {
            return (
                <>
                    <RiddleText>{clueText}</RiddleText>
                    <Button variant="primary" onClick={handleShowClue}>
                        Reveal Clue
                    </Button>

                    <Modal show={showClue} onHide={handleCloseClue}>
                        <Modal.Header closeButton>
                            <Modal.Title>Your Clue</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>{clue}</Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" onClick={handleCloseClue}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )
        } else {
            return ("");
        }
    }

    function AddBonus({ bonusText }) {
        if (bonusText !== "" && typeof bonusText !== 'undefined') {
            return (
                <Modal show={showBonus} onHide={handleCloseBonus}>
                    <Modal.Header closeButton>
                        <Modal.Title>Your Bonus</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{bonusText}</Modal.Body>
                    <Modal.Footer>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="basic-addon1">Answer</InputGroup.Text>
                            <FormControl ref={answerElement} onChange={TextChange} />
                        </InputGroup>
                    </Modal.Footer>
                </Modal>
            )
        } else {
            return ("");
        }
    }

    function TextChange(value) {
        if (value.currentTarget.value.toLowerCase() === answer.toLowerCase()) {
            if (bonusText === "" || typeof bonusText === 'undefined' || clueRevealed === true) {
                onSolved();
            } else {
                handleShowBonus();
            }
            
        }
    }   


    return (
        <Container fluid>
            <Row>
                <Col>
                    <RiddleText>{RiddleData.riddle}</RiddleText>
                </Col>
            </Row>
            <AddAudio type={RiddleData.type} />            
            <AddClue clueText={RiddleData.clueText} clue={RiddleData.clue} />
            <AddBonus bonusText={RiddleData.bonusText} bonusAnswer={RiddleData.bonusAnswer} />
            <Row>
                <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">Answer</InputGroup.Text>
                        <FormControl ref={answerElement} onChange={ TextChange }/>
                    </InputGroup>
                </Col>
            </Row>            
        </Container>        
    )
}
import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import ReactAudioPlayer from 'react-audio-player'
import ChopinsFuneralMarch from '../ChopinsFuneralMarch.mp3'
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

const ClueDiv = styled.div`
  margin: 8px;  
  border-radius: 2px;
  display: flex;
  flex-direction: column;
`;

export default function Riddle({ onSolved, RiddleData }) {    
    const answerElement = useRef(null);
    const bonusElement = useRef(null);
    const audioElement = useRef(null);

    const [readOnlyAnswer, setReadOnlyAnswer] = useState(false);
    const [readOnlyBonus, setReadOnlyBonus] = useState(false);
    const [showClue, setShowClue] = useState(false);
    const [clueRevealed, setClueRevealed] = useState(false);
    const handleCloseClue = () => setShowClue(false);
    const handleShowClue = () => {
        audioElement.current.audioEl.current.pause();
        setClueRevealed(true);
        setShowClue(true);
    };

    const [showBonus, setShowBonus] = useState(false);
    const handleCloseBonus = () => {        
        setShowBonus(false);
        onSolved();
    }
    const handleShowBonus = () => setShowBonus(true);

    const focusBonusInput = () => {
        if (bonusElement.current) {
            bonusElement.current.focus();
        }
    }

    useEffect(() => {
        if (answerElement.current) {
            answerElement.current.focus();
        }
    }, []);

    function AddAudio({ type, audioFile }) {
        var _audioFile;
        switch (audioFile) {
            case "ChopinsFuneralMarch":
                _audioFile = ChopinsFuneralMarch;
                break;
        }
        if (type === "audio") {
            return (
                <>
                    <Row>
                        <Col>
                            <ReactAudioPlayer
                                ref={audioElement}
                                src={_audioFile}
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
                <ClueDiv>
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
                </ClueDiv>
            )
        } else {
            return ("");
        }
    }

    function AddBonus({ bonusText }) {
        if (bonusText !== "" && typeof bonusText !== 'undefined') {
            return (
                <Modal show={showBonus} onHide={handleCloseBonus} onEntered={focusBonusInput}>
                    <Modal.Header closeButton>
                        <Modal.Title>Your Bonus</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{bonusText}</Modal.Body>
                    <Modal.Footer>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="basic-addon1">Answer</InputGroup.Text>
                            <FormControl ref={bonusElement} onChange={BonusTextChange} readOnly={readOnlyBonus}/>
                        </InputGroup>
                    </Modal.Footer>
                </Modal>
            )
        } else {
            return ("");
        }
    }

    function TextChange(value) {
        if (value.currentTarget.value.toLowerCase() === RiddleData.answer.toLowerCase()) {
            setReadOnlyAnswer(true);
            if (RiddleData.bonusText === "" || typeof RiddleData.bonusText === 'undefined' || clueRevealed === true) {
                onSolved();
            } else {
                handleShowBonus();
            }
            
        }
    }
    function BonusTextChange(value) {
        if (value.currentTarget.value.toLowerCase() === RiddleData.bonusAnswer.toLowerCase()) {
            //TODO ADD TIME TO TIMER and notify of bonus answered
            setReadOnlyBonus(true);
            handleCloseBonus();
        }
    }


    return (
        <Container fluid>
            <Row>
                <Col>
                    <RiddleText>{RiddleData.riddle}</RiddleText>
                </Col>
            </Row>
            <AddAudio type={RiddleData.type} audioFile={RiddleData.audioFile} />
            <AddClue clueText={RiddleData.clueText} clue={RiddleData.clue} />
            <AddBonus bonusText={RiddleData.bonusText} bonusAnswer={RiddleData.bonusAnswer} />
            <Row>
                <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">Answer</InputGroup.Text>
                        <FormControl ref={answerElement} onChange={TextChange} readOnly={readOnlyAnswer}/>
                    </InputGroup>
                </Col>
            </Row>            
        </Container>        
    )
}
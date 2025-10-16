import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import ReactAudioPlayer from 'react-audio-player'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { Transition } from 'react-transition-group';

const spookyFlicker = keyframes`
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
`;

const evilGlow = keyframes`
  0% { 
    box-shadow: 0 0 10px #8b0000, 0 0 20px #ff6b1a, 0 0 30px #8b0000;
    filter: brightness(1);
  }
  50% { 
    box-shadow: 0 0 20px #8b0000, 0 0 40px #ff6b1a, 0 0 60px #8b0000;
    filter: brightness(1.2);
  }
  100% { 
    box-shadow: 0 0 10px #8b0000, 0 0 20px #ff6b1a, 0 0 30px #8b0000;
    filter: brightness(1);
  }
`;

const FadeContainer = styled.div`
  transition: opacity ${props => props.duration}ms ease-in-out;
  opacity: ${props => (props.state === 'entering' || props.state === 'entered' ? '1' : '0')};
  color: #dedede;
`;

const RiddleText = styled.div`
  margin: 8px;
  border: 2px solid #ff6b1a;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  color: #dedede;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.3) 100%);
  padding: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-size: 1.2rem;
  line-height: 1.5;
  text-shadow: 0 0 8px rgba(255, 107, 26, 0.3);
  box-shadow: 
    0 0 20px rgba(255, 107, 26, 0.3),
    inset 0 0 20px rgba(139, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 1rem;
    margin: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0.75rem;
    margin: 4px;
  }
`;

const ClueDiv = styled.div`
  margin: 8px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SpookyInputGroup = styled(InputGroup)`
  margin-bottom: 1rem;
  
  .input-group-text {
    background: linear-gradient(135deg, #8b0000 0%, #ff6b1a 100%) !important;
    border: 2px solid #ff6b1a !important;
    color: #dedede !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif !important;
    font-size: 1rem !important;
    text-shadow: 0 0 8px #8b0000 !important;
    letter-spacing: 1px !important;
    font-weight: bold !important;
    text-transform: uppercase !important;
    
    @media (max-width: 768px) {
      font-size: 0.9rem !important;
    }
  }
`;

const SpookyFormControl = styled(FormControl)`
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.2) 100%) !important;
  border: 2px solid #ff6b1a !important;
  color: #ff6b1a !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif !important;
  font-size: 1.1rem !important;
  text-shadow: 0 0 4px rgba(255, 107, 26, 0.5) !important;
  letter-spacing: 1px !important;
  padding: 0.75rem !important;
  
  @media (max-width: 768px) {
    font-size: 1rem !important;
    padding: 0.6rem !important;
  }
  
  &::placeholder {
    color: rgba(255, 107, 26, 0.6) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif !important;
  }
  
  &:focus {
    background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.3) 100%) !important;
    border-color: #ff6b1a !important;
    box-shadow: 
      0 0 0 0.2rem rgba(255, 107, 26, 0.25),
      0 0 20px rgba(255, 107, 26, 0.5) !important;
    color: #ff6b1a !important;
  }
  
  &[readonly] {
    background: linear-gradient(135deg, rgba(139, 0, 0, 0.8) 0%, rgba(255, 107, 26, 0.4) 100%) !important;
    color: #dedede !important;
    border-color: #2cba3f !important;
    animation: ${evilGlow} 2s infinite;
  }
`;

const SpookyButton = styled(Button)`
  background: linear-gradient(135deg, #8b0000 0%, #ff6b1a 100%) !important;
  border: 2px solid #ff6b1a !important;
  color: #dedede !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif !important;
  font-size: 1rem !important;
  text-shadow: 0 0 8px #8b0000 !important;
  letter-spacing: 2px !important;
  padding: 12px 24px !important;
  text-transform: uppercase !important;
  font-weight: bold !important;
  transition: all 0.3s ease !important;
  animation: ${spookyFlicker} 3s infinite !important;
  
  @media (max-width: 768px) {
    font-size: 0.9rem !important;
    padding: 10px 20px !important;
    letter-spacing: 1px !important;
  }
  
  &:hover {
    background: linear-gradient(135deg, #ff6b1a 0%, #8b0000 100%) !important;
    border-color: #ff6b1a !important;
    color: #fff !important;
    box-shadow: 
      0 0 20px rgba(255, 107, 26, 0.5),
      0 0 40px rgba(139, 0, 0, 0.3) !important;
    transform: translateY(-2px) !important;
  }
  
  &:focus {
    box-shadow: 
      0 0 0 0.2rem rgba(255, 107, 26, 0.25),
      0 0 20px rgba(255, 107, 26, 0.5) !important;
  }
`;

const SpookyModal = styled(Modal)`
  .modal-content {
    background: linear-gradient(135deg, #0a0a0a 80%, #8b0000 100%);
    border: 2px solid #ff6b1a;
    color: #dedede;
    box-shadow: 
      0 0 30px rgba(255, 107, 26, 0.5),
      0 0 60px rgba(139, 0, 0, 0.3);
  }
  
  .modal-header {
    border-bottom: 2px solid #ff6b1a;
    background: rgba(139, 0, 0, 0.3);
    
    .modal-title {
      color: #ff6b1a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      text-shadow: 0 0 8px #8b0000;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: bold;
      animation: ${spookyFlicker} 2s infinite;
    }
    
    .btn-close {
      filter: invert(1);
      opacity: 0.8;
      
      &:hover {
        opacity: 1;
        transform: scale(1.1);
      }
    }
  }
  
  .modal-body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    font-size: 1.1rem;
    line-height: 1.5;
    padding: 1.5rem;
    background: rgba(10, 10, 10, 0.3);
    text-shadow: 0 0 4px rgba(255, 107, 26, 0.3);
  }
  
  .modal-footer {
    border-top: 2px solid #ff6b1a;
    background: rgba(139, 0, 0, 0.2);
    padding: 1rem;
  }
`;

const SpookyAudioWrapper = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.3) 100%);
  border: 2px solid #ff6b1a;
  border-radius: 8px;
  box-shadow: 
    0 0 20px rgba(255, 107, 26, 0.3),
    inset 0 0 20px rgba(139, 0, 0, 0.2);
  
  audio {
    width: 100%;
    filter: sepia(1) hue-rotate(320deg) saturate(3);
    
    &::-webkit-media-controls-panel {
      background-color: rgba(139, 0, 0, 0.8);
    }
  }
`;

export default function Riddle({ onSolved, RiddleData, onAddTime }) {    
    const answerElement = useRef(null);
    const bonusElement = useRef(null);
    const audioElement = useRef(null);
    const navigate = useNavigate();

    const [readOnlyAnswer, setReadOnlyAnswer] = useState(false);
    const [readOnlyBonus, setReadOnlyBonus] = useState(false);
    const [showClue, setShowClue] = useState(false);
    const [clueRevealed, setClueRevealed] = useState(false);
    const [showClueOption, setShowClueOption] = useState(false);

    const handleCloseClue = () => setShowClue(false);
    const handleShowClue = () => {
        if (RiddleData.type === "audio") {
            audioElement.current.audioEl.current.pause();
        }        
        setClueRevealed(true);
        setShowClue(true);
        onAddTime(-30);
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
        const timer = setTimeout(() => {
            setShowClueOption(true);
        }, 180000);
        return () => clearTimeout(timer);
    }, []);

    function AddAudio({ type, audioFile }) {
        if (type === "audio" && audioFile) {
            // Dynamically import the audio file based on filename
            const audioPath = require(`../audio/${audioFile}.mp3`);
            
            return (
                <Row>
                    <Col>
                        <SpookyAudioWrapper>
                            <ReactAudioPlayer
                                ref={audioElement}
                                src={audioPath}
                                controls
                                onEnded={() => setShowClueOption(true)}
                                onCanPlay={() => { if (!clueRevealed) { audioElement.current.audioEl.current.play(); }}}
                            />
                        </SpookyAudioWrapper>
                    </Col>                    
                </Row>         
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
                    <SpookyButton variant="secondary" onClick={handleShowClue}>
                        Reveal Clue
                    </SpookyButton>

                    <SpookyModal show={showClue} onHide={handleCloseClue}>
                        <Modal.Header closeButton>
                            <Modal.Title>Your Clue</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>{clue}</Modal.Body>
                        <Modal.Footer>
                            <SpookyButton variant="secondary" onClick={handleCloseClue}>
                                Close
                            </SpookyButton>
                        </Modal.Footer>
                    </SpookyModal>
                </ClueDiv>
            )
        } else {
            return ("");
        }
    }

    function AddBonus({ bonusText }) {
        if (bonusText !== "" && typeof bonusText !== 'undefined') {
            return (
                <SpookyModal show={showBonus} onHide={handleCloseBonus} onEntered={focusBonusInput}>
                    <Modal.Header closeButton>
                        <Modal.Title>Your Bonus</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{bonusText}</Modal.Body>
                    <Modal.Footer>
                        <SpookyInputGroup className="mb-3">
                            <InputGroup.Text id="basic-addon1">Answer</InputGroup.Text>
                            <SpookyFormControl ref={bonusElement} onChange={BonusTextChange} readOnly={readOnlyBonus}/>
                        </SpookyInputGroup>
                    </Modal.Footer>
                </SpookyModal>
            )
        } else {
            return ("");
        }
    }

    function TextChange(value) {
        const inputValue = value.currentTarget.value;
        
        // Check if user typed "settings" to navigate to settings page
        if (inputValue.toLowerCase().trim() === "settings") {
            // Small delay to allow user to see what they typed
            setTimeout(() => {
                navigate('/settings');
            }, 500);
            return;
        }

        if (inputValue.toLowerCase().trim() === RiddleData.answer.toLowerCase()) {
            setReadOnlyAnswer(true);
            
            // Only show bonus if there is bonus text AND clue hasn't been revealed
            if (RiddleData.bonusText && 
                RiddleData.bonusText.trim() !== "" && 
                typeof RiddleData.bonusText !== 'undefined' && 
                clueRevealed === false) {
                handleShowBonus();
            } else {
                onSolved();
            }
        }
    }

    function BonusTextChange(value) {
        const inputValue = value.currentTarget.value;
        
        // Check if user typed "settings" in bonus field
        if (inputValue.toLowerCase().trim() === "settings") {
            setTimeout(() => {
                navigate('/settings');
            }, 500);
            return;
        }

        if (inputValue.toLowerCase() === RiddleData.bonusAnswer.toLowerCase()) {
            onAddTime(120);
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
            <AddBonus bonusText={RiddleData.bonusText} bonusAnswer={RiddleData.bonusAnswer} />
            <Row>
                <Col>
                    <SpookyInputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">Answer</InputGroup.Text>
                        <SpookyFormControl ref={answerElement} onChange={TextChange} readOnly={readOnlyAnswer}/>
                    </SpookyInputGroup>
                </Col>
            </Row>
            <Transition in={showClueOption} timeout={1000}>
                {state => (
                    <FadeContainer state={state} duration={1000}>
                        <AddClue clueText={RiddleData.clueText} clue={RiddleData.clue} />
                    </FadeContainer>
                )}                
            </Transition>
        </Container>        
    )
}
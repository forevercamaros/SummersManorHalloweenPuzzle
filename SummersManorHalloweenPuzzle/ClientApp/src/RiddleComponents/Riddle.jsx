import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
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

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0) scale(1); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px) scale(1.02); }
  20%, 40%, 60%, 80% { transform: translateX(10px) scale(1.02); }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
`;

const FadeContainer = styled.div`
  transition: opacity ${props => props.$duration}ms ease-in-out;
  opacity: ${props => (props.$state === 'entering' || props.$state === 'entered' ? '1' : '0')};
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

const SequenceButtonsContainer = styled.div`
  margin: 20px 8px;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.3) 100%);
  border: 2px solid #ff6b1a;
  border-radius: 8px;
  box-shadow: 
    0 0 20px rgba(255, 107, 26, 0.3),
    inset 0 0 20px rgba(139, 0, 0, 0.2);
  position: relative;
`;

const SequenceButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 0.75rem;
  }
`;

const ColorButton = styled.button`
  width: 100%;
  aspect-ratio: 1;
  min-height: 80px;
  border: 3px solid #ff6b1a;
  border-radius: 8px;
  background-color: ${props => props.color} !important;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  
  /* Remove all default mobile browser behaviors */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  touch-action: manipulation;
  outline: none !important;
  
  /* Prevent iOS Safari color changes */
  &,
  &:link,
  &:visited,
  &:hover,
  &:active,
  &:focus {
    background-color: ${props => props.color} !important;
    outline: none !important;
  }
  
  /* Desktop hover - don't apply on touch devices */
  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
    }
  }
  
  /* Active state for all devices */
  &:active:not(:disabled) {
    transform: scale(0.92) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.4) !important;
    border-width: 4px !important;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    min-height: 60px;
    font-size: 0.9rem;
  }
`;

const FailureOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  animation: ${props => props.$fadeOut ? fadeOut : fadeIn} 0.5s ease-out;
  pointer-events: ${props => props.$fadeOut ? 'none' : 'all'};
`;

const FailureMessage = styled.div`
  max-width: 600px;
  margin: 0 20px;
  padding: 3rem 2rem;
  background: linear-gradient(135deg, rgba(139, 0, 0, 0.95) 0%, rgba(255, 107, 26, 0.7) 100%);
  border: 4px solid #ff0000;
  border-radius: 16px;
  color: #ff6b1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 0 12px #8b0000, 0 0 24px #ff0000;
  animation: ${shakeAnimation} 0.5s ease-out, ${spookyFlicker} 2s infinite;
  box-shadow: 
    0 0 40px rgba(255, 0, 0, 0.8),
    0 0 80px rgba(139, 0, 0, 0.6),
    inset 0 0 40px rgba(139, 0, 0, 0.4);
  transform-origin: center;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    padding: 2rem 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    padding: 1.5rem 1rem;
  }
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

// Color mapping for sequence riddles
const COLOR_MAP = {
    red: '#FF0000',
    blue: '#0000FF',
    yellow: '#FFFF00',
    green: '#00FF00',
    orange: '#FF8000',
    purple: '#800080'
};

// Spooky failure messages
const FAILURE_MESSAGES = [
    "The spirits reject your sequence... Try again, if you dare!",
    "Wrong! The shadows whisper of your failure...",
    "Your soul trembles as the darkness denies your attempt!",
    "The cursed pattern eludes you... Beware the creeping dread!",
    "Incorrect! The haunted sequence mocks your feeble effort!",
    "The phantom colors fade... Your sequence has been banished!",
    "A ghastly mistake! The void swallows your sequence whole!",
    "The ancient spell rejects your offering... Try once more!",
    "Your sequence crumbles into the abyss of despair!",
    "The vengeful spirits laugh at your misguided attempt!"
];

const MemoizedRiddle = memo(function Riddle({ onSolved, RiddleData, onAddTime }) {
    console.log('Riddle component received RiddleData:', JSON.stringify(RiddleData, null, 2));
    const type = (RiddleData.type ?? '').toLowerCase();

    const answerElement = useRef(null);
    const bonusElement = useRef(null);
    const audioElement = useRef(null);
    const navigate = useNavigate();

    const [readOnlyAnswer, setReadOnlyAnswer] = useState(false);
    const [readOnlyBonus, setReadOnlyBonus] = useState(false);
    const [showClue, setShowClue] = useState(false);
    const [clueRevealed, setClueRevealed] = useState(false);
    const [showClueOption, setShowClueOption] = useState(false);
    const [userSequence, setUserSequence] = useState([]);
    const [sequenceSolved, setSequenceSolved] = useState(false);
    const [sequenceError, setSequenceError] = useState(false);
    const [failureMessage, setFailureMessage] = useState('');
    const [fadeOut, setFadeOut] = useState(false);
    const [pressedButton, setPressedButton] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [bonusAnswerText, setBonusAnswerText] = useState('');
    const lastTypedAtRef = useRef(0);
    const lastAudioTimeRef = useRef(0);

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
        if (answerElement.current && RiddleData.type !== 'sequence') {
            answerElement.current.focus();
        }

        if (RiddleData.type === "audio" && audioElement.current && !clueRevealed) {
            const playPromise = audioElement.current.audioEl.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay prevented:", error);
                });
            }
        }

        const timer = setTimeout(() => {
            setShowClueOption(true);
        }, 180000);
        return () => clearTimeout(timer);
    }, [RiddleData, clueRevealed]);

    // Focus bonus input when modal opens
    useEffect(() => {
        if (showBonus) {
            setTimeout(() => focusBonusInput(), 0);
        }
    }, [showBonus]);

    const handleColorClick = useCallback((color) => {
        if (sequenceSolved || sequenceError) return;

        const newSequence = [...userSequence, color];
        setUserSequence(newSequence);

        const correctSoFar = RiddleData.correctSequence.slice(0, newSequence.length);
        const isCorrectSoFar = newSequence.every((c, i) => c === correctSoFar[i]);

        if (!isCorrectSoFar) {
            setSequenceError(true);
            setFadeOut(false);
            const randomMessage = FAILURE_MESSAGES[Math.floor(Math.random() * FAILURE_MESSAGES.length)];
            setFailureMessage(randomMessage);

            setTimeout(() => setFadeOut(true), 3500);
            setTimeout(() => {
                setUserSequence([]);
                setSequenceError(false);
                setFailureMessage('');
                setFadeOut(false);
            }, 4000);
            return;
        }

        if (newSequence.length === RiddleData.correctSequence.length) {
            setSequenceSolved(true);
            setReadOnlyAnswer(true);

            if (RiddleData.bonusText &&
                RiddleData.bonusText.trim() !== "" &&
                typeof RiddleData.bonusText !== 'undefined' &&
                clueRevealed === false) {
                handleShowBonus();
            } else {
                onSolved();
            }
        }
    }, [userSequence, sequenceSolved, sequenceError, RiddleData.correctSequence, RiddleData.bonusText, clueRevealed, onSolved]);

    const normalize = (s) => (s ?? '').toString().trim().toLowerCase();

    const checkAnswer = useCallback((value) => {
        if (readOnlyAnswer) return;

        const expected = normalize(RiddleData.answer);
        const actual = normalize(value);

        if (expected && actual === expected) {
            setReadOnlyAnswer(true);

            if (RiddleData.bonusText &&
                RiddleData.bonusText.trim() !== "" &&
                typeof RiddleData.bonusText !== 'undefined' &&
                clueRevealed === false) {
                handleShowBonus();
            } else {
                onSolved();
            }
        }
    }, [readOnlyAnswer, RiddleData.answer, RiddleData.bonusText, clueRevealed, onSolved]);

    const keepAudioPlaying = useCallback(() => {
        if (type !== 'audio') return;
        const el = audioElement.current?.audioEl?.current;
        if (!el) return;

        // If the browser reset currentTime during a pause, restore it
        if (!el.ended && lastAudioTimeRef.current > 0 && Math.abs(el.currentTime - lastAudioTimeRef.current) > 0.05) {
            el.currentTime = lastAudioTimeRef.current;
        }

        if (el.paused && !el.ended) {
            const p = el.play();
            if (p && typeof p.then === 'function') p.catch(() => {});
        }
    }, [type]);

    // Replace the existing checkBonusAnswer with this version
    const checkBonusAnswer = useCallback((value) => {
        if (readOnlyBonus) return;

        const expected = normalize(RiddleData.bonusAnswer);
        const actual = normalize(value);

        // Only award time when a non-empty expected answer matches
        if (expected && actual === expected) {
            setReadOnlyBonus(true);

            // Award +60 seconds for answering the bonus correctly
            if (typeof onAddTime === 'function') {
                onAddTime(60);
            }

            // Close the bonus modal (this already calls onSolved)
            if (showBonus) {
                handleCloseBonus();
            }
        }
    }, [readOnlyBonus, RiddleData.bonusAnswer, showBonus, handleCloseBonus, onAddTime]);

    const handleAnswerSubmit = () => {
        if (readOnlyAnswer) return;
        const normalizedAnswer = answerText.trim().toLowerCase();

        if (normalizedAnswer === (RiddleData.answer ?? '').toString().trim().toLowerCase()) {
            setReadOnlyAnswer(true);

            if (RiddleData.bonusText &&
                RiddleData.bonusText.trim() !== "" &&
                typeof RiddleData.bonusText !== 'undefined' &&
                clueRevealed === false) {
                handleShowBonus();
            } else {
                onSolved();
            }
        } else {
            setFadeOut(false);
            const randomMessage = FAILURE_MESSAGES[Math.floor(Math.random() * FAILURE_MESSAGES.length)];
            setFailureMessage(randomMessage);

            setTimeout(() => setFadeOut(true), 3500);
            setTimeout(() => {
                setFadeOut(false);
                setFailureMessage('');
            }, 4000);
        }
    };

    function AddAudio({ type, audioFile }) {
        if (type === "audio" && audioFile) {
            const audioPath = require(`../audio/${audioFile}.mp3`);
            return (
                <Row>
                    <Col>
                        <SpookyAudioWrapper>
                            <ReactAudioPlayer
                                key={audioFile}             // only remount on file change
                                ref={audioElement}
                                src={audioPath}
                                controls
                                autoPlay
                                playsInline
                                preload="auto"
                                onEnded={handleAudioEnded}
                                onPause={handleAudioPause} // auto-resume when typing/focus causes a pause
                                listenInterval={250}
                                onListen={(time) => { lastAudioTimeRef.current = time; }}
                                onLoadedMetadata={(e) => {
                                    const el = e.currentTarget;
                                    if (lastAudioTimeRef.current > 0 && Math.abs(el.currentTime - lastAudioTimeRef.current) > 0.05) {
                                        el.currentTime = lastAudioTimeRef.current;
                                    }
                                }}
                            />
                        </SpookyAudioWrapper>
                    </Col>
                </Row>
            );
        }
        return "";
    }

    function AddSequenceButtons({ type, sequenceColors, correctSequence }) {
        const colors = sequenceColors || [];
        const sequence = correctSequence || [];

        if (type !== "sequence") return null;

        if (!colors || !Array.isArray(colors) || colors.length === 0) {
            return (
                <Row>
                    <Col>
                        <SequenceButtonsContainer>
                            <p style={{ color: '#ff6b1a', textAlign: 'center' }}>
                                No colors configured for this sequence riddle.
                            </p>
                        </SequenceButtonsContainer>
                    </Col>
                </Row>
            );
        }

        if (!sequence || !Array.isArray(sequence) || sequence.length === 0) {
            return (
                <Row>
                    <Col>
                        <SequenceButtonsContainer>
                            <p style={{ color: '#ff6b1a', textAlign: 'center' }}>
                                No correct sequence configured for this riddle.<br />
                                Please go to the Settings page and edit this riddle to set up the correct sequence.
                            </p>
                        </SequenceButtonsContainer>
                    </Col>
                </Row>
            );
        }

        return (
            <Row>
                <Col>
                    <SequenceButtonsContainer>
                        <SequenceButtonGrid>
                          {colors.map((color, index) => (
                            <ColorButton
                              key={index}
                              color={COLOR_MAP[color.toLowerCase()]}
                              onPointerDown={() => setPressedButton(index)}
                              onPointerUp={() => {
                                setPressedButton(null);
                                handleColorClick(color);
                              }}
                              onPointerCancel={() => setPressedButton(null)}
                              onPointerLeave={() => setPressedButton(null)}
                              disabled={sequenceSolved || sequenceError}
                              style={pressedButton === index ? {
                                transform: 'scale(0.92)',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.4)',
                                borderWidth: '4px'
                              } : {}}
                            >
                              {color.charAt(0).toUpperCase() + color.slice(1)}
                            </ColorButton>
                          ))}
                        </SequenceButtonGrid>
                    </SequenceButtonsContainer>
                </Col>
            </Row>
        );
    }

    // stable handler: audio ended
    const handleAudioEnded = useCallback(() => setShowClueOption(true), []);

    // stable handler: if the audio pauses while user is typing/focused in input, auto-resume
    const handleAudioPause = useCallback(() => {
        if (type !== 'audio') return;
        const el = audioElement.current?.audioEl?.current;
        if (!el || el.ended) return;

        const justTyped = Date.now() - lastTypedAtRef.current < 1000;
        const inputHasFocus = document.activeElement === answerElement.current;

        if ((justTyped || inputHasFocus)) {
            if (lastAudioTimeRef.current > 0 && Math.abs(el.currentTime - lastAudioTimeRef.current) > 0.05) {
                el.currentTime = lastAudioTimeRef.current;
            }
            const p = el.play();
            if (p && typeof p.then === 'function') p.catch(() => {});
        }
    }, [type]);

    return (
        <Transition in={true} timeout={1000}>
          {state => (
            <FadeContainer $state={state} $duration={1000}>
              <Container fluid>
                        <Row>
                            <Col>
                                <RiddleText>
                                    {RiddleData.riddle}
                                </RiddleText>
                            </Col>
                        </Row>

                        <AddAudio type={type} audioFile={RiddleData.audioFile} />

                        {type === "sequence" &&
                            <AddSequenceButtons
                                type={type}
                                sequenceColors={RiddleData.sequenceColors}
                                correctSequence={RiddleData.correctSequence}
                            />
                        }

                        <Row>
                            <Col>
                                <ClueDiv>
                                    {showClueOption &&
                                        <SpookyButton variant="primary" onClick={handleShowClue}>
                                            Reveal Clue
                                        </SpookyButton>
                                    }

                                    <SpookyModal show={showClue} onHide={handleCloseClue} centered size="lg">
                                        <Modal.Header closeButton>
                                            <Modal.Title>Clue</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <div style={{ whiteSpace: 'pre-line' }}>
                                                {RiddleData.clue}
                                            </div>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <SpookyButton variant="secondary" onClick={handleCloseClue}>
                                                Close
                                            </SpookyButton>
                                        </Modal.Footer>
                                    </SpookyModal>
                                </ClueDiv>
                            </Col>
                        </Row>

                        {RiddleData.bonusText && (
                            <SpookyModal show={showBonus} onHide={handleCloseBonus} centered size="lg">
                                <Modal.Header closeButton>
                                    <Modal.Title>Bonus Hint</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div style={{ whiteSpace: 'pre-line', marginBottom: '1rem' }}>
                                        {RiddleData.bonusText}
                                    </div>

                                    {/* Show bonus answer input if a bonusAnswer is configured */}
                                    {(type === 'sequence' || (typeof RiddleData.bonusAnswer === 'string' && RiddleData.bonusAnswer.trim() !== '')) && (
                                      <SpookyInputGroup>
                                          <InputGroup.Text>Bonus Answer</InputGroup.Text>
                                          <SpookyFormControl
                                              ref={bonusElement}
                                              placeholder="Enter bonus answer"
                                              value={bonusAnswerText}
                                              onChange={(e) => {
                                                  const v = e.target.value;
                                                  setBonusAnswerText(v);
                                                  checkBonusAnswer(v);
                                              }}
                                              readOnly={readOnlyBonus}
                                          />
                                      </SpookyInputGroup>
                                    )}
                                </Modal.Body>
                                <Modal.Footer>
                                    <SpookyButton variant="secondary" onClick={handleCloseBonus}>
                                        Close
                                    </SpookyButton>
                                </Modal.Footer>
                            </SpookyModal>
                        )}

                        {sequenceError && failureMessage && (
                            <FailureOverlay $fadeOut={fadeOut}>
                                <FailureMessage>
                                    {failureMessage}
                                </FailureMessage>
                            </FailureOverlay>
                        )}

                        {type !== "sequence" && (
                            <Row>
                                <Col>
                                    <SpookyInputGroup>
                                        <InputGroup.Text>Answer</InputGroup.Text>
                                        <SpookyFormControl
                                            ref={answerElement}
                                            placeholder="Enter your answer"
                                            value={answerText}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                lastTypedAtRef.current = Date.now(); // mark typing
                                                setAnswerText(v);
                                                checkAnswer(v);
                                                keepAudioPlaying(); // resume if browser paused it
                                            }}
                                            onFocus={() => {
                                                keepAudioPlaying(); // resume when focusing the input
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    lastTypedAtRef.current = Date.now();
                                                    checkAnswer(answerText);
                                                    keepAudioPlaying();
                                                }
                                            }}
                                            readOnly={readOnlyAnswer}
                                        />
                                    </SpookyInputGroup>
                                </Col>
                            </Row>
                        )}
                    </Container>
                </FadeContainer>
            )}
        </Transition>
    );
}, (prevProps, nextProps) => {
    // Only re-render if the riddle data actually changed
    return JSON.stringify(prevProps.RiddleData) === JSON.stringify(nextProps.RiddleData);
});

export default MemoizedRiddle;
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const pulseGlow = keyframes`
  0% { 
    transform: scale(1);
    text-shadow: 0 0 20px #8b0000, 0 0 40px #ff6b1a, 0 0 60px #8b0000;
  }
  50% { 
    transform: scale(1.1);
    text-shadow: 0 0 30px #8b0000, 0 0 60px #ff6b1a, 0 0 80px #8b0000;
  }
  100% { 
    transform: scale(1);
    text-shadow: 0 0 20px #8b0000, 0 0 40px #ff6b1a, 0 0 60px #8b0000;
  }
`;

const fadeInOut = keyframes`
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
`;

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

const CountdownWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  text-align: center;
`;

const CountdownNumber = styled.div`
  font-family: 'Creepster', cursive;
  font-size: 8rem;
  color: #ff6b1a;
  animation: ${pulseGlow} 2s ease-in-out;
  user-select: none;
  margin-bottom: 2rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 6rem;
    letter-spacing: 2px;
  }
`;

const CountdownText = styled.div`
  font-family: 'Creepster', cursive;
  font-size: 2rem;
  color: #ff6b1a;
  text-shadow: 
    0 0 12px #8b0000, 
    0 0 24px #ff6b1a, 
    0 0 36px #8b0000,
    2px 2px 4px rgba(139, 0, 0, 0.8);
  animation: ${spookyFlicker} 1.3s infinite;
  margin-bottom: 1rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    letter-spacing: 2px;
  }
`;

const SpookyMessage = styled.div`
  font-family: 'Creepster', cursive;
  font-size: 1.4rem;
  color: #8b0000;
  font-weight: bold;
  text-shadow: 
    0 0 8px #ff6b1a,
    0 0 16px #ff6b1a,
    2px 2px 4px rgba(255, 107, 26, 0.6);
  animation: ${spookyFlicker} 1.5s infinite;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
  letter-spacing: 1px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    height: 1.5rem;
  }
`;

const SpookyCountdown = ({ onComplete }) => {
  const [count, setCount] = useState(10);
  const [showMessage, setShowMessage] = useState(false);

  const spookyMessages = [
    "The darkness awakens...",
    "Ancient spirits stir...",
    "Shadows grow longer...",
    "The manor comes alive...",
    "Whispers in the walls...",
    "Something watches you...",
    "The hunt begins...",
    "Evil stirs within...",
    "Beware what lurks ahead...",
    "Your fate awaits..."
  ];

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
        setShowMessage(true);
        
        // Hide message after 3 seconds to match the slower pace
        setTimeout(() => setShowMessage(false), 3000);
      }, 4000); // Changed from 1000ms to 4000ms (4 seconds)

      return () => clearTimeout(timer);
    } else {
      // Countdown complete, start the riddles - increased delay to 3 seconds
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  }, [count, onComplete]);

  return (
    <CountdownWrapper>
      {count > 0 ? (
        <>
          <CountdownNumber key={count}>
            {count}
          </CountdownNumber>
          <CountdownText>
            Prepare yourself...
          </CountdownText>
          <SpookyMessage show={showMessage}>
            {showMessage ? spookyMessages[10 - count] : ''}
          </SpookyMessage>
        </>
      ) : (
        <CountdownText>
          Let the nightmare begin...
        </CountdownText>
      )}
    </CountdownWrapper>
  );
};

export default SpookyCountdown;
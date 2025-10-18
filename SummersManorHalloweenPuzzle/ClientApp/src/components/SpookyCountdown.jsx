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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-size: 8rem;
  color: #ff6b1a;
  animation: ${pulseGlow} 2s ease-in-out;
  user-select: none;
  margin-bottom: 2rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  font-weight: bold;
  text-shadow: 0 0 20px #8b0000, 0 0 40px #ff6b1a, 0 0 60px #8b0000;
  
  @media (max-width: 768px) {
    font-size: 6rem;
    letter-spacing: 2px;
  }
`;

const CountdownText = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-size: 1.8rem;
  color: #8b0000;
  font-weight: bold;
  animation: ${spookyFlicker} 1.5s infinite;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 0 8px #000, 0 0 16px #8b0000;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    height: 1.5rem;
  }
`;

const SpookyCountdown = ({ onComplete }) => {
  const [count, setCount] = useState(10);

  // Use only 5 messages. First one will show for counts 1 and 2, etc.
  const spookyMessages = [
    "The darkness awakens...",      // shows for 1-2
    "Shadows grow longer...",       // shows for 3-4
    "Whispers in the walls...",     // shows for 5-6
    "Beware what lurks ahead...",   // shows for 7-8
    "Your fate awaits..."           // shows for 9-10
  ];

  // Map two numbers per message (1-2 => index 0, 3-4 => index 1, ..., 9-10 => index 4)
  const messageIndex = Math.max(0, Math.min(4, Math.floor((count - 1) / 2)));
  const currentMessage = spookyMessages[messageIndex];

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => onComplete(), 1000);
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
          <SpookyMessage show={true}>
            {currentMessage}
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
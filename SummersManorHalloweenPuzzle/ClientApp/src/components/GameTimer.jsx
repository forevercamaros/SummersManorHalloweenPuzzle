import React, { useState, useEffect } from 'react';
import { ProgressBar } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import styled, { keyframes } from 'styled-components';
import { formatTimeString } from '../utils/timeUtils';

const spookyFlicker = keyframes`
  0%, 100% { opacity: 1; }
  10% { opacity: 0.8; }
  20% { opacity: 0.9; }
  30% { opacity: 0.7; }
  40% { opacity: 0.85; }
  50% { opacity: 0.75; }
  60% { opacity: 0.9; }
  70% { opacity: 0.8; }
  80% { opacity: 0.95; }
  90% { opacity: 0.85; }
`;

const evilPulse = keyframes`
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

const TransparentBottomTimer = styled.div`
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  z-index: 100;
  background-color: transparent;
  width: 100vw;
  backdrop-filter: blur(2px);
  padding: 10px;
  box-sizing: border-box;
`;

const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 10px;
  margin: 0;
  box-sizing: border-box;
`;

const TimerColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  min-width: 200px;
  flex: 1;
`;

const GroupNameColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  min-width: 200px;
  flex: 1;
`;

const SpookyGroupNameDiv = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  color: #ff6b1a;
  font-size: 1.3rem;
  text-shadow: 
    0 0 12px #8b0000, 
    0 0 24px #ff6b1a, 
    0 0 36px #8b0000,
    2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: ${spookyFlicker} 3s infinite;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  padding: 8px 12px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    letter-spacing: 1px;
    padding: 6px 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    letter-spacing: 0.5px;
    padding: 4px 6px;
  }
`;

const SpookyTimerText = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  color: #ff6b1a;
  font-size: 1rem;
  text-shadow: 
    0 0 8px #8b0000, 
    0 0 16px #ff6b1a;
  letter-spacing: 0.5px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    letter-spacing: 0px;
  }
`;

const SpookyProgressWrapper = styled.div`
  width: 100%;
  max-width: 300px;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  border: 2px solid #ff6b1a;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  animation: ${props => props.isLowTime ? evilPulse : 'none'} 1s infinite;
  
  @media (max-width: 768px) {
    max-width: 250px;
  }
`;

const StyledProgressBar = styled(ProgressBar)`
  height: 20px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  border-radius: 0;
  
  .progress-bar {
    background: ${props => {
      if (props.percentage > 70) return 'linear-gradient(90deg, #00ff00 0%, #32ff32 100%)';
      if (props.percentage > 30) return 'linear-gradient(90deg, #ffff00 0%, #ffcc00 100%)';
      return 'linear-gradient(90deg, #ff0000 0%, #cc0000 100%)';
    }};
    box-shadow: 
      inset 0 2px 4px rgba(255, 255, 255, 0.3),
      inset 0 -2px 4px rgba(0, 0, 0, 0.3),
      0 0 10px ${props => {
        if (props.percentage > 70) return '#00ff00';
        if (props.percentage > 30) return '#ffff00';
        return '#ff0000';
      }};
    border-radius: 0;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      animation: shine 2s infinite;
    }
  }
  
  @keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const SpookyButton = styled(Button)`
  background: linear-gradient(135deg, #8b0000 0%, #ff6b1a 100%) !important;
  border: 2px solid #ff6b1a !important;
  color: #dedede !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif !important;
  font-size: 1.2rem !important;
  text-shadow: 0 0 8px #8b0000 !important;
  letter-spacing: 2px !important;
  padding: 10px 20px !important;
  text-transform: uppercase !important;
  font-weight: bold !important;
  transition: all 0.3s ease !important;
  animation: ${spookyFlicker} 3s infinite !important;
  
  &:hover {
    background: linear-gradient(135deg, #ff6b1a 0%, #8b0000 100%) !important;
    border-color: #ff6b1a !important;
    color: #fff !important;
    box-shadow: 
      0 0 20px rgba(255, 107, 26, 0.5),
      0 0 40px rgba(139, 0, 0, 0.3) !important;
    transform: translateY(-2px) !important;
  }
`;

export default function GameTimer({
    gameCompleted,
    timerKey,
    isPlaying,
    timerDuration,
    initialRemainingTime,
    groupName,
    onComplete,
    onTimeUpdate,
    onViewResults
}) {
    const [remainingTime, setRemainingTime] = useState(initialRemainingTime);
    const [isRunning, setIsRunning] = useState(isPlaying);

    // Calculate percentage for progress bar (inverted so it decreases)
    const percentage = (remainingTime / timerDuration) * 100;
    const isLowTime = percentage < 20;

    useEffect(() => {
        setRemainingTime(initialRemainingTime);
        setIsRunning(isPlaying);
    }, [initialRemainingTime, isPlaying, timerKey]);

    useEffect(() => {
        let interval = null;
        
        if (isRunning && remainingTime > 0) {
            interval = setInterval(() => {
                setRemainingTime(prevTime => {
                    const newTime = prevTime - 1;
                    onTimeUpdate(newTime);
                    
                    if (newTime <= 0) {
                        setIsRunning(false);
                        onComplete();
                        return 0;
                    }
                    
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, remainingTime, onComplete, onTimeUpdate]);

    return (
        <TransparentBottomTimer>
            <CenteredContainer>
                <TimerColumn>
                    {gameCompleted ? (
                        <SpookyButton size="lg" variant="secondary" onClick={onViewResults}>
                            View Results
                        </SpookyButton>
                    ) : (
                        <>
                            <SpookyTimerText>
                                {remainingTime === 0 
                                    ? "Time's Up!" 
                                    : formatTimeString(remainingTime, false)
                                }
                            </SpookyTimerText>
                            <SpookyProgressWrapper isLowTime={isLowTime}>
                                <StyledProgressBar 
                                    now={percentage} 
                                    percentage={percentage}
                                />
                            </SpookyProgressWrapper>
                        </>
                    )}
                </TimerColumn>
                <GroupNameColumn>
                    <SpookyGroupNameDiv>
                        {groupName}
                    </SpookyGroupNameDiv>
                </GroupNameColumn>
            </CenteredContainer>
        </TransparentBottomTimer>
    );
}
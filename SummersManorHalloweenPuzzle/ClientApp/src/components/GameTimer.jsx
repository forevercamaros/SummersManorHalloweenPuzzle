import React from 'react';
import { CountdownCircleTimer } from "react-countdown-circle-timer";
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
  align-items: center;
  justify-content: center;
  height: 80px;
`;

const GroupNameColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  min-width: 200px;
`;

const SpookyGroupNameDiv = styled.div`
  font-family: 'Creepster', cursive;
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
  font-family: 'Creepster', cursive;
  color: #ff6b1a;
  font-size: 0.8rem;
  text-shadow: 
    0 0 8px #8b0000, 
    0 0 16px #ff6b1a;
  letter-spacing: 0.5px;
  text-align: center;
  font-weight: bold;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    letter-spacing: 0px;
  }
`;

const SpookyButton = styled(Button)`
  background: linear-gradient(135deg, #8b0000 0%, #ff6b1a 100%) !important;
  border: 2px solid #ff6b1a !important;
  color: #dedede !important;
  font-family: 'Creepster', cursive !important;
  font-size: 1.2rem !important;
  text-shadow: 0 0 8px #8b0000 !important;
  letter-spacing: 2px !important;
  padding: 10px 20px !important;
  text-transform: uppercase !important;
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
    const renderTime = ({ remainingTime }) => {
        onTimeUpdate(remainingTime);
        if (remainingTime === 0) {
            return <SpookyTimerText>Time's Up!</SpookyTimerText>;
        }

        return (
            <SpookyTimerText>
                {formatTimeString(remainingTime, false)}
            </SpookyTimerText>
        );
    };

    return (
        <TransparentBottomTimer>
            <CenteredContainer>
                <TimerColumn>
                    {gameCompleted
                        ? <SpookyButton size="lg" variant="secondary" onClick={onViewResults}>
                            View Results
                        </SpookyButton>
                        : <CountdownCircleTimer
                            key={timerKey}
                            strokeWidth={6}
                            isPlaying={isPlaying}
                            size={70}
                            duration={timerDuration}
                            initialRemainingTime={initialRemainingTime}
                            colors={[
                                ['#ff6b1a', 0.6],
                                ['#8b0000', 0.4]
                            ]}
                            onComplete={onComplete}
                        >
                            {renderTime}
                        </CountdownCircleTimer>
                    }
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
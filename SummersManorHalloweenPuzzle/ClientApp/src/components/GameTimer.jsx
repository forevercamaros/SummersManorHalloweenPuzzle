import React from 'react';
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Button from 'react-bootstrap/Button';
import { BottomTimer, GroupNameDiv } from './styles/HomeStyles';
import { formatTimeString } from '../utils/timeUtils';

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
            return <div>0 Time</div>;
        }

        return (
            <div>
                {formatTimeString(remainingTime, false)}
            </div>
        );
    };

    return (
        <BottomTimer>
            <div className="container">
                <div className="row">
                    <div className="col">
                        {gameCompleted
                            ? <Button size="lg" variant="secondary" onClick={onViewResults}>
                                View Results
                            </Button>
                            : <CountdownCircleTimer
                                key={timerKey}
                                strokeWidth={5}
                                isPlaying={isPlaying}
                                size={70}
                                duration={timerDuration}
                                initialRemainingTime={initialRemainingTime}
                                colors={[
                                    ['#00FF00', 0.5],
                                    ['#FF0000', 0.5]
                                ]}
                                onComplete={onComplete}
                            >
                                {renderTime}
                            </CountdownCircleTimer>
                        }
                    </div>
                    <div className="col">
                        <GroupNameDiv>
                            {groupName}
                        </GroupNameDiv>
                    </div>
                </div>
            </div>
        </BottomTimer>
    );
}
import React, { Component } from 'react';
import Riddle from './Riddle';
import riddleData from './riddle-data';

export default function Home() {
    const [riddle, setRiddle] = React.useState(riddleData.riddles["riddle1"]);
    return (
        <Riddle RiddleData={riddle} />
    );
}

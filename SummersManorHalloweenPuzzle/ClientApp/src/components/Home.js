import React, { Component } from 'react';
import Riddle from './Riddle';
import riddleData from './riddle-data';

var riddleKeys = Object.keys(riddleData.riddles);
var startIndex = 1;//Math.floor(Math.random() * riddleKeys.length);

export default function Home() {    
    var currentIndex = startIndex;
    const [riddle, setRiddle] = React.useState(riddleData.riddles[riddleKeys[startIndex]]);
    function onSolved() {
        currentIndex++;
        if (currentIndex + 1 > riddleKeys.length) {
            currentIndex = 0;
        }
        if (currentIndex === startIndex) {
            //TODO Write Code to start final puzzle
        } else {
            setRiddle(riddleData.riddles[riddleKeys[currentIndex]]);
        }
    }
    return (
        <Riddle RiddleData={riddle} onSolved = {onSolved} />
    );
}

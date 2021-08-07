import React from 'react';
import ReactCodeInput from "react-code-input";
import styled from 'styled-components';
import ReactPinField from "react-pin-field"

const Container = styled.div``;
const RiddleText = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  color: white;
`;

export default function Riddle(props) {
    var onSolved = props.onSolved;
    var answer = props.RiddleData.answer;
    function AddAudio(props) {
        if (props.type === "audio") {
            return (
                ""//TODO ADD AUDIO CODE
            )
        } else {
            return ("");
        }
    }

    function AddClue(props) {
        if (props.clueText !== "") {
            return (
                ""//TODO CLUE CODE
            )
        } else {
            return ("");
        }
    }

    function AddBonus(props) {
        if (props.bonusText !== "") {
            return (
                ""//TODO CLUE CODE
            )
        } else {
            return ("");
        }
    }

    function TextChange(value) {
        if (value.toLowerCase() === answer.toLowerCase()) {
            onSolved();
        }
    }
    return (
        <Container>
            <RiddleText>{props.RiddleData.riddle}</RiddleText>
            <AddAudio type={props.RiddleData.type} />
            <AddClue clueText={props.RiddleData.clueText} />
            <AddBonus bonusText={props.RiddleData.bonusText} bonusAnswer={props.RiddleData.bonusAnswer} />
            <ReactCodeInput type='text' fields={props.RiddleData.answer.length} onChange={TextChange} />
        </Container>        
    )
}
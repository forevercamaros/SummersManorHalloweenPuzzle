import React from 'react';
import ReactCodeInput from "react-code-input";
import styled from 'styled-components';

const Container = styled.div``;
const RiddleText = styled.div`
  color: white;
`;

export default function Riddle(props) {
    return (
        <Container>
            <RiddleText>{props.RiddleData.riddle}</RiddleText>
            <ReactCodeInput type='text' fields={props.RiddleData.answer.length} />
        </Container>        
    )
}
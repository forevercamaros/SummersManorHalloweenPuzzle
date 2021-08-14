import React, { useState } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components';
import { Container, Row, Col } from 'react-grid-system';

const LoginText = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  color: white;
`;


export default function GroupLogin({ riddleCount, countDownTime, onClick }) {
    const [groupName, setGroupName] = useState("");    
    return (
        <Container fluid>
            <Row>
                <Col>
                    <LoginText>
                        Welcome to the Summers Manor Challenge. You will be presented with a series of {riddleCount} riddles that you must solve. Once you solve all the riddles,
                        you will be presented with a final puzzle. You will have {countDownTime} minutes to complete the Challenge. Good Luck!!
                    </LoginText>
                    <Form.Group as={Col} controlId="formGridGroupName">
                        <Form.Control type="text" placeholder="Enter group name" onChange={e => setGroupName(e.target.value) } />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="primary" type="submit" onClick={e => onClick(groupName)}>
                        Submit
                    </Button>
                </Col>
            </Row>
        </Container>        
    );
}

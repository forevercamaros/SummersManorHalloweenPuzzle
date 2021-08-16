import React, { useState } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import houseImage from '../haunted-house.jpg';

const LoginText = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  color: white;
`;

const HouseImageDiv = styled.div`
  margin: 8px;  
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
                        <Form.Control type="text" placeholder="Enter group name" onChange={e => setGroupName(e.target.value)} onKeyPress={(e) => { if (e.charCode === 13) { onClick(groupName) } }} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="secondary" type="submit" onClick={e => onClick(groupName)}>
                        Submit
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <HouseImageDiv>
                        <img src={houseImage} className="img-fluid" />
                    </HouseImageDiv>
                </Col>
            </Row>
        </Container>        
    );
}

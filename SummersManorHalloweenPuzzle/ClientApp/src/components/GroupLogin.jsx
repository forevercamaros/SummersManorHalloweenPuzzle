import React, { useState } from 'react';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import houseImage from '../images/haunted-house.jpg';

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
    const [duplicateGroup, setDuplicateGroup] = useState(0);
    const checkGroupName = () => {
        fetch(`GroupExists?groupName=${encodeURIComponent(groupName)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(returnJson => {
                if (returnJson.groupExists === true) {
                    setDuplicateGroup(true);
                } else {
                    onClick(groupName);
                }
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    };
    return (
        <Container fluid>
            <Row>
                <Col>
                    <LoginText>
                        Welcome to the Summers Manor Challenge. You will be presented with a series of {riddleCount} riddles that you must solve. Once you solve all the riddles,
                        you will be presented with a final puzzle. You will have {countDownTime} minutes to complete the Challenge.
                    </LoginText>
                    <Form.Group as={Col} controlId="formGridGroupName">
                        <Form.Control isInvalid={duplicateGroup} type="text" placeholder="Enter group name" onChange={e => setGroupName(e.target.value)} onKeyPress={(e) => { if (duplicateGroup) { setDuplicateGroup(false); } if (e.charCode === 13) { checkGroupName() } }} />
                        <Form.Control.Feedback type="invalid">
                            Duplicate Group Name. Please Choose Another.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="secondary" type="submit" onClick={e => checkGroupName()}>
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

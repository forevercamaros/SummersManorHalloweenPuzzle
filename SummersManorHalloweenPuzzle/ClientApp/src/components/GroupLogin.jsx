import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import backgroundImage from '../images/haunted-house.jpg';

const LoginText = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  color: white;
`;

const BackgroundImageDiv = styled.div`
  margin: 8px;  
`;

export default function GroupLogin({ riddleCount, countDownTime, onClick }) {
    const [groupName, setGroupName] = useState("");
    const [duplicateGroup, setDuplicateGroup] = useState(0);
    const navigate = useNavigate();

    const checkGroupName = () => {
        // Check if user typed "settings" to navigate to settings page
        if (groupName.toLowerCase().trim() === "settings") {
            navigate('/settings');
            return;
        }

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

    const handleInputChange = (e) => {
        const value = e.target.value;
        setGroupName(value);
        // Removed automatic navigation - only update state
    };

    const handleKeyPress = (e) => {
        if (duplicateGroup) { 
            setDuplicateGroup(false); 
        } 
        if (e.charCode === 13) { 
            checkGroupName();
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <LoginText>
                        Welcome to the House of Summers Challenge. You will be presented with a series of {riddleCount} riddles that you must solve. You will have {countDownTime} minutes to complete the Challenge. You may need your phone's flashlight to solve some clues. Each clue will have an optional hint that will show up after no more than 3 minutes.
                    </LoginText>
                    <Form.Group as={Col} controlId="formGridGroupName">
                        <Form.Control 
                            isInvalid={duplicateGroup} 
                            type="text" 
                            placeholder="Enter group name" 
                            value={groupName}
                            onChange={handleInputChange} 
                            onKeyPress={handleKeyPress} 
                        />
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
                    <BackgroundImageDiv>
                        <img src={backgroundImage} className="img-fluid" />
                    </BackgroundImageDiv>
                </Col>
            </Row>
        </Container>        
    );
}

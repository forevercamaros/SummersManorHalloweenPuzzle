import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styled, { keyframes } from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import backgroundImage from '../images/haunted-house.jpg';

const spookyFlicker = keyframes`
  0%, 100% { opacity: 1; }
  10% { opacity: 0.7; }
  20% { opacity: 0.9; }
  30% { opacity: 0.5; }
  40% { opacity: 0.8; }
  50% { opacity: 0.6; }
  60% { opacity: 0.85; }
  70% { opacity: 0.7; }
  80% { opacity: 0.95; }
  90% { opacity: 0.8; }
`;

const LoginText = styled.div`
  margin: 8px;
  border: 2px solid #ff6b1a;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  color: #dedede;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.3) 100%);
  padding: 20px;
  font-family: 'Creepster', cursive;
  font-size: 1.1rem;
  text-shadow: 0 0 8px #8b0000, 0 0 16px #ff6b1a;
  animation: ${spookyFlicker} 3s infinite;
  letter-spacing: 1px;
  line-height: 1.4;
  box-shadow: 
    0 0 20px rgba(255, 107, 26, 0.3),
    inset 0 0 20px rgba(139, 0, 0, 0.2);
`;

const SpookyFormControl = styled(Form.Control)`
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.2) 100%) !important;
  border: 2px solid #ff6b1a !important;
  color: #ff6b1a !important;
  font-family: 'Creepster', cursive !important;
  font-size: 1.2rem !important;
  text-shadow: 0 0 8px #8b0000 !important;
  letter-spacing: 2px !important;
  
  &::placeholder {
    color: rgba(255, 107, 26, 0.6) !important;
    font-family: 'Creepster', cursive !important;
  }
  
  &:focus {
    background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.3) 100%) !important;
    border-color: #ff6b1a !important;
    box-shadow: 
      0 0 0 0.2rem rgba(255, 107, 26, 0.25),
      0 0 20px rgba(255, 107, 26, 0.5) !important;
    color: #ff6b1a !important;
  }
  
  &.is-invalid {
    border-color: #dc3545 !important;
    box-shadow: 0 0 20px rgba(220, 53, 69, 0.5) !important;
  }
`;

const SpookyButton = styled(Button)`
  background: linear-gradient(135deg, #8b0000 0%, #ff6b1a 100%) !important;
  border: 2px solid #ff6b1a !important;
  color: #dedede !important;
  font-family: 'Creepster', cursive !important;
  font-size: 1.3rem !important;
  text-shadow: 0 0 8px #8b0000 !important;
  letter-spacing: 2px !important;
  padding: 12px 24px !important;
  text-transform: uppercase !important;
  transition: all 0.3s ease !important;
  
  &:hover {
    background: linear-gradient(135deg, #ff6b1a 0%, #8b0000 100%) !important;
    border-color: #ff6b1a !important;
    color: #fff !important;
    box-shadow: 
      0 0 20px rgba(255, 107, 26, 0.5),
      0 0 40px rgba(139, 0, 0, 0.3) !important;
    transform: translateY(-2px) !important;
  }
  
  &:focus {
    box-shadow: 
      0 0 0 0.2rem rgba(255, 107, 26, 0.25),
      0 0 20px rgba(255, 107, 26, 0.5) !important;
  }
`;

const BackgroundImageDiv = styled.div`
  margin: 8px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #ff6b1a;
  box-shadow: 0 0 20px rgba(255, 107, 26, 0.3);
`;

const SpookyFeedback = styled(Form.Control.Feedback)`
  font-family: 'Creepster', cursive !important;
  font-size: 1rem !important;
  color: #dc3545 !important;
  text-shadow: 0 0 8px #dc3545 !important;
  letter-spacing: 1px !important;
  animation: ${spookyFlicker} 1s infinite !important;
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
                        <SpookyFormControl
                            isInvalid={duplicateGroup} 
                            type="text" 
                            placeholder="Enter group name" 
                            value={groupName}
                            onChange={handleInputChange} 
                            onKeyPress={handleKeyPress} 
                        />
                        <SpookyFeedback type="invalid">
                            Duplicate Group Name. Please Choose Another.
                        </SpookyFeedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <SpookyButton variant="secondary" type="submit" onClick={e => checkGroupName()}>
                        Submit
                    </SpookyButton>
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

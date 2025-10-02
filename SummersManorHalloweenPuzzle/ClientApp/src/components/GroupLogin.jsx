import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import styled, { keyframes } from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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

const MobileContainer = styled(Container)`
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for modern browsers */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    min-height: calc(100vh - env(keyboard-inset-height, 0px)); /* Account for mobile keyboard */
    min-height: calc(100dvh - env(keyboard-inset-height, 0px));
    position: relative;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  
  @media (max-width: 768px) {
    justify-content: flex-start;
    padding-top: 2rem;
  }
`;

const FormWrapper = styled.div`
  width: 100%;
  position: sticky;
  bottom: 0;
  background: transparent;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  
  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 1rem;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0.95) 100%);
    backdrop-filter: blur(10px);
  }
`;

const LoginText = styled.div`
  margin: 8px 0;
  border: 2px solid #ff6b1a;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  color: #dedede;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.3) 100%);
  padding: 1rem;
  font-family: 'Creepster', cursive, 'Times New Roman', serif !important;
  text-shadow: 0 0 8px #8b0000, 0 0 16px #ff6b1a;
  animation: ${spookyFlicker} 3s infinite;
  letter-spacing: 1px;
  line-height: 1.3;
  box-shadow: 
    0 0 20px rgba(255, 107, 26, 0.3),
    inset 0 0 20px rgba(139, 0, 0, 0.2);
  
  font-size: 1.2rem !important;
  
  @media (max-width: 768px) {
    font-size: 1.1rem !important;
    padding: 0.75rem;
    margin: 4px 0;
    line-height: 1.2;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem !important;
    padding: 0.5rem;
    letter-spacing: 0.5px;
  }
`;

const FormSection = styled.div`
  width: 100%;
  margin: 1rem 0;
  
  @media (max-width: 768px) {
    margin: 0.5rem 0;
  }
`;

const SpookyFormControl = styled(Form.Control)`
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.2) 100%) !important;
  border: 2px solid #ff6b1a !important;
  color: #ff6b1a !important;
  font-family: 'Creepster', cursive !important;
  font-size: 1.1rem !important;
  text-shadow: 0 0 8px #8b0000 !important;
  letter-spacing: 2px !important;
  padding: 0.75rem !important;
  
  @media (max-width: 768px) {
    font-size: 1rem !important;
    padding: 0.6rem !important;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem !important;
    padding: 0.5rem !important;
  }
  
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
  font-size: 1.2rem !important;
  text-shadow: 0 0 8px #8b0000 !important;
  letter-spacing: 2px !important;
  padding: 12px 24px !important;
  text-transform: uppercase !important;
  transition: all 0.3s ease !important;
  width: 100% !important;
  
  @media (max-width: 768px) {
    font-size: 1.1rem !important;
    padding: 10px 20px !important;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem !important;
    padding: 8px 16px !important;
  }
  
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

const SpookyFeedback = styled(Form.Control.Feedback)`
  font-family: 'Creepster', cursive !important;
  font-size: 0.9rem !important;
  color: #dc3545 !important;
  text-shadow: 0 0 8px #dc3545 !important;
  letter-spacing: 1px !important;
  animation: ${spookyFlicker} 1s infinite !important;
  
  @media (max-width: 768px) {
    font-size: 0.8rem !important;
  }
`;

export default function GroupLogin({ riddleCount, countDownTime, onClick }) {
    const [groupName, setGroupName] = useState("");
    const [duplicateGroup, setDuplicateGroup] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
    const navigate = useNavigate();

    // Handle viewport height changes for mobile keyboard
    useEffect(() => {
        const handleResize = () => {
            // Use the smaller of window.innerHeight and visualViewport.height
            const height = window.visualViewport 
                ? Math.min(window.innerHeight, window.visualViewport.height)
                : window.innerHeight;
            setViewportHeight(height);
        };

        // Listen to both resize and visual viewport changes
        window.addEventListener('resize', handleResize);
        
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        }

        // Initial setup
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, []);

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
        <MobileContainer 
            fluid 
            style={{ 
                height: window.innerWidth <= 768 ? `${viewportHeight}px` : '100vh',
                maxHeight: window.innerWidth <= 768 ? `${viewportHeight}px` : '100vh'
            }}
        >
            <ContentWrapper>
                <Row className="w-100">
                    <Col xs={12}>
                        <LoginText>
                            Welcome to the House of Summers Challenge. You will be presented with a series of {riddleCount} riddles that you must solve. You will have {countDownTime} minutes to complete the Challenge. You may need your phone's flashlight to solve some clues. Each clue will have an optional hint that will show up after no more than 3 minutes.
                        </LoginText>
                    </Col>
                </Row>
            </ContentWrapper>
            
            <FormWrapper>
                <Row className="w-100">
                    <Col xs={12}>
                        <FormSection>
                            <Form.Group controlId="formGridGroupName">
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
                        </FormSection>
                    </Col>
                </Row>
                <Row className="w-100">
                    <Col xs={12}>
                        <SpookyButton variant="secondary" type="submit" onClick={e => checkGroupName()}>
                            Submit
                        </SpookyButton>
                    </Col>
                </Row>
            </FormWrapper>
        </MobileContainer>        
    );
}

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledContainer = styled(Container)`
  margin-top: 20px;
  background: linear-gradient(135deg, #0a0a0a 80%, #8b0000 100%);
  min-height: 100vh;
  color: white;
  padding: 20px;
`;

const StyledCard = styled(Card)`
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #ff6b1a;
  margin-bottom: 20px;
  
  .card-header {
    background: #8b0000;
    color: #ff6b1a;
    font-weight: bold;
  }
  
  .card-body {
    color: white;
  }
`;

const SpookyTitle = styled.h1`
  font-family: 'Creepster', cursive;
  color: #ff6b1a;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 0 0 12px #8b0000, 0 0 24px #ff6b1a;
  animation: flicker 1.3s infinite;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #ff6b1a;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:hover {
    color: #dedede;
    text-shadow: 0 0 8px #ff6b1a;
    text-decoration: none;
  }
`;

const DangerButton = styled(Button)`
  background: #8b0000 !important;
  border-color: #ff0000 !important;
  color: white !important;
  font-weight: bold;
  
  &:hover {
    background: #ff0000 !important;
    border-color: #ff0000 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 0, 0, 0.3);
  }
`;

const StyledModal = styled(Modal)`
  .modal-content {
    background: linear-gradient(135deg, #0a0a0a 80%, #8b0000 100%);
    border: 1px solid #ff6b1a;
    color: white;
  }
  
  .modal-header {
    border-bottom: 1px solid #ff6b1a;
    
    .modal-title {
      color: #ff6b1a;
    }
    
    .btn-close {
      filter: invert(1);
    }
  }
  
  .modal-footer {
    border-top: 1px solid #ff6b1a;
  }
`;

const SettingsItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
  }
  
  h5 {
    color: #ff6b1a;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #ccc;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
`;

export default function Settings() {
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
    };

    const handleResetLocalStorage = () => {
        setShowConfirmModal(true);
    };

    const confirmResetLocalStorage = () => {
        try {
            // Clear all localStorage data
            localStorage.clear();
            
            // Also clear sessionStorage if needed
            sessionStorage.clear();
            
            setShowConfirmModal(false);
            showAlert('success', 'All local storage data has been cleared successfully!');
            
            // Optional: Reload the page after a delay to reset the application state
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            console.error('Error clearing local storage:', error);
            showAlert('danger', 'Failed to clear local storage data.');
            setShowConfirmModal(false);
        }
    };

    const getLocalStorageInfo = () => {
        const keys = Object.keys(localStorage);
        return {
            count: keys.length,
            keys: keys,
            size: JSON.stringify(localStorage).length
        };
    };

    const storageInfo = getLocalStorageInfo();

    return (
        <StyledContainer fluid>
            <SpookyTitle>Settings</SpookyTitle>
            
            {alert.show && (
                <Alert variant={alert.type} className="mb-3">
                    {alert.message}
                </Alert>
            )}

            <Row>
                <Col md={8} className="mx-auto">
                    <StyledCard>
                        <Card.Header>
                            <h4 className="mb-0">Application Settings</h4>
                        </Card.Header>
                        <Card.Body>
                            <SettingsItem>
                                <h5>Edit Riddle Data</h5>
                                <p>Manage and modify the riddles used in the Halloween puzzle game.</p>
                                <StyledLink to="/editriddledata">
                                    <Button variant="warning" size="lg">
                                        &#x1F383; Edit Riddle Data
                                    </Button>
                                </StyledLink>
                            </SettingsItem>

                            <SettingsItem>
                                <h5>Reset Game Data</h5>
                                <p>
                                    Clear all game progress, settings, and cached data from your browser. 
                                    This will reset your game to its initial state.
                                </p>
                                <p className="text-warning">
                                    <strong>Current Storage:</strong> {storageInfo.count} items 
                                    ({Math.round(storageInfo.size / 1024)} KB)
                                </p>
                                {storageInfo.count > 0 && (
                                    <div className="mb-3">
                                        <small className="text-muted">
                                            Stored data: {storageInfo.keys.join(', ')}
                                        </small>
                                    </div>
                                )}
                                <DangerButton 
                                    size="lg" 
                                    onClick={handleResetLocalStorage}
                                    disabled={storageInfo.count === 0}
                                >
                                    &#x1F5D1;&#xFE0F; Reset All Data
                                </DangerButton>
                            </SettingsItem>

                            <SettingsItem>
                                <h5>Back to Game</h5>
                                <p>Return to the Halloween puzzle game.</p>
                                <StyledLink to="/">
                                    <Button variant="secondary" size="lg">
                                        &#x1F3E0; Back to Home
                                    </Button>
                                </StyledLink>
                            </SettingsItem>
                        </Card.Body>
                    </StyledCard>
                </Col>
            </Row>

            <StyledModal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>?? Confirm Data Reset</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to reset all game data?</p>
                    <p className="text-warning">
                        <strong>This action will:</strong>
                    </p>
                    <ul className="text-warning">
                        <li>Clear your current game progress</li>
                        <li>Reset your group name and timer</li>
                        <li>Remove all saved riddle states</li>
                        <li>Clear all cached game data</li>
                    </ul>
                    <p className="text-danger">
                        <strong>This action cannot be undone!</strong>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </Button>
                    <DangerButton onClick={confirmResetLocalStorage}>
                        Yes, Reset All Data
                    </DangerButton>
                </Modal.Footer>
            </StyledModal>
        </StyledContainer>
    );
}
import React, { useState, useEffect } from 'react';
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
    const [showClearGroupsModal, setShowClearGroupsModal] = useState(false);
    const [groupCount, setGroupCount] = useState(0);
    const [isLoadingGroupCount, setIsLoadingGroupCount] = useState(true);

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
    };

    const fetchGroupCount = async () => {
        try {
            setIsLoadingGroupCount(true);
            const response = await fetch('/GetGroupCount');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setGroupCount(data.count);
            } else {
                console.error('Failed to get group count:', data.error);
                setGroupCount(0);
            }
        } catch (error) {
            console.error('Error fetching group count:', error);
            setGroupCount(0);
        } finally {
            setIsLoadingGroupCount(false);
        }
    };

    useEffect(() => {
        fetchGroupCount();
    }, []);

    const handleResetLocalStorage = () => {
        setShowConfirmModal(true);
    };

    const confirmResetLocalStorage = async () => {
        try {
            // Get the current group name from localStorage before clearing
            const currentGroupName = localStorage.getItem('groupName');
            
            // Clear all localStorage data
            localStorage.clear();
            
            // Also clear sessionStorage if needed
            sessionStorage.clear();
            
            // Delete the group from MongoDB if it exists
            if (currentGroupName) {
                try {
                    const response = await fetch(`/DeleteGroup?groupName=${encodeURIComponent(currentGroupName)}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            console.log('Group deleted from database:', result.message);
                            // Refresh group count
                            await fetchGroupCount();
                        } else {
                            console.warn('Failed to delete group from database:', result.error);
                        }
                    }
                } catch (error) {
                    console.error('Error deleting group from database:', error);
                    // Don't show error to user - local storage clearing is more important
                }
            }
            
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

    const handleClearAllGroups = () => {
        setShowClearGroupsModal(true);
    };

    const confirmClearAllGroups = async () => {
        try {
            const response = await fetch('/ClearAllGroups', {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('success', result.message);
                // Refresh group count
                await fetchGroupCount();
            } else {
                showAlert('danger', `Failed to clear groups: ${result.error}`);
            }
        } catch (error) {
            console.error('Error clearing all groups:', error);
            showAlert('danger', 'Failed to clear groups from database.');
        } finally {
            setShowClearGroupsModal(false);
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
                                        Edit Riddle Data
                                    </Button>
                                </StyledLink>
                            </SettingsItem>

                            <SettingsItem>
                                <h5>Reset Game Data</h5>
                                <p>
                                    Clear all game progress, settings, and cached data from your browser. 
                                    This will also remove your group from the database.
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
                                    Reset All Data
                                </DangerButton>
                            </SettingsItem>

                            <SettingsItem>
                                <h5>Clear All Groups from Database</h5>
                                <p>
                                    Remove all group records from the MongoDB database. This will clear all 
                                    game results and group data permanently.
                                </p>
                                <p className="text-info">
                                    <strong>Groups in Database:</strong> {isLoadingGroupCount ? 'Loading...' : `${groupCount} groups`}
                                </p>
                                <div className="mb-3">
                                    <Button 
                                        variant="info" 
                                        size="sm" 
                                        onClick={fetchGroupCount}
                                        disabled={isLoadingGroupCount}
                                    >
                                        {isLoadingGroupCount ? 'Refreshing...' : 'Refresh Count'}
                                    </Button>
                                </div>
                                <DangerButton 
                                    size="lg" 
                                    onClick={handleClearAllGroups}
                                    disabled={groupCount === 0 || isLoadingGroupCount}
                                >
                                    Clear All Groups
                                </DangerButton>
                            </SettingsItem>

                            <SettingsItem>
                                <h5>Back to Game</h5>
                                <p>Return to the Halloween puzzle game.</p>
                                <StyledLink to="/">
                                    <Button variant="secondary" size="lg">
                                        Back to Home
                                    </Button>
                                </StyledLink>
                            </SettingsItem>
                        </Card.Body>
                    </StyledCard>
                </Col>
            </Row>

            <StyledModal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>WARNING: Confirm Data Reset</Modal.Title>
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
                        <li><strong>Delete your group from the database</strong></li>
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

            <StyledModal show={showClearGroupsModal} onHide={() => setShowClearGroupsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>DANGER: Clear All Groups</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to clear ALL groups from the database?</p>
                    <p className="text-warning">
                        <strong>This action will:</strong>
                    </p>
                    <ul className="text-warning">
                        <li>Delete all {groupCount} groups from the database</li>
                        <li>Remove all game results and leaderboards</li>
                        <li>Clear all group progress permanently</li>
                        <li>Reset the entire competition data</li>
                    </ul>
                    <p className="text-danger">
                        <strong>This action cannot be undone and affects all users!</strong>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClearGroupsModal(false)}>
                        Cancel
                    </Button>
                    <DangerButton onClick={confirmClearAllGroups}>
                        Yes, Clear All Groups
                    </DangerButton>
                </Modal.Footer>
            </StyledModal>
        </StyledContainer>
    );
}
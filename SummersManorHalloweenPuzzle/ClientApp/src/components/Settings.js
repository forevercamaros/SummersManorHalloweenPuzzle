import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ResultsTable from './ResultsTable';
import styled from 'styled-components';
import { SpookyModal, SpookyButton, DangerButton, SuccessButton, WarningButton } from './styles/SpookyModalStyles';

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

const StoredDataText = styled.small`
  color: #bbb;
  font-size: 0.85rem;
  font-style: italic;
`;

const SpookyFormControl = styled(Form.Control)`
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.2) 100%) !important;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#ff6b1a'} !important;
  color: #ff6b1a !important;
  font-family: 'Crimton Text', serif !important;
  
  &:focus {
    background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.3) 100%) !important;
    border-color: ${props => props.hasError ? '#dc3545' : '#ff6b1a'} !important;
    box-shadow: 0 0 0 0.2rem ${props => props.hasError ? 'rgba(220, 53, 69, 0.25)' : 'rgba(255, 107, 26, 0.25)'} !important;
    color: #ff6b1a !important;
  }
`;

const SpookyFormLabel = styled(Form.Label)`
  color: #ff6b1a !important;
  font-weight: bold !important;
  margin-bottom: 0.5rem !important;
`;

const ErrorText = styled.div`
  color: #dc3545 !important;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-weight: bold;
`;

export default function Settings() {
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showClearGroupsModal, setShowClearGroupsModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [groupCount, setGroupCount] = useState(0);
    const [isLoadingGroupCount, setIsLoadingGroupCount] = useState(true);
    const [viewResults, setViewResults] = useState(false);
    const [groupResults, setGroupResults] = useState(null);
    const [groupName, setGroupName] = useState("");
    
    // Game settings state
    const [gameSettings, setGameSettings] = useState({ timerDuration: 2400 });
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [validationError, setValidationError] = useState('');

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
    };

    const fetchGameSettings = async () => {
        try {
            setIsLoadingSettings(true);
            const response = await fetch('/GetGameSettings');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success && data.settings) {
                setGameSettings(data.settings);
            } else {
                console.error('Failed to get game settings:', data.error);
                setGameSettings({ timerDuration: 2400 }); // Default fallback
            }
        } catch (error) {
            console.error('Error fetching game settings:', error);
            setGameSettings({ timerDuration: 2400 }); // Default fallback
        } finally {
            setIsLoadingSettings(false);
        }
    };

    // Validation function
    const validateTimerDuration = (value) => {
        if (value === '' || value === null || value === undefined) {
            return 'Timer duration is required';
        }
        
        const numericValue = parseInt(value);
        if (isNaN(numericValue)) {
            return 'Timer duration must be a valid number';
        }
        
        if (numericValue < 1) {
            return 'Timer duration must be at least 1 second';
        }
        
        if (numericValue > 10800) {
            return 'Timer duration cannot exceed 3 hours (10800 seconds)';
        }
        
        return '';
    };

    const saveGameSettings = async () => {
        // Validate before saving
        const error = validateTimerDuration(gameSettings.timerDuration);
        if (error) {
            setValidationError(error);
            return;
        }

        try {
            setIsSavingSettings(true);
            const response = await fetch('/SaveGameSettings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: gameSettings })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                showAlert('success', 'Game settings saved successfully!');
                setShowSettingsModal(false);
                setValidationError(''); // Clear any validation errors
            } else {
                showAlert('danger', `Failed to save settings: ${result.error}`);
            }
        } catch (error) {
            console.error('Error saving game settings:', error);
            showAlert('danger', 'Failed to save game settings.');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    // Handle timer duration input changes
    const handleTimerDurationChange = (e) => {
        const value = e.target.value;
        
        // Allow empty string for clearing the field
        if (value === '') {
            setGameSettings({
                ...gameSettings,
                timerDuration: ''
            });
            setValidationError(validateTimerDuration(''));
            return;
        }
        
        // Parse the value and validate it
        const numericValue = parseInt(value);
        if (!isNaN(numericValue)) {
            setGameSettings({
                ...gameSettings,
                timerDuration: numericValue
            });
            setValidationError(validateTimerDuration(numericValue));
        }
    };

    // Check if save button should be disabled
    const isSaveDisabled = () => {
        return isSavingSettings || 
               !gameSettings.timerDuration || 
               gameSettings.timerDuration < 1 || 
               gameSettings.timerDuration > 10800 ||
               validationError !== '';
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

    const handleViewResults = () => {
        fetch('GroupResults')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(returnJson => {
                setGroupResults(returnJson);
                setViewResults(true);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    };

    const fetchResults = () => {
        if (viewResults) {
            fetch('GroupResults')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(returnJson => {
                    setGroupResults(returnJson);
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
        }
    };

    useEffect(() => {
        fetchGroupCount();
        fetchGameSettings();
        
        // Get group name from localStorage
        const _groupName = localStorage.getItem('groupName');
        if (_groupName) {
            setGroupName(_groupName);
        }
    }, []);

    useEffect(() => {
        let interval;
        if (viewResults) {
            // Fetch results immediately when modal opens
            fetchResults();
            // Set up interval to update every second
            interval = setInterval(fetchResults, 1000);
        }
        
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [viewResults]);

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

    const resultsColumns = [{
        dataField: 'position',
        text: 'Position'
    }, {
        dataField: 'groupName',
        text: 'Group Name'
    }, {
        dataField: 'formattedRemainingTime',
        text: 'Time Remaining'
    }];

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
                                <h5>Game Configuration</h5>
                                <p>
                                    Configure game settings such as timer duration and other gameplay options.
                                </p>
                                <p className="text-info">
                                    <strong>Current Timer Duration:</strong> {isLoadingSettings ? 'Loading...' : formatTime(gameSettings.timerDuration)}
                                </p>
                                <WarningButton 
                                    size="lg" 
                                    onClick={() => setShowSettingsModal(true)}
                                    disabled={isLoadingSettings}
                                >
                                    Configure Game Settings
                                </WarningButton>
                            </SettingsItem>

                            <SettingsItem>
                                <h5>View Results</h5>
                                <p>View the current leaderboard and game results. Updates automatically every second.</p>
                                <SuccessButton size="lg" onClick={handleViewResults}>
                                    View Results
                                </SuccessButton>
                            </SettingsItem>

                            <SettingsItem>
                                <h5>Edit Riddle Data</h5>
                                <p>Manage and modify the riddles used in the Halloween puzzle game.</p>
                                <StyledLink to="/editriddledata">
                                    <WarningButton size="lg">
                                        Edit Riddle Data
                                    </WarningButton>
                                </StyledLink>
                            </SettingsItem>

                            <SettingsItem>
                                <h5>Reset Group Data</h5>
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
                                        <StoredDataText>
                                            Stored data: {storageInfo.keys.join(', ')}
                                        </StoredDataText>
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
                                    <SpookyButton 
                                        variant="info" 
                                        size="sm" 
                                        onClick={fetchGroupCount}
                                        disabled={isLoadingGroupCount}
                                    >
                        {isLoadingGroupCount ? 'Refreshing...' : 'Refresh Count'}
                                    </SpookyButton>
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
                                    <SpookyButton size="lg">
                                        Back to Home
                                    </SpookyButton>
                                </StyledLink>
                            </SettingsItem>
                        </Card.Body>
                    </StyledCard>
                </Col>
            </Row>

            {/* Game Settings Modal */}
            <SpookyModal show={showSettingsModal} onHide={() => setShowSettingsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Game Configuration</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <SpookyFormLabel>Timer Duration (seconds)</SpookyFormLabel>
                            <SpookyFormControl
                                type="number"
                                min="1"
                                max="10800"
                                step="1"
                                value={gameSettings.timerDuration}
                                onChange={handleTimerDurationChange}
                                hasError={validationError !== ''}
                            />
                            {validationError && (
                                <ErrorText>
                                    {validationError}
                                </ErrorText>
                            )}
                            <Form.Text className="text-muted">
                                Current setting: {gameSettings.timerDuration ? formatTime(gameSettings.timerDuration) : 'Not set'}<br/>
                                Range: 1 second minimum to 3 hours (10800 seconds) maximum
                            </Form.Text>
                        </Form.Group>
                    </Form>
                    <div className="mt-3 p-3" style={{ backgroundColor: 'rgba(139, 0, 0, 0.2)', borderRadius: '5px', border: '1px solid #ff6b1a' }}>
                        <strong style={{ color: '#ffc107' }}>Note:</strong>
                        <ul style={{ color: '#ccc', marginTop: '0.5rem', marginBottom: 0 }}>
                            <li>Changes will apply to new games only</li>
                            <li>Active games will continue with their current timer</li>
                            <li>Recommended: 40 minutes (2400 seconds) for standard gameplay</li>
                            <li>Minimum: 1 second for testing purposes</li>
                        </ul>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <SpookyButton onClick={() => setShowSettingsModal(false)}>
                        Cancel
                    </SpookyButton>
                    <SuccessButton 
                        onClick={saveGameSettings} 
                        disabled={isSaveDisabled()}
                    >
                        {isSavingSettings ? 'Saving...' : 'Save Settings'}
                    </SuccessButton>
                </Modal.Footer>
            </SpookyModal>

            <SpookyModal show={viewResults} onHide={() => setViewResults(false)} className="special_modal">
                <Modal.Header closeButton>
                    <Modal.Title>Leaderboard of Souls</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: '#ff6b1a' }}>
                        Behold the brave souls who have dared to challenge the manor's mysteries. 
                        See where you stand among the living... and the lost.
                    </p>
                    <ResultsTable
                        data={groupResults}
                        columns={resultsColumns}
                        groupName={groupName}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <SpookyButton onClick={() => setViewResults(false)}>
                        Return to Shadows
                    </SpookyButton>
                </Modal.Footer>
            </SpookyModal>

            <SpookyModal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>WARNING: Confirm Data Reset</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to reset all game data?</p>
                    <p style={{ color: '#ffc107', fontWeight: 'bold' }}>
                        <strong>This dark ritual will:</strong>
                    </p>
                    <ul style={{ color: '#ffc107' }}>
                        <li>Clear your current game progress</li>
                        <li>Reset your group name and timer</li>
                        <li>Remove all saved riddle states</li>
                        <li>Clear all cached game data</li>
                        <li><strong>Delete your group from the database</strong></li>
                    </ul>
                    <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
                        <strong>This action cannot be undone! The spirits will not forgive!</strong>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <SpookyButton onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </SpookyButton>
                    <DangerButton onClick={confirmResetLocalStorage}>
                        Yes, Reset All Data
                    </DangerButton>
                </Modal.Footer>
            </SpookyModal>

            <SpookyModal show={showClearGroupsModal} onHide={() => setShowClearGroupsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>DANGER: Clear All Groups</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to clear ALL groups from the database?</p>
                    <p style={{ color: '#ffc107', fontWeight: 'bold' }}>
                        <strong>This apocalyptic action will:</strong>
                    </p>
                    <ul style={{ color: '#ffc107' }}>
                        <li>Delete all {groupCount} groups from the database</li>
                        <li>Remove all game results and leaderboards</li>
                        <li>Clear all group progress permanently</li>
                        <li>Reset the entire competition data</li>
                    </ul>
                    <p style={{ color: '#dc3545', fontWeight: 'bold' }}>
                        <strong>This action cannot be undone and affects all users! The manor will forget all who entered!</strong>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <SpookyButton onClick={() => setShowClearGroupsModal(false)}>
                        Cancel
                    </SpookyButton>
                    <DangerButton onClick={confirmClearAllGroups}>
                        Yes, Clear All Groups
                    </DangerButton>
                </Modal.Footer>
            </SpookyModal>
        </StyledContainer>
    );
}
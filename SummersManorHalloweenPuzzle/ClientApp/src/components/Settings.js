import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ResultsModal from './modals/ResultsModal';
import GameSettingsModal from './settings/GameSettingsModal';
import DataManagementSection from './settings/DataManagementSection';
import { useAlert } from '../hooks/useAlert';
import { StyledContainer, StyledCard, SpookyTitle, SettingsItem } from './common/StyledComponents';
import { SpookyButton, SuccessButton, WarningButton } from './styles/SpookyModalStyles';

export default function Settings() {
    const { alert, showAlert } = useAlert();
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [viewResults, setViewResults] = useState(false);
    const [groupResults, setGroupResults] = useState(null);
    const [groupName, setGroupName] = useState("");
    const [gameSettings, setGameSettings] = useState({ timerDuration: 2400 });
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

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
                setGameSettings({ timerDuration: 2400 });
            }
        } catch (error) {
            console.error('Error fetching game settings:', error);
            setGameSettings({ timerDuration: 2400 });
        } finally {
            setIsLoadingSettings(false);
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
        fetchGameSettings();
        
        const _groupName = localStorage.getItem('groupName');
        if (_groupName) {
            setGroupName(_groupName);
        }
    }, []);

    useEffect(() => {
        let interval;
        if (viewResults) {
            fetchResults();
            interval = setInterval(fetchResults, 1000);
        }
        
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [viewResults]);

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

                            <DataManagementSection onAlert={showAlert} />

                            <SettingsItem>
                                <h5>Back to Game</h5>
                                <p>Return to the Halloween puzzle game.</p>
                                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <SpookyButton size="lg">
                                        Back to Home
                                    </SpookyButton>
                                </Link>
                            </SettingsItem>
                        </Card.Body>
                    </StyledCard>
                </Col>
            </Row>

            {/* Modals */}
            <GameSettingsModal 
                show={showSettingsModal} 
                onHide={() => setShowSettingsModal(false)}
                onSave={showAlert}
            />

            <ResultsModal
                show={viewResults}
                onHide={() => setViewResults(false)}
                groupResults={groupResults}
                groupName={groupName}
            />
        </StyledContainer>
    );
}
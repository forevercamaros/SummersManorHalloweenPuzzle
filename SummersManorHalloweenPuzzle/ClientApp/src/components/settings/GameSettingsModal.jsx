import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { SpookyModal, SpookyButton, SuccessButton } from '../styles/SpookyModalStyles';
import { SpookyFormControl, SpookyFormLabel, ErrorText } from '../common/StyledComponents';

export default function GameSettingsModal({ show, onHide, onSave }) {
    const [gameSettings, setGameSettings] = useState({ timerDuration: 2400 });
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [validationError, setValidationError] = useState('');

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

    const saveGameSettings = async () => {
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
                onSave('success', 'Game settings saved successfully!');
                onHide();
                setValidationError('');
            } else {
                onSave('danger', `Failed to save settings: ${result.error}`);
            }
        } catch (error) {
            console.error('Error saving game settings:', error);
            onSave('danger', 'Failed to save game settings.');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const handleTimerDurationChange = (e) => {
        const value = e.target.value;
        
        if (value === '') {
            setGameSettings({
                ...gameSettings,
                timerDuration: ''
            });
            setValidationError(validateTimerDuration(''));
            return;
        }
        
        const numericValue = parseInt(value);
        if (!isNaN(numericValue)) {
            setGameSettings({
                ...gameSettings,
                timerDuration: numericValue
            });
            setValidationError(validateTimerDuration(numericValue));
        }
    };

    const isSaveDisabled = () => {
        return isSavingSettings || 
               !gameSettings.timerDuration || 
               gameSettings.timerDuration < 1 || 
               gameSettings.timerDuration > 10800 ||
               validationError !== '';
    };

    useEffect(() => {
        if (show) {
            fetchGameSettings();
        }
    }, [show]);

    return (
        <SpookyModal show={show} onHide={onHide}>
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
                <SpookyButton onClick={onHide}>
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
    );
}
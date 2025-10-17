import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert, Modal, ProgressBar, Badge } from 'react-bootstrap';
import styled from 'styled-components';
import { SpookyModal, SpookyButton, DangerButton, SuccessButton } from './styles/SpookyModalStyles';

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
  
  /* Style form labels to be visible on dark background */
  .form-label {
    color: #ff6b1a !important;
    font-weight: bold;
    text-shadow: 0 0 4px rgba(255, 107, 26, 0.3);
  }
  
  /* Style form controls for dark theme */
  .form-control, .form-select {
    background-color: rgba(0, 0, 0, 0.6) !important;
    border: 1px solid #ff6b1a !important;
    color: white !important;
    
    &:focus {
      background-color: rgba(0, 0, 0, 0.8) !important;
      border-color: #ff6b1a !important;
      box-shadow: 0 0 0 0.25rem rgba(255, 107, 26, 0.25) !important;
      color: white !important;
    }
    
    &::placeholder {
      color: #ccc !important;
    }
  }
  
  /* Style select options for dark theme */
  .form-select option {
    background-color: #222 !important;
    color: white !important;
  }
`;

const SpookyTitle = styled.h1`
  font-family: 'Creepster', cursive;
  color: #ff6b1a;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 0 0 12px #8b0000, 0 0 24px #ff6b1a;
`;

const AudioFileSelector = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  
  .audio-select {
    flex: 1;
  }
  
  .upload-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
    padding: 10px;
    border: 1px dashed #ff6b1a;
    border-radius: 5px;
  }
`;

const ColorBadge = styled(Badge)`
  margin: 2px;
  padding: 8px 12px;
  cursor: pointer;
  background-color: ${props => props.color} !important;
  color: white;
  border: 2px solid #ff6b1a;
  opacity: 1;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 10px ${props => props.color};
  }
`;

const SequenceDisplay = styled.div`
  padding: 10px;
  background: rgba(139, 0, 0, 0.2);
  border: 1px solid #ff6b1a;
  border-radius: 5px;
  margin-top: 10px;
  
  .sequence-title {
    color: #ff6b1a;
    font-weight: bold;
    margin-bottom: 8px;
  }
`;

const WarningBox = styled.div`
  padding: 10px;
  background: rgba(255, 107, 26, 0.2);
  border: 2px solid #ff6b1a;
  border-radius: 5px;
  margin-top: 10px;
  color: #ff6b1a;
  font-weight: bold;
  text-align: center;
`;

const InstructionText = styled.small`
  display: block;
  color: #ff6b1a;
  font-style: italic;
  margin-top: 5px;
  margin-bottom: 10px;
`;

const AVAILABLE_COLORS = [
    { name: 'Red', value: 'red', hex: '#FF0000' },
    { name: 'Blue', value: 'blue', hex: '#0000FF' },
    { name: 'Yellow', value: 'yellow', hex: '#FFFF00' },
    { name: 'Green', value: 'green', hex: '#00FF00' },
    { name: 'Orange', value: 'orange', hex: '#FF8000' },
    { name: 'Purple', value: 'purple', hex: '#800080' }
];

export default function EditRiddleData() {
    const [riddles, setRiddles] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [riddleToDelete, setRiddleToDelete] = useState('');
    const [audioFiles, setAudioFiles] = useState([]);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchRiddleData();
        fetchAudioFiles();
    }, []);

    const fetchRiddleData = async () => {
        try {
            console.log('Fetching riddle data...');
            const response = await fetch('/GetRiddleData');
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
            }
            
            console.log('Parsed data:', data);
            
            if (data.success) {
                setRiddles(data.riddles || {});
                if (data.error) {
                    showAlert('warning', `Warning: ${data.error}`);
                }
            } else {
                showAlert('error', 'Failed to load riddle data: ' + (data.error || 'Unknown error'));
                // Set default riddles as fallback
                setDefaultRiddles();
            }
        } catch (error) {
            console.error('Error fetching riddle data:', error);
            showAlert('error', 'Failed to load riddle data: ' + error.message);
            // Set default riddles as fallback
            setDefaultRiddles();
        } finally {
            setLoading(false);
        }
    };

    const fetchAudioFiles = async () => {
        try {
            const response = await fetch('/GetAudioFiles');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
                setAudioFiles(data.audioFiles || []);
            }
        } catch (error) {
            console.error('Error fetching audio files:', error);
            // Set empty array as fallback - no hardcoded names
            setAudioFiles([]);
        }
    };

    const handleFileUpload = async (event, riddleKey) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
            showAlert('error', 'Please select an MP3 file');
            return;
        }

        setUploadingFile(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('audioFile', file);

            const response = await fetch('/UploadAudioFile', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                showAlert('success', `File "${result.fileName}" uploaded successfully!`);
                
                // Update the riddle with the new audio file
                handleRiddleChange(riddleKey, 'audioFile', result.fileName);
                
                // Refresh the audio files list
                await fetchAudioFiles();
            } else {
                showAlert('error', 'Failed to upload file: ' + result.error);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showAlert('error', 'Failed to upload file: ' + error.message);
        } finally {
            setUploadingFile(false);
            setUploadProgress(0);
            // Clear the file input
            event.target.value = '';
        }
    };

    const setDefaultRiddles = () => {
        setRiddles({
            'riddle1': {
                type: 'audio',
                audioFile: 'donttrytocheat4', // Use actual filename
                riddle: 'An eerie theme can make a scary movie even more memorable. Name the film this song is from.',
                answer: 'Psycho',
                bonusText: 'Provide the last name of the actress who starred in this film for an extra 60 seconds',
                bonusAnswer: 'Leigh',
                clueText: 'At a loss? Click here for a clue, but you will will be penalized 30 seconds.',
                clue: 'This movie gave a lot of people a healthy fear of shower curtains'
            },
            'riddle2': {
                type: 'text',
                riddle: 'This fiery predator guards our yard along with his emaciated keeper. Are you brave enough to get up close? You\'ll need the number of pointed gnashers to move on.',
                answer: '20',
                clueText: 'Need a hint? Click here for a clue, but you will will be penalized 30 seconds.',
                clue: 'Hope this guy doesn\'t have a case of dragon breath.'
            }
        });
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
    };

    const handleRiddleChange = (riddleKey, field, value) => {
        setRiddles(prev => ({
            ...prev,
            [riddleKey]: {
                ...prev[riddleKey],
                [field]: value
            }
        }));
    };

    const handleSequenceColorClick = (riddleKey, color) => {
        const riddle = riddles[riddleKey];
        const currentSequence = riddle.correctSequence || [];
        
        // Add color to the sequence (no restriction on duplicates)
        const newSequence = [...currentSequence, color];
        
        // Update sequenceColors to contain unique colors used
        const uniqueColors = [...new Set(newSequence)];
        
        setRiddles(prev => ({
            ...prev,
            [riddleKey]: {
                ...prev[riddleKey],
                sequenceColors: uniqueColors,
                correctSequence: newSequence
            }
        }));
    };

    const handleRemoveFromSequence = (riddleKey, index) => {
        const riddle = riddles[riddleKey];
        const correctSequence = riddle.correctSequence || [];
        const newSequence = correctSequence.filter((_, i) => i !== index);
        
        // Update unique colors based on remaining sequence
        const uniqueColors = [...new Set(newSequence)];
        
        setRiddles(prev => ({
            ...prev,
            [riddleKey]: {
                ...prev[riddleKey],
                sequenceColors: uniqueColors,
                correctSequence: newSequence
            }
        }));
    };

    const handleClearSequence = (riddleKey) => {
        setRiddles(prev => ({
            ...prev,
            [riddleKey]: {
                ...prev[riddleKey],
                sequenceColors: [],
                correctSequence: []
            }
        }));
    };

    const addNewRiddle = () => {
        const riddleKeys = Object.keys(riddles);
        const nextNumber = riddleKeys.length + 1;
        const newKey = `riddle${nextNumber}`;
        
        setRiddles(prev => ({
            ...prev,
            [newKey]: {
                type: 'text',
                riddle: '',
                answer: '',
                clueText: 'Need a clue? Click here for a clue, but you will be penalized 30 seconds.',
                clue: '',
                audioFile: '',
                bonusText: '',
                bonusAnswer: '',
                sequenceColors: [],
                correctSequence: []
            }
        }));
    };

    const confirmDeleteRiddle = (riddleKey) => {
        setRiddleToDelete(riddleKey);
        setShowDeleteModal(true);
    };

    const deleteRiddle = () => {
        setRiddles(prev => {
            const newRiddles = { ...prev };
            delete newRiddles[riddleToDelete];
            return newRiddles;
        });
        setShowDeleteModal(false);
        setRiddleToDelete('');
    };

    const saveRiddleData = async () => {
        // Validate sequence riddles before saving
        const invalidRiddles = [];
        Object.entries(riddles).forEach(([key, riddle]) => {
            if (riddle.type === 'sequence') {
                if (!riddle.correctSequence || riddle.correctSequence.length === 0) {
                    invalidRiddles.push(`${key}: No sequence configured`);
                }
            }
        });

        if (invalidRiddles.length > 0) {
            showAlert('error', `Cannot save! Fix these sequence riddles:\n${invalidRiddles.join('\n')}`);
            return;
        }

        setSaving(true);
        try {
            console.log('Saving riddle data:', riddles);
            const response = await fetch('/SaveRiddleData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ riddles }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                showAlert('success', 'Riddle data saved successfully!');
            } else {
                showAlert('error', 'Failed to save riddle data: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving riddle data:', error);
            showAlert('error', 'Failed to save riddle data: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <StyledContainer>
                <div className="text-center">
                    <SpookyTitle>Loading...</SpookyTitle>
                </div>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer fluid>
            <SpookyTitle>Edit Riddle Data</SpookyTitle>
            
            {alert.show && (
                <Alert variant={alert.type === 'success' ? 'success' : alert.type === 'warning' ? 'warning' : 'danger'} style={{ whiteSpace: 'pre-line' }}>
                    {alert.message}
                </Alert>
            )}

            <Row className="mb-3">
                <Col>
                    <SuccessButton onClick={addNewRiddle}>
                        Add New Riddle
                    </SuccessButton>
                    <SpookyButton 
                        className="ms-3" 
                        onClick={saveRiddleData}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </SpookyButton>
                </Col>
            </Row>

            {Object.entries(riddles).map(([riddleKey, riddle]) => (
                <StyledCard key={riddleKey}>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <span>{riddleKey}</span>
                        <DangerButton 
                            size="sm"
                            onClick={() => confirmDeleteRiddle(riddleKey)}
                        >
                            Delete
                        </DangerButton>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Type</Form.Label>
                                    <Form.Select
                                        value={riddle.type || 'text'}
                                        onChange={(e) => handleRiddleChange(riddleKey, 'type', e.target.value)}
                                    >
                                        <option value="text">Text</option>
                                        <option value="audio">Audio</option>
                                        <option value="sequence">Sequence</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            {riddle.type === 'audio' && (
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Audio File</Form.Label>
                                        <AudioFileSelector>
                                            <Form.Select
                                                className="audio-select"
                                                value={riddle.audioFile || ''}
                                                onChange={(e) => handleRiddleChange(riddleKey, 'audioFile', e.target.value)}
                                            >
                                                <option value="">Select an audio file...</option>
                                                {audioFiles.map(file => (
                                                    <option key={file} value={file}>{file}</option>
                                                ))}
                                            </Form.Select>
                                        </AudioFileSelector>
                                        <div className="upload-section">
                                            <small className="form-text" style={{ color: '#ff6b1a' }}>
                                                Or upload a new MP3 file:
                                            </small>
                                            <Form.Control
                                                type="file"
                                                accept=".mp3,audio/*"
                                                onChange={(e) => handleFileUpload(e, riddleKey)}
                                                disabled={uploadingFile}
                                            />
                                            {uploadingFile && (
                                                <div>
                                                    <small>Uploading...</small>
                                                    <ProgressBar 
                                                        animated 
                                                        now={100} 
                                                        variant="warning" 
                                                        style={{ height: '8px' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Form.Group>
                                </Col>
                            )}
                        </Row>

                        {riddle.type === 'sequence' && (
                            <>
                                <Form.Group className="mb-3">
                                    <Form.Label>Build Color Sequence</Form.Label>
                                    <InstructionText>
                                        Click colors below in the order users must tap them. 
                                        Colors can be used multiple times. Not all colors need to be used.
                                    </InstructionText>
                                    <div>
                                        {AVAILABLE_COLORS.map(color => (
                                            <ColorBadge
                                                key={color.value}
                                                color={color.hex}
                                                onClick={() => handleSequenceColorClick(riddleKey, color.value)}
                                                title={`Click to add ${color.name} to sequence`}
                                            >
                                                {color.name} +
                                            </ColorBadge>
                                        ))}
                                    </div>
                                </Form.Group>

                                {(riddle.correctSequence || []).length > 0 ? (
                                    <SequenceDisplay>
                                        <div className="sequence-title">Current Sequence (click to remove):</div>
                                        {(riddle.correctSequence || []).map((color, index) => {
                                            const colorData = AVAILABLE_COLORS.find(c => c.value === color);
                                            return (
                                                <ColorBadge
                                                    key={index}
                                                    color={colorData.hex}
                                                    onClick={() => handleRemoveFromSequence(riddleKey, index)}
                                                    title={`Click to remove from position ${index + 1}`}
                                                >
                                                    {index + 1}. {colorData.name} X
                                                </ColorBadge>
                                            );
                                        })}
                                        <div style={{ marginTop: '10px' }}>
                                            <DangerButton 
                                                size="sm"
                                                onClick={() => handleClearSequence(riddleKey)}
                                            >
                                                Clear All
                                            </DangerButton>
                                        </div>
                                    </SequenceDisplay>
                                ) : (
                                    <WarningBox>
                                        WARNING: Click colors above to build the sequence
                                    </WarningBox>
                                )}
                            </>
                        )}
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Riddle Text</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={riddle.riddle || ''}
                                onChange={(e) => handleRiddleChange(riddleKey, 'riddle', e.target.value)}
                                placeholder="Enter the riddle question here..."
                            />
                        </Form.Group>

                        {riddle.type !== 'sequence' && (
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Answer</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={riddle.answer || ''}
                                            onChange={(e) => handleRiddleChange(riddleKey, 'answer', e.target.value)}
                                            placeholder="Correct answer"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Bonus Answer</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={riddle.bonusAnswer || ''}
                                            onChange={(e) => handleRiddleChange(riddleKey, 'bonusAnswer', e.target.value)}
                                            placeholder="Optional bonus answer"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Bonus Text</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={riddle.bonusText || ''}
                                onChange={(e) => handleRiddleChange(riddleKey, 'bonusText', e.target.value)}
                                placeholder="Optional bonus question for extra time..."
                            />
                        </Form.Group>

                        {riddle.type === 'sequence' && (
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Bonus Answer</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={riddle.bonusAnswer || ''}
                                            onChange={(e) => handleRiddleChange(riddleKey, 'bonusAnswer', e.target.value)}
                                            placeholder="Optional bonus answer"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Clue Text</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={riddle.clueText || ''}
                                onChange={(e) => handleRiddleChange(riddleKey, 'clueText', e.target.value)}
                                placeholder="Text shown when clue button appears..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Clue</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={riddle.clue || ''}
                                onChange={(e) => handleRiddleChange(riddleKey, 'clue', e.target.value)}
                                placeholder="The actual clue hint..."
                            />
                        </Form.Group>
                    </Card.Body>
                </StyledCard>
            ))}

            <SpookyModal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to banish <strong>{riddleToDelete}</strong> to the void? 
                    This dark magic cannot be undone, and the riddle will be lost forever to the shadows.
                </Modal.Body>
                <Modal.Footer>
                    <SpookyButton onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </SpookyButton>
                    <DangerButton onClick={deleteRiddle}>
                        Delete Forever
                    </DangerButton>
                </Modal.Footer>
            </SpookyModal>
        </StyledContainer>
    );
}
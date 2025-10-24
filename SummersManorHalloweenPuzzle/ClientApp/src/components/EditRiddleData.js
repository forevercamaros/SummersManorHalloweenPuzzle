import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert, Modal, ProgressBar, Badge } from 'react-bootstrap';
import styled from 'styled-components';
import { SpookyModal, SpookyButton, DangerButton, SuccessButton } from './styles/SpookyModalStyles';
import QRCode from 'qrcode';

const StyledContainer = styled(Container)`
  margin-top: 20px;
  background: linear-gradient(135deg, #0a0a0a 80%, #8b0000 100%);
  min-height: 100vh;
  color: white;
  padding: 20px;
  /* Make room so content doesn't sit under the fixed action bar */
  padding-bottom: 110px;
`;

const StyledCard = styled(Card)`
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #ff6b1a;
  margin-bottom: 20px;
  .card-header { background: #8b0000; color: #ff6b1a; font-weight: bold; }
  .card-body { color: white; }
  .form-label { color: #ff6b1a !important; font-weight: bold; text-shadow: 0 0 4px rgba(255, 107, 26, 0.3); }
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
    &::placeholder { color: #ccc !important; }
  }
  .form-select option { background-color: #222 !important; color: white !important; }
`;

const SpookyTitle = styled.h1`
  font-family: 'Creepster', cursive;
  color: #ff6b1a;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 0 0 12px #8b0000, 0 0 24px #ff6b1a;
`;

const AudioFileSelector = styled.div`
  display: flex; gap: 10px; align-items: center;
  .audio-select { flex: 1; }
  .upload-section {
    display: flex; flex-direction: column; gap: 10px; margin-top: 10px; padding: 10px;
    border: 1px dashed #ff6b1a; border-radius: 5px;
  }
`;

const ColorBadge = styled(Badge)`
  margin: 2px; padding: 8px 12px; cursor: pointer;
  background-color: ${props => props.color} !important;
  color: white; border: 2px solid #ff6b1a; opacity: 1;
  &:hover { transform: scale(1.05); box-shadow: 0 0 10px ${props => props.color}; }
`;

const CodeBadge = styled(Badge)`
  margin: 2px; padding: 8px 12px; cursor: pointer;
  background-color: rgba(139, 0, 0, 0.6) !important;
  color: #fff; border: 2px solid #ff6b1a; opacity: 1; user-select: none;
  &:hover { transform: scale(1.05); box-shadow: 0 0 10px rgba(255, 107, 26, 0.4); }
`;

const SequenceDisplay = styled.div`
  padding: 10px; background: rgba(139, 0, 0, 0.2); border: 1px solid #ff6b1a; border-radius: 5px; margin-top: 10px;
  .sequence-title { color: #ff6b1a; font-weight: bold; margin-bottom: 8px; }
`;

// New: QR image styling
const QrGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const QrTile = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
`;

const QrImage = styled.img`
  width: 128px;
  height: 128px;
  border: 2px solid #ff6b1a;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 0 12px rgba(255, 107, 26, 0.25), inset 0 0 12px rgba(139, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  &:hover {
    transform: scale(1.03);
    box-shadow: 0 0 16px rgba(255, 107, 26, 0.5), inset 0 0 12px rgba(139, 0, 0, 0.15);
  }
`;

const WarningBox = styled.div`
  padding: 10px; background: rgba(255, 107, 26, 0.2); border: 2px solid #ff6b1a; border-radius: 5px; margin-top: 10px;
  color: #ff6b1a; font-weight: bold; text-align: center;
`;

const InstructionText = styled.small`
  display: block; color: #ff6b1a; font-style: italic; margin-top: 5px; margin-bottom: 10px;
`;

/* New fixed action bar anchored to the bottom of the screen */
const ActionBar = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1030; /* below Bootstrap modals (1055), above page content */
  background: rgba(0, 0, 0, 0.92);
  border-top: 1px solid #ff6b1a;
  backdrop-filter: blur(6px);
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
`;

const ActionBarInner = styled.div`
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

// Preset colors
const PRESET_COLORS = [
  { name: 'Red', value: 'red', hex: '#FF0000' },
  { name: 'Blue', value: 'blue', hex: '#0000FF' },
  { name: 'Yellow', value: 'yellow', hex: '#FFFF00' },
  { name: 'Green', value: 'green', hex: '#00FF00' },
  { name: 'Orange', value: 'orange', hex: '#FF8000' },
  { name: 'Purple', value: 'purple', hex: '#800080' }
];

const NAME_TO_HEX = PRESET_COLORS.reduce((acc, c) => { acc[c.value.toLowerCase()] = c.hex.toUpperCase(); return acc; }, {});
const HEX_TO_NAME = PRESET_COLORS.reduce((acc, c) => { acc[c.hex.toUpperCase()] = c.name; return acc; }, {});
const toHex = (val) => {
  if (!val) return '';
  const v = String(val).trim();
  if (v.startsWith('#')) return v.toUpperCase();
  const m = NAME_TO_HEX[v.toLowerCase()];
  return (m || v).toUpperCase();
};

// Generate a human-friendly unique code
const generateQrValue = (existing = []) => {
  const year = String(new Date().getFullYear()).slice(-2);
  let code;
  do {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase(); // 6 chars
    code = `SM-${year}-${rand}`;
  } while (existing.includes(code));
  return code;
};

// Helper: find the first available riddle key (riddle1, riddle2, ...)
const getNextRiddleKey = (riddlesObj) => {
  const taken = new Set(
    Object.keys(riddlesObj)
      .map(k => k.match(/^riddle(\d+)$/i)?.[1])
      .filter(Boolean)
      .map(n => parseInt(n, 10))
  );
  let i = 1;
  while (taken.has(i)) i++;
  return `riddle${i}`;
};

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

  // Color modal state
  const [colorModal, setColorModal] = useState({
    show: false,
    riddleKey: '',
    selectedColor: '#FF6B1A',
    selectedName: ''
  });

  // Per-riddle input for adding QR codes (optional override)
  const [qrInputs, setQrInputs] = useState({});
  // Per-riddle map of code -> dataURL for display
  const [qrImages, setQrImages] = useState({}); // { [riddleKey]: { [code]: dataUrl } }

  useEffect(() => {
    fetchRiddleData();
    fetchAudioFiles();
  }, []);

  const fetchRiddleData = async () => {
    try {
      const response = await fetch('/GetRiddleData');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseText = await response.text();
      let data;
      try { data = JSON.parse(responseText); }
      catch { throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`); }
      // normalize sequenceColorNames and qrSequence (fallback for PascalCase)
      if (data.success) {
        const serverRiddles = data.riddles || {};
        const normalizedRiddles = Object.fromEntries(
          Object.entries(serverRiddles).map(([key, riddle]) => {
            const names = riddle.sequenceColorNames || riddle.SequenceColorNames || {};
            const qrSeq = riddle.qrSequence || riddle.QrSequence || [];
            return [key, { ...riddle, sequenceColorNames: names, qrSequence: qrSeq }];
          })
        );
        setRiddles(normalizedRiddles);
        if (data.error) {
          showAlert('warning', `Warning: ${data.error}`);
        }
      } else {
        showAlert('error', 'Failed to load riddle data: ' + (data.error || 'Unknown error'));
        setDefaultRiddles();
      }
    } catch (error) {
      console.error('Error fetching riddle data:', error);
      showAlert('error', 'Failed to load riddle data: ' + error.message);
      setDefaultRiddles();
    } finally {
      setLoading(false);
    }
  };

  const fetchAudioFiles = async () => {
    try {
      const response = await fetch('/GetAudioFiles');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success) setAudioFiles(data.audioFiles || []);
    } catch (error) {
      console.error('Error fetching audio files:', error);
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
      const response = await fetch('/UploadAudioFile', { method: 'POST', body: formData });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        showAlert('success', `File "${result.fileName}" uploaded successfully!`);
        handleRiddleChange(riddleKey, 'audioFile', result.fileName);
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
      event.target.value = '';
    }
  };

  const setDefaultRiddles = () => {
    setRiddles({
      'riddle1': {
        type: 'audio',
        audioFile: 'donttrytocheat4',
        riddle: 'An eerie theme can make a scary movie even more memorable. Name the film this song is from.',
        answer: 'Psycho',
        bonusText: 'Provide the last name of the actress who starred in this film for an extra 60 seconds',
        bonusAnswer: 'Leigh',
        clueText: 'At a loss? Click here for a clue, but you will will be penalized 30 seconds.',
        clue: 'This movie gave a lot of people a healthy fear of shower curtains',
        qrSequence: []
      },
      'riddle2': {
        type: 'text',
        riddle: 'This fiery predator guards our yard along with his emaciated keeper. Are you brave enough to get up close? You\'ll need the number of pointed gnashers to move on.',
        answer: '20',
        clueText: 'Need a hint? Click here for a clue, but you will will be penalized 30 seconds.',
        clue: 'Hope this guy doesn\'t have a case of dragon breath.',
        qrSequence: []
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

  // Add color to sequence and names map
  const addColorToSequence = (riddleKey, hex, name) => {
    const colorHex = toHex(hex);
    const label = (name || '').trim() || HEX_TO_NAME[colorHex] || colorHex;
    const riddle = riddles[riddleKey] || {};
    const currentSequence = riddle.correctSequence || [];
    const newSequence = [...currentSequence, colorHex];
    const uniqueColors = [...new Set(newSequence)];
    const namesMap = { ...(riddle.sequenceColorNames || {}) };
    namesMap[colorHex] = label;

    setRiddles(prev => ({
      ...prev,
      [riddleKey]: {
        ...prev[riddleKey],
        sequenceColors: uniqueColors,
        correctSequence: newSequence,
        sequenceColorNames: namesMap
      }
    }));
  };

  const handleRemoveFromSequence = (riddleKey, index) => {
    const riddle = riddles[riddleKey];
    const correctSequence = riddle.correctSequence || [];
    const newSequence = correctSequence.filter((_, i) => i !== index);
    const uniqueColors = [...new Set(newSequence.map(toHex))];

    // Optionally prune names with no remaining usage
    const namesMap = { ...(riddle.sequenceColorNames || {}) };
    const stillUsed = new Set(uniqueColors);
    Object.keys(namesMap).forEach(k => { if (!stillUsed.has(k)) delete namesMap[k]; });

    setRiddles(prev => ({
      ...prev,
      [riddleKey]: {
        ...prev[riddleKey],
        sequenceColors: uniqueColors,
        correctSequence: newSequence,
        sequenceColorNames: namesMap
      }
    }));
  };

  const handleClearSequence = (riddleKey) => {
    setRiddles(prev => ({
      ...prev,
      [riddleKey]: {
        ...prev[riddleKey],
        sequenceColors: [],
        correctSequence: [],
        sequenceColorNames: {}
      }
    }));
  };

  // Ensure a QR image exists in state for a code (data URL)
  const ensureQrImage = async (riddleKey, code) => {
    try {
      const url = await QRCode.toDataURL(code, {
        width: 512,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      setQrImages(prev => ({
        ...prev,
        [riddleKey]: { ...(prev[riddleKey] || {}), [code]: url }
      }));
    } catch (e) {
      console.error('QR generation failed:', e);
      showAlert('error', `Failed to generate QR for "${code}": ${e?.message || e}`);
    }
  };

  // QR sequence helpers
  const addQrToSequence = (riddleKey) => {
    const riddle = riddles[riddleKey] || {};
    const existing = riddle.qrSequence || [];
    // If user typed a value, use it; otherwise generate a new unique one
    let next = (qrInputs[riddleKey] || '').trim();
    if (!next) {
      next = generateQrValue(existing);
    }
    if (existing.includes(next)) {
      showAlert('warning', `Code "${next}" is already added.`);
      return;
    }
    const newSeq = [...existing, next];
    setRiddles(prev => ({
      ...prev,
      [riddleKey]: { ...prev[riddleKey], qrSequence: newSeq }
    }));
    setQrInputs(prev => ({ ...prev, [riddleKey]: '' }));
    // Create QR image in the background
    ensureQrImage(riddleKey, next);
  };

  const handleRemoveFromQrSequence = (riddleKey, index) => {
    const riddle = riddles[riddleKey] || {};
    const existing = riddle.qrSequence || [];
    const removed = existing[index];
    const newSeq = existing.filter((_, i) => i !== index);
    setRiddles(prev => ({
      ...prev,
      [riddleKey]: { ...prev[riddleKey], qrSequence: newSeq }
    }));
    // Optionally remove from qrImages cache
    setQrImages(prev => {
      const rMap = { ...(prev[riddleKey] || {}) };
      delete rMap[removed];
      return { ...prev, [riddleKey]: rMap };
    });
  };

  const handleClearQrSequence = (riddleKey) => {
    setRiddles(prev => ({
      ...prev,
      [riddleKey]: { ...prev[riddleKey], qrSequence: [] }
    }));
    setQrImages(prev => ({ ...prev, [riddleKey]: {} }));
  };

  const addNewRiddle = () => {
    setRiddles(prev => {
      const newKey = getNextRiddleKey(prev);
      return {
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
          correctSequence: [],
          sequenceColorNames: {},
          qrSequence: []
        }
      };
    });
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

  // Normalize legacy names to hex, keep names map; also trim QR entries
  const normalizeRiddlesForSave = (input) => {
    const clone = JSON.parse(JSON.stringify(input));
    Object.entries(clone).forEach(([key, riddle]) => {
      if (riddle.type === 'sequence') {
        const seq = (riddle.correctSequence || []).map(toHex);
        riddle.correctSequence = seq;
        riddle.sequenceColors = [...new Set(seq)];
        const names = riddle.sequenceColorNames || {};
        const remapped = {};
        riddle.sequenceColors.forEach(h => {
          const hex = toHex(h);
          remapped[hex] = names[hex] || HEX_TO_NAME[hex] || hex;
        });
        riddle.sequenceColorNames = remapped;
      }
      if (riddle.type === 'qrsequence') {
        const seq = (riddle.qrSequence || []).map(s => (s ?? '').toString().trim()).filter(s => s.length > 0);
        riddle.qrSequence = seq;
      }
    });
    return clone;
  };

  const saveRiddleData = async () => {
    // Validate sequence and qrsequence riddles
    const invalidRiddles = [];
    Object.entries(riddles).forEach(([key, riddle]) => {
      if (riddle.type === 'sequence') {
        if (!riddle.correctSequence || riddle.correctSequence.length === 0) {
          invalidRiddles.push(`${key}: No color sequence configured`);
        }
      }
      if (riddle.type === 'qrsequence') {
        if (!riddle.qrSequence || riddle.qrSequence.length === 0) {
          invalidRiddles.push(`${key}: No QR codes configured`);
        }
      }
    });
    if (invalidRiddles.length > 0) {
      showAlert('error', `Cannot save! Fix these riddles:\n${invalidRiddles.join('\n')}`);
      return;
    }

    setSaving(true);
    try {
      const normalized = normalizeRiddlesForSave(riddles);
      const response = await fetch('/SaveRiddleData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riddles: normalized }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

  // Color modal helpers
  const openColorModal = (riddleKey) => {
    setColorModal({
      show: true,
      riddleKey,
      selectedColor: '#FF6B1A',
      selectedName: ''
    });
  };
  const closeColorModal = () => setColorModal(m => ({ ...m, show: false }));

  const applySelectedColor = () => {
    const hex = toHex(colorModal.selectedColor);
    const name = (colorModal.selectedName || '').trim();
    addColorToSequence(colorModal.riddleKey, hex, name || HEX_TO_NAME[hex] || hex);
    closeColorModal();
  };

  if (loading) {
    return (
      <StyledContainer>
        <div className="text-center"><SpookyTitle>Loading...</SpookyTitle></div>
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

      {/* Removed the top buttons; now placed in a fixed ActionBar at the bottom */}

      {Object.entries(riddles).map(([riddleKey, riddle]) => (
        <StyledCard key={riddleKey}>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>{riddleKey}</span>
            <DangerButton size="sm" onClick={() => confirmDeleteRiddle(riddleKey)}>Delete</DangerButton>
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
                    <option value="qrsequence">QR Codes</option>
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
                        {audioFiles.map(file => (<option key={file} value={file}>{file}</option>))}
                      </Form.Select>
                    </AudioFileSelector>
                    <div className="upload-section">
                      <small className="form-text" style={{ color: '#ff6b1a' }}>Or upload a new MP3 file:</small>
                      <Form.Control type="file" accept=".mp3,audio/*" onChange={(e) => handleFileUpload(e, riddleKey)} disabled={uploadingFile} />
                      {uploadingFile && (
                        <div>
                          <small>Uploading...</small>
                          <ProgressBar animated now={100} variant="warning" style={{ height: '8px' }} />
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
                    Click "Add Color to Sequence" to choose a preset or any custom color and give it a name.
                    Colors can repeat; not all presets need to be used.
                  </InstructionText>
                  <SuccessButton size="sm" onClick={() => openColorModal(riddleKey)}>
                    Add Color to Sequence
                  </SuccessButton>
                </Form.Group>

                {(riddle.correctSequence || []).length > 0 ? (
                  <SequenceDisplay>
                    <div className="sequence-title">Current Sequence (click to remove):</div>
                    {(riddle.correctSequence || []).map((color, index) => {
                      const hex = toHex(color);
                      const label = (riddle.sequenceColorNames && riddle.sequenceColorNames[hex]) || HEX_TO_NAME[hex] || hex;
                      return (
                        <ColorBadge
                          key={`${hex}-${index}`}
                          color={hex}
                          onClick={() => handleRemoveFromSequence(riddleKey, index)}
                          title={`Click to remove from position ${index + 1}`}
                        >
                          {index + 1}. {label} X
                        </ColorBadge>
                      );
                    })}
                    <div style={{ marginTop: '10px' }}>
                      <DangerButton size="sm" onClick={() => handleClearSequence(riddleKey)}>Clear All</DangerButton>
                    </div>
                  </SequenceDisplay>
                ) : (
                  <WarningBox>WARNING: Add at least one color to build the sequence</WarningBox>
                )}
              </>
            )}

            {riddle.type === 'qrsequence' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Configure QR Codes</Form.Label>
                  <InstructionText>
                    Click "Add Code" to auto-generate a code (or type your own). The QR will appear below.
                    Click/tap a QR to remove it.
                  </InstructionText>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Form.Control
                      type="text"
                      placeholder="Leave blank to auto-generate (e.g., SM-25-ABC123)"
                      value={qrInputs[riddleKey] || ''}
                      onChange={(e) => setQrInputs(prev => ({ ...prev, [riddleKey]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addQrToSequence(riddleKey); } }}
                    />
                    <SuccessButton size="sm" onClick={() => addQrToSequence(riddleKey)}>Add Code</SuccessButton>
                  </div>
                </Form.Group>

                {(riddle.qrSequence || []).length > 0 ? (
                  <SequenceDisplay>
                    <div className="sequence-title">Codes for this riddle (click a QR to remove):</div>
                    <QrGrid>
                      {(riddle.qrSequence || []).map((code, index) => {
                        const url = (qrImages[riddleKey] && qrImages[riddleKey][code]) || '';
                        if (!url) {
                          ensureQrImage(riddleKey, code);
                        }
                        return (
                          <QrTile key={`${code}-${index}`}>
                            <QrImage
                              src={
                                url ||
                                'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
                              }
                              alt={`QR for ${code}`}
                              title={`Click to remove ${code}`}
                              onClick={() => handleRemoveFromQrSequence(riddleKey, index)}
                            />
                            <small style={{ color: '#ccc', marginTop: 6 }}>{index + 1}. {code}</small>
                          </QrTile>
                        );
                      })}
                    </QrGrid>
                    <div style={{ marginTop: '10px' }}>
                      <DangerButton size="sm" onClick={() => handleClearQrSequence(riddleKey)}>Clear All</DangerButton>
                    </div>
                  </SequenceDisplay>
                ) : (
                  <WarningBox>WARNING: Add at least one code</WarningBox>
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

            {(riddle.type === 'text' || riddle.type === 'audio') && (
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

            {(riddle.type === 'sequence' || riddle.type === 'qrsequence') && (
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

      {/* Fixed bottom action bar */}
      <ActionBar>
        <ActionBarInner>
          <SuccessButton onClick={addNewRiddle}>Add New Riddle</SuccessButton>
          <SpookyButton onClick={saveRiddleData} disabled={saving}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </SpookyButton>
        </ActionBarInner>
      </ActionBar>

      <SpookyModal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>
          Are you sure you want to banish <strong>{riddleToDelete}</strong> to the void? 
          This dark magic cannot be undone, and the riddle will be lost forever to the shadows.
        </Modal.Body>
        <Modal.Footer>
          <SpookyButton onClick={() => setShowDeleteModal(false)}>Cancel</SpookyButton>
          <DangerButton onClick={deleteRiddle}>Delete Forever</DangerButton>
        </Modal.Footer>
      </SpookyModal>

      {/* Add Color Modal */}
      <SpookyModal show={colorModal.show} onHide={closeColorModal} centered size="lg">
        <Modal.Header closeButton><Modal.Title>Add Color to Sequence</Modal.Title></Modal.Header>
        <Modal.Body>
          <div style={{ marginBottom: 12, color: '#ff6b1a', fontWeight: 'bold' }}>Presets</div>
          <div style={{ marginBottom: 16 }}>
            {PRESET_COLORS.map(c => (
              <ColorBadge
                key={c.value}
                color={c.hex}
                onClick={() => setColorModal(m => ({ ...m, selectedColor: c.hex, selectedName: c.name }))}
                title={`Select ${c.name}`}
              >
                {c.name}
              </ColorBadge>
            ))}
          </div>

          <div style={{ marginBottom: 12, color: '#ff6b1a', fontWeight: 'bold' }}>Custom</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <input
              type="color"
              value={colorModal.selectedColor}
              onChange={(e) => setColorModal(m => ({ ...m, selectedColor: e.target.value }))}
              style={{ width: 48, height: 36, border: '2px solid #ff6b1a', borderRadius: 6, background: 'transparent' }}
              title="Pick a custom color"
            />
            <Form.Control
              type="text"
              placeholder="Name this color (e.g., Pumpkin, Slime, Midnight)"
              value={colorModal.selectedName}
              onChange={(e) => setColorModal(m => ({ ...m, selectedName: e.target.value }))}
            />
          </div>

          <div style={{ color: '#ccc' }}>
            Preview:
            <ColorBadge color={colorModal.selectedColor} style={{ marginLeft: 8 }}>
              {(colorModal.selectedName || '').trim() || HEX_TO_NAME[toHex(colorModal.selectedColor)] || toHex(colorModal.selectedColor)}
            </ColorBadge>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <SpookyButton variant="secondary" onClick={closeColorModal}>Cancel</SpookyButton>
          <SuccessButton onClick={applySelectedColor}>Add to Sequence</SuccessButton>
        </Modal.Footer>
      </SpookyModal>
    </StyledContainer>
  );
}
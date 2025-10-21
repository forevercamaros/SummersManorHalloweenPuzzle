import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

const flashBorder = keyframes`
  0% { box-shadow: 0 0 0 rgba(255,107,26,0); }
  25% { box-shadow: 0 0 22px var(--flashColor, rgba(255,107,26,0.9)); }
  100% { box-shadow: 0 0 0 rgba(255,107,26,0); }
`;

const ScannerContainer = styled.div`
  margin: 20px 8px;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.3) 100%);
  border: 2px solid ${p => {
    if (p.$result === 'accepted') return '#ff6b1a';
    if (p.$result === 'invalid') return '#8b0000';
    if (p.$result === 'duplicate') return '#ff6b1a';
    return '#ff6b1a';
  }};
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(255, 107, 26, 0.3), inset 0 0 20px rgba(139, 0, 0, 0.2);
  position: relative;
  ${p => p.$flash && css`
    --flashColor: ${p.$result === 'invalid' ? 'rgba(139,0,0,0.9)' : 'rgba(255,107,26,0.9)'};
    animation: ${flashBorder} 650ms ease-out;
  `}
`;

const Header = styled.div`
  color: #ff6b1a;
  font-weight: bold;
  margin-bottom: 0.75rem;
  text-shadow: 0 0 8px rgba(255, 107, 26, 0.3);
`;

const ErrorMsg = styled.div`
  margin-top: 0.75rem;
  color: #ff6b1a;
  font-weight: 600;
`;

const ResultOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: ${p => (p.$show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.35);
`;

const ResultBubble = styled.div`
  background: ${p => {
    if (p.$result === 'accepted') return 'linear-gradient(135deg, rgba(255,107,26,0.95) 0%, rgba(139,0,0,0.85) 100%)';
    if (p.$result === 'invalid') return 'linear-gradient(135deg, rgba(139,0,0,0.95) 0%, rgba(255,0,0,0.8) 100%)';
    if (p.$result === 'duplicate') return 'linear-gradient(135deg, rgba(255,107,26,0.85) 0%, rgba(139,0,0,0.7) 100%)';
    return 'rgba(255,107,26,0.9)';
  }};
  color: #dedede;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${p => (p.$result === 'invalid' ? '#8b0000' : '#ff6b1a')};
  box-shadow: 0 0 26px rgba(255,107,26,0.35), 0 0 40px rgba(139,0,0,0.3);
  font-weight: 800;
  letter-spacing: 1px;
  max-width: 90%;
  text-align: center;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-shadow: 0 0 8px rgba(0,0,0,0.6);
`;

const Icon = styled.span`
  display: inline-block;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  background: #0a0a0a;
  color: ${p => (p.$result === 'invalid' ? '#ff0000' : '#ff6b1a')};
  line-height: 1.1rem;
  text-align: center;
  font-weight: 900;
`;

export default function QrSequenceScanner({ onCode, onError }) {
  const videoRef = useRef(null);
  const lastRef = useRef({ value: '' });
  const detectorRef = useRef(null);
  const zxingControlsRef = useRef(null);
  const rafRef = useRef(0);
  const streamRef = useRef(null);
  const overlayHideRef = useRef(0);

  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('auto'); // auto | detector | zxing

  // Visual feedback state
  const [flash, setFlash] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [resultKind, setResultKind] = useState(null); // 'accepted' | 'invalid' | 'duplicate'

  const emitError = (msg) => {
    setError(msg);
    if (typeof onError === 'function') onError(msg);
  };

  const showResult = (kind) => {
    setResultKind(kind);
    setShowOverlay(true);
    setFlash(true);
    if (overlayHideRef.current) clearTimeout(overlayHideRef.current);
    overlayHideRef.current = window.setTimeout(() => {
      setShowOverlay(false);
      setFlash(false);
    }, 1000);
  };

  const emit = async (raw) => {
    const value = String(raw ?? '').trim();
    if (!value) return;

    if (value === lastRef.current.value) {
      return;
    }
    lastRef.current.value = value;

    let res = undefined;
    try {
      res = typeof onCode === 'function' ? (await onCode(value)) : undefined;
    } catch {
      res = 'invalid';
    }

    const kind = (res === true || res === 'accepted') ? 'accepted'
      : (res === 'duplicate') ? 'duplicate'
      : (res === false || res === 'invalid') ? 'invalid'
      : 'accepted';

    showResult(kind);
  };

  // Prepare BarcodeDetector if supported
  useEffect(() => {
    (async () => {
      if (!('BarcodeDetector' in window)) return;
      try {
        const supported = await (window.BarcodeDetector.getSupportedFormats?.() ?? []);
        if (Array.isArray(supported) && !supported.includes('qr_code')) return;
        detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
      } catch {
        // detector unavailable; we'll fallback later
      }
    })();
  }, []);

  // Auto-start scanner on mount
  useEffect(() => {
    setStarted(true);
  }, []);

  const stopAll = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (zxingControlsRef.current) {
      try { zxingControlsRef.current.stop(); } catch {}
      zxingControlsRef.current = null;
    }
    if (streamRef.current) {
      try { streamRef.current.getTracks().forEach(t => t.stop()); } catch {}
      streamRef.current = null;
    }
  };

  const startZXing = async (video) => {
    const { BrowserQRCodeReader } = await import('@zxing/browser');
    const reader = new BrowserQRCodeReader();
    zxingControlsRef.current = await reader.decodeFromVideoDevice(
      null,
      video,
      (result) => {
        if (result) emit(result.getText());
      }
    );
  };

  const startDetector = async (video) => {
    const tick = async () => {
      try {
        if (video.readyState >= 2 && detectorRef.current) {
          const results = await detectorRef.current.detect(video);
          if (results && results.length) {
            const r = results[0];
            emit(r.rawValue || r.text || '');
          }
        }
      } catch { /* ignore */ }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (!started) return;
    let fallbackTimer;

    (async () => {
      try {
        if (!window.isSecureContext) {
          emitError('Camera requires HTTPS (or http://localhost). Use https://<LAN-IP>:5001 and trust the certificate.');
          return;
        }

        const attempts = [
          { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
          { video: { facingMode: { exact: 'environment' } }, audio: false },
          { video: true, audio: false },
          { video: { facingMode: { ideal: 'user' } }, audio: false },
        ];
        let stream = null, lastErr;
        for (const c of attempts) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(c);
            break;
          } catch (e) { lastErr = e; }
        }
        if (!stream) {
          emitError(`Unable to access camera${lastErr ? `: ${lastErr.message || lastErr}` : ''}`);
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;
        await video.play().catch(() => {});

        const detectorAvailable = !!detectorRef.current;
        if (mode === 'zxing' || (!detectorAvailable && mode !== 'detector')) {
          await startZXing(video);
          return;
        }
        if (mode === 'detector' || (mode === 'auto' && detectorAvailable)) {
          await startDetector(video);
          if (mode === 'auto') {
            fallbackTimer = setTimeout(async () => {
              if (!zxingControlsRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = 0;
                try { await startZXing(video); } catch (e) { emitError(`ZXing fallback failed: ${e?.message || e}`); }
              }
            }, 3000);
          }
        }
      } catch (e) {
        emitError(e?.message || String(e));
      }
    })();

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      stopAll();
      if (overlayHideRef.current) clearTimeout(overlayHideRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, mode]);

  const overlayText = resultKind === 'accepted'
    ? 'Sigil accepted!'
    : resultKind === 'duplicate'
      ? 'Already offered...'
      : 'The spirits reject this code!';

  const overlayIcon = resultKind === 'invalid' ? '!' : '+';

  return (
    <ScannerContainer $flash={flash} $result={resultKind}>
      <Header>Scan the QR codes</Header>

      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          style={{ width: '100%', minHeight: 240, borderRadius: 8, background: 'black', objectFit: 'cover' }}
          autoPlay
        />
        <ResultOverlay $show={showOverlay}>
          <ResultBubble $result={resultKind}>
            <Icon $result={resultKind}>{overlayIcon}</Icon>
            {overlayText}
          </ResultBubble>
        </ResultOverlay>
      </div>

      {error && <ErrorMsg>{error}</ErrorMsg>}
    </ScannerContainer>
  );
}
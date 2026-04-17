import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';

export default function ArMindImage({
  targetSrc = null,
  modelSrc = '/ar/black_demon/scene.gltf',
  onDetected,
  onClose,         // called when the user taps the exit button
  detectedClue,    // text shown as an overlay once the target is found
  audioSrc = null,
  // Keep these optional; avoid passing new THREE.* from parents
  modelPosition,
  modelRotationEuler,
  modelScale = 1.0
}) {
  const containerRef = useRef(null);
  const mindarRef = useRef(null);
  const rendererRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const startedRef = useRef(false);
  const audioRef = useRef(null);

  const [status, setStatus] = useState('Initializing AR...');
  const [error, setError] = useState('');
  const [targetFound, setTargetFound] = useState(false);

  const handleClose = () => {
    try { rendererRef.current?.setAnimationLoop(null); } catch {}
    try {
      const mindar = mindarRef.current;
      if (mindar) {
        try { disposeObject(mindar.scene); } catch {}
        mindar.stop?.();
      }
    } catch {}
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    } catch {}
    const el = containerRef.current;
    if (el) el.innerHTML = '';
    startedRef.current = false;
    onClose && onClose();
  };

  // Create stable defaults once to avoid re-running the effect
  const pos = useMemo(() => {
    if (modelPosition instanceof THREE.Vector3) return modelPosition.clone();
    if (Array.isArray(modelPosition) && modelPosition.length === 3) return new THREE.Vector3(...modelPosition);
    return new THREE.Vector3(0, 0, 0);
  }, [/* intentionally empty to remain stable unless prop identity truly changes */]);

  const rot = useMemo(() => {
    if (modelRotationEuler instanceof THREE.Euler) return modelRotationEuler.clone();
    if (Array.isArray(modelRotationEuler) && modelRotationEuler.length === 3) return new THREE.Euler(modelRotationEuler[0], modelRotationEuler[1], modelRotationEuler[2], 'XYZ');
    return new THREE.Euler(0, 0, 0, 'XYZ');
  }, [/* stable */]);

  // Helper to dispose three resources
  const disposeObject = (obj) => {
    try {
      obj.traverse((n) => {
        if (n.isMesh) {
          if (n.geometry) {
            n.geometry.dispose?.();
          }
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m) => {
            if (!m) return;
            // dispose textures if present
            ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'alphaMap'].forEach((k) => {
              if (m[k]?.dispose) m[k].dispose();
            });
            m.dispose?.();
          });
        }
      });
    } catch { /* ignore */ }
  };

  useEffect(() => {
    let stopped = false;

    (async () => {
      try {
        if (startedRef.current) {
          // Already started (prevents double init in StrictMode)
          return;
        }
        startedRef.current = true;

        if (!window.isSecureContext) {
          setError('Camera requires HTTPS (or http://localhost). Open with https://<host>:<port> and trust the cert.');
          return;
        }

        if (!targetSrc) {
          setError('No AR target file selected. Please configure a .mind file for this riddle in the settings.');
          return;
        }

        setStatus(`Loading AR target: ${targetSrc}...`);
        const mindarThree = new MindARThree({
          container: containerRef.current,
          imageTargetSrc: targetSrc
        });
        mindarRef.current = mindarThree;

        const { renderer, scene, camera } = mindarThree;
        rendererRef.current = renderer;

        // Minimal lighting
        const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
        hemi.position.set(0, 1, 0);
        scene.add(hemi);
        const dir = new THREE.DirectionalLight(0xffffff, 0.6);
        dir.position.set(1, 2, 1);
        scene.add(dir);

        const anchor = mindarThree.addAnchor(0);

        setStatus('Loading model...');
        const loader = new GLTFLoader();
        const gltf = await new Promise((resolve, reject) => {
          loader.load(
            modelSrc,
            resolve,
            undefined,
            (e) => reject(new Error(`Failed to load model ${modelSrc}: ${e?.message || e}`))
          );
        });

        const model = gltf.scene || gltf.scenes?.[0];
        if (!model) throw new Error('GLTF has no scene.');

        model.traverse((o) => {
          if (o.isMesh) {
            o.frustumCulled = false;
            o.castShadow = false;
            o.receiveShadow = false;
          }
        });

        // Apply transforms (from memoized pos/rot)
        model.position.copy(pos);
        model.rotation.copy(rot);
        model.scale.setScalar(modelScale);

        anchor.group.add(model);

        if (gltf.animations?.length) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        let seen = false;
        anchor.onTargetFound = () => {
          if (!seen) {
            setStatus('Target found');
            setTargetFound(true);
            onDetected && onDetected();
            if (audioSrc) {
              try {
                const audio = new Audio(audioSrc);
                audioRef.current = audio;
                audio.play().catch(e => console.warn('AR audio play failed:', e));
              } catch (e) {
                console.warn('AR audio init failed:', e);
              }
            }
          }
          seen = true;
        };
        anchor.onTargetLost = () => setStatus('Point the camera at the marker');

        renderer.setAnimationLoop(() => {
          const delta = clockRef.current.getDelta();
          mixerRef.current?.update(delta);
          renderer.render(scene, camera);
        });

        setStatus('Starting camera...');
        await mindarThree.start();
        setStatus('Point the camera at the marker');
      } catch (e) {
        console.error('MindAR init failed:', e);
        console.error('Target file attempted:', targetSrc);
        console.error('Full error details:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
        setError(`${e?.message || String(e)} (Target: ${targetSrc})`);
      }
    })();

    return () => {
      stopped = true;
      try {
        const mindar = mindarRef.current;
        if (mindar) {
          // dispose attached content
          try { disposeObject(mindar.scene); } catch {}
          mindar.stop?.();
        }
      } catch {}
      try { rendererRef.current?.setAnimationLoop(null); } catch {}
      // Clear DOM container
      const el = containerRef.current;
      if (el) el.innerHTML = '';
      startedRef.current = false;
    };
    // Only re-run if target/model URL or scale change; transforms are applied without restarting
    // Do NOT include pos/rot objects in deps to keep this stable
  }, [targetSrc, modelSrc, modelScale, onDetected]);

  return (
    <>
      <div
        ref={containerRef}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'black', touchAction: 'none' }}
      >
        {/* Status / error banner */}
        {(status || error) && (
          <div style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid rgba(255,107,26,0.5)',
            pointerEvents: 'none'
          }}>
            {error ? `Error: ${error}` : status}
          </div>
        )}
      </div>

      {/* Exit button — outside containerRef so innerHTML='' cannot remove it */}
      {onClose && (
        <button
          onClick={handleClose}
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 9999,
            touchAction: 'auto',
            background: 'rgba(139,0,0,0.92)',
            color: '#ff6b1a',
            border: '2px solid #ff6b1a',
            borderRadius: 8,
            padding: '10px 18px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 0 12px rgba(255,107,26,0.4)',
          }}
        >
          {targetFound ? 'Exit AR & Continue →' : 'Exit AR'}
        </button>
      )}

      {/* Clue overlay — outside containerRef for the same reason */}
      {targetFound && detectedClue && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: 16,
          right: 16,
          background: 'rgba(0,0,0,0.88)',
          color: '#dedede',
          border: '2px solid #ff6b1a',
          borderRadius: 12,
          padding: '1rem 1.25rem',
          fontSize: '1.05rem',
          zIndex: 9999,
          textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          boxShadow: '0 0 24px rgba(255,107,26,0.4)',
          lineHeight: 1.5,
          pointerEvents: 'none',
        }}>
          <div style={{ color: '#ff6b1a', fontWeight: 'bold', fontSize: '1.15rem', marginBottom: 8 }}>
            👻 Clue Revealed!
          </div>
          {detectedClue}
        </div>
      )}
    </>
  );
}
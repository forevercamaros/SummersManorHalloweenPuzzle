// Defensive shims to avoid Android-only torch/flash crashes

(function () {
  if (typeof window === 'undefined') return;

  // 1) Patch ImageCapture.setOptions / setPhotoOptions to never reject
  const IC = window.ImageCapture;
  if (IC && IC.prototype) {
    const fnName =
      typeof IC.prototype.setOptions === 'function'
        ? 'setOptions'
        : (typeof IC.prototype.setPhotoOptions === 'function' ? 'setPhotoOptions' : null);

    if (fnName) {
      const original = IC.prototype[fnName];
      if (typeof original === 'function') {
        IC.prototype[fnName] = function (options) {
          try {
            const p = original.call(this, options);
            if (p && typeof p.then === 'function') {
              // Swallow Android rejections when torch/fillLightMode isn’t supported
              return p.catch(() => Promise.resolve());
            }
            return Promise.resolve();
          } catch {
            return Promise.resolve();
          }
        };
      }
    }
  }

  // 2) Patch MediaStreamTrack.applyConstraints to strip torch/fillLightMode and swallow related rejections
  const MST = window.MediaStreamTrack;
  if (MST && MST.prototype && typeof MST.prototype.applyConstraints === 'function') {
    const origApply = MST.prototype.applyConstraints;
    MST.prototype.applyConstraints = function (constraints) {
      let c = constraints || {};

      // Remove direct torch/fillLightMode
      if ('torch' in c || 'fillLightMode' in c) {
        c = { ...c };
        delete c.torch;
        delete c.fillLightMode;
      }

      // Remove from advanced constraints
      if (Array.isArray(c.advanced) && c.advanced.length) {
        const cleanedAdvanced = c.advanced
          .map(a => {
            const x = { ...a };
            delete x.torch;
            delete x.fillLightMode;
            return x;
          })
          .filter(a => Object.keys(a).length > 0);
        c = { ...c, advanced: cleanedAdvanced };
        if (cleanedAdvanced.length === 0) delete c.advanced;
      }

      try {
        const p = origApply.call(this, c);
        if (p && typeof p.then === 'function') {
          return p.catch(err => {
            const msg = String(err?.message || err || '').toLowerCase();
            if (msg.includes('torch') || msg.includes('filllight') || msg.includes('fill light')) {
              // Ignore unsupported torch/fillLight failures
              return Promise.resolve();
            }
            return Promise.reject(err);
          });
        }
        return Promise.resolve();
      } catch (err) {
        const msg = String(err?.message || err || '').toLowerCase();
        if (msg.includes('torch') || msg.includes('filllight') || msg.includes('fill light')) {
          return Promise.resolve();
        }
        throw err;
      }
    };
  }

  // 3) Last-resort: silence specific global errors from older libs
  const shouldSilence = (message) => {
    const s = String(message || '').toLowerCase();
    return s.includes('setphotooptions failed') || s.includes('setoptions') && s.includes('failed') || s.includes('torch');
  };

  window.addEventListener('unhandledrejection', (ev) => {
    const reason = ev?.reason;
    const msg = reason?.message ?? reason;
    if (shouldSilence(msg)) {
      ev.preventDefault();
    }
  });

  window.addEventListener('error', (ev) => {
    if (shouldSilence(ev?.message)) {
      ev.preventDefault();
      return true;
    }
    return false;
  }, true);
})();
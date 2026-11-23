/**
 * Lightweight Web Audio API silent keep-alive manager.
 * Running an ultra-low-gain AudioContext graph while HTML5 audio is actively playing
 * prevents Android WebView and mobile browsers from suspending timers/media pipelines
 * when the screen locks or the app is backgrounded.
 */

let audioCtx: AudioContext | null = null;
let oscNode: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let isKeepAliveActive = false;

function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const win = window as Window & {webkitAudioContext?: typeof AudioContext};
  return window.AudioContext || win.webkitAudioContext || null;
}

export function startAudioKeepAlive(): void {
  const Ctor = getAudioContextConstructor();
  if (!Ctor) return;

  try {
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new Ctor();
      oscNode = null;
      gainNode = null;
      isKeepAliveActive = false;
    }

    if (!oscNode || !gainNode) {
      gainNode = audioCtx.createGain();
      // Practically inaudible non-zero gain keeps the audio graph alive on Chromium/Android WebView
      gainNode.gain.value = 0.00001;
      gainNode.connect(audioCtx.destination);

      oscNode = audioCtx.createOscillator();
      oscNode.type = 'sine';
      oscNode.frequency.value = 1;
      oscNode.connect(gainNode);
      oscNode.start();
    }

    if (audioCtx.state === 'suspended') {
      void audioCtx.resume().catch(() => {
        // Browsers may defer resume until a direct user gesture
      });
    }
    isKeepAliveActive = true;
  } catch {
    // Graceful no-op in headless/restricted environments without Web Audio output
  }
}

export function stopAudioKeepAlive(): void {
  if (!audioCtx || audioCtx.state === 'closed') {
    isKeepAliveActive = false;
    return;
  }
  try {
    if (audioCtx.state === 'running') {
      void audioCtx.suspend().catch(() => {
        // Ignore suspend errors during teardown
      });
    }
  } catch {
    // Ignore
  }
  isKeepAliveActive = false;
}

export function disposeAudioKeepAlive(): void {
  try {
    oscNode?.stop();
    oscNode?.disconnect();
    gainNode?.disconnect();
    if (audioCtx && audioCtx.state !== 'closed') {
      void audioCtx.close().catch(() => {});
    }
  } catch {
    // Ignore cleanup errors
  } finally {
    oscNode = null;
    gainNode = null;
    audioCtx = null;
    isKeepAliveActive = false;
  }
}

export function isAudioKeepAliveRunning(): boolean {
  return isKeepAliveActive && audioCtx?.state === 'running';
}

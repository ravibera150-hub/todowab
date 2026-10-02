/**
 * =========================================================================
 * Audio Utilities (utils/audio.js)
 * =========================================================================
 * Uses Web Audio API to synthesize notification chimes and beeps in real-time.
 * 
 * VIVA EXPLANATION:
 * - Web Audio API is built into modern browsers.
 * - Generating audio programmatically eliminates external asset dependencies,
 *   reducing network requests and working 100% offline.
 */

class SoundEffects {
  constructor() {
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Play an uplifting chime when a task is marked complete
   */
  playTaskComplete() {
    try {
      this.init();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.35);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Play an alert chime when Pomodoro timer finishes or task becomes overdue
   */
  playTimerAlert() {
    try {
      this.init();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [880, 880, 880, 1174.66]; // A5, A5, A5, D6 celebratory fanfare

      notes.forEach((freq, index) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.15);

        gain.gain.setValueAtTime(0, now + index * 0.15);
        gain.gain.linearRampToValueAtTime(0.2, now + index * 0.15 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.15 + 0.4);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + index * 0.15);
        osc.stop(now + index * 0.15 + 0.45);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }
}

export const soundEffects = new SoundEffects();

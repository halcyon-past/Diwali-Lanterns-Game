'use client';

/**
 * Procedural Diwali Festive Background Music & Sound FX Engine
 * Uses Web Audio API for zero dependencies, instant loading, and authentic acoustic warmth.
 */

class DiwaliAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;
  private step = 0;

  // Joyous Diwali melodic notes (Raag Bhupali / Mohanam - Pentatonic celebration: C4, D4, E4, G4, A4, C5, D5, E5)
  private melodyNotes = [
    523.25, 587.33, 659.25, 783.99, 880.0, // C5, D5, E5, G5, A5
    1046.5, 880.0, 783.99, 659.25, 587.33,
    659.25, 783.99, 880.0, 1046.5, 1174.66,
    1046.5, 880.0, 783.99, 659.25, 523.25,
    392.0, 440.0, 523.25, 659.25, 783.99,  // G4, A4, C5, E5, G5
    880.0, 783.99, 659.25, 523.25, 392.0,
    523.25, 659.25, 783.99, 880.0, 1046.5
  ];

  // Tanpura acoustic base frequencies (Sa, Pa drone)
  private droneFrequencies = [130.81, 196.0, 261.63]; // C3, G3, C4

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Start joyful Diwali background melody loop
   */
  public start() {
    this.initContext();
    if (this.isPlaying || !this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.step = 0;

    // Start soothing warm tanpura drone
    this.startDrone();

    // Start joyous rhythmic melody
    const intervalMs = 280; // upbeat, cheerful festive tempo
    this.timerId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      this.playMelodyStep();
    }, intervalMs);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Tanpura drone with gentle warmth
   */
  private startDrone() {
    if (!this.ctx || !this.masterGain) return;

    this.droneFrequencies.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      // Subtle slow pulsing detune
      osc.detune.setValueAtTime(idx * 2 - 2, this.ctx!.currentTime);

      gain.gain.setValueAtTime(0.04, this.ctx!.currentTime);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();
    });
  }

  /**
   * Plays a single plucked sitar/flute festive note in rhythm
   */
  private playMelodyStep() {
    if (!this.ctx || !this.masterGain) return;

    const noteFreq = this.melodyNotes[this.step % this.melodyNotes.length];
    const now = this.ctx.currentTime;

    // Sitar / Bansuri hybrid synth note
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    // Warm cheerful tone
    osc.type = this.step % 3 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(noteFreq, now);

    // Ornamented pitch bend (Meend / Gamak)
    if (this.step % 4 === 1) {
      osc.frequency.exponentialRampToValueAtTime(noteFreq * 1.05, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(noteFreq, now + 0.22);
    }

    // Envelope
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);

    // Subtle festive ankle bell / ghungroo chime every 4 steps
    if (this.step % 4 === 0) {
      this.playGhungrooChime(now);
    }

    this.step++;
  }

  /**
   * Delicate high-pitched temple bell / ghungroo chime
   */
  private playGhungrooChime(time: number) {
    if (!this.ctx || !this.masterGain) return;

    const chimeFreqs = [2093.0, 2637.0, 3136.0]; // High C7, E7, G7
    chimeFreqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.015, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + 0.2);
    });
  }

  /**
   * Sound FX: Sparkling ascent sound when a lantern rises into the sky
   */
  public playLanternAscent() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 1.2);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.5);
  }

  /**
   * Sound FX: Joyous celebration burst when answers match!
   */
  public playCelebrationChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // Major chord arpeggio C-E-G-C-E

    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.65);
    });
  }
}

export const diwaliAudio = new DiwaliAudioEngine();

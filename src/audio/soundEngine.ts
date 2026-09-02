/**
 * Procedural Web Audio API Synthesizer for Retro Neon Arcade
 * Generates crisp 8-bit / Synthwave sound effects and dynamic background music without external assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;

  public isMuted: boolean = false;
  public sfxVolume: number = 0.7;
  public bgmVolume: number = 0.4;
  public isBgmRunning: boolean = false;

  private bgmInterval: number | null = null;
  private bgmStep: number = 0;
  private isBossBgm: boolean = false;

  constructor() {
    // Lazy init audio context on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public unlockAudio() {
    this.initCtx();
  }

  public setVolume(sfx: number, bgm: number) {
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.bgmVolume = Math.max(0, Math.min(1, bgm));
    if (this.ctx && this.sfxGain && this.bgmGain) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
      this.bgmGain.gain.setTargetAtTime(this.bgmVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  // --- SOUND EFFECTS ---

  public playLaser(type: 'blaster' | 'spread' | 'laser' | 'missile' = 'blaster') {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    if (type === 'blaster') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.13);
    } else if (type === 'spread') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.14);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.15);
    } else if (type === 'laser') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.linearRampToValueAtTime(400, t + 0.08);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.09);
    } else if (type === 'missile') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(800, t + 0.18);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.19);
    }
  }

  public playEnemyShot() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playExplosion(intensity: 'small' | 'medium' | 'large' | 'boss' = 'small') {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const duration = intensity === 'boss' ? 1.4 : intensity === 'large' ? 0.6 : intensity === 'medium' ? 0.35 : 0.2;
    const t = this.ctx.currentTime;

    // White noise buffer for explosion rumble
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(intensity === 'boss' ? 400 : 700, t);
    filter.frequency.exponentialRampToValueAtTime(30, t + duration);

    const gain = this.ctx.createGain();
    const startVolume = intensity === 'boss' ? 0.7 : intensity === 'large' ? 0.5 : 0.35;
    gain.gain.setValueAtTime(startVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + duration);

    // Add sub-bass punch for boss or large explosions
    if (intensity === 'boss' || intensity === 'large') {
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(intensity === 'boss' ? 140 : 110, t);
      subOsc.frequency.exponentialRampToValueAtTime(25, t + duration * 0.8);

      subGain.gain.setValueAtTime(0.6, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.8);

      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(t);
      subOsc.stop(t + duration * 0.8);
    }
  }

  public playPowerup() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 arpeggio
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.05);

      gain.gain.setValueAtTime(0.3, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (i + 1) * 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + i * 0.05);
      osc.stop(t + (i + 1) * 0.09);
    });
  }

  public playCoin() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Bright double-chime bell
    const chime1 = this.ctx.createOscillator();
    const chime2 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    chime1.type = 'sine';
    chime1.frequency.setValueAtTime(987.77, t); // B5
    gain1.gain.setValueAtTime(0.25, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    chime2.type = 'sine';
    chime2.frequency.setValueAtTime(1318.51, t + 0.06); // E6
    gain2.gain.setValueAtTime(0.3, t + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    chime1.connect(gain1);
    gain1.connect(this.sfxGain);
    chime2.connect(gain2);
    gain2.connect(this.sfxGain);

    chime1.start(t);
    chime1.stop(t + 0.16);
    chime2.start(t + 0.06);
    chime2.stop(t + 0.26);
  }

  public playHealthPickup() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.04);

      gain.gain.setValueAtTime(0.25, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (i + 1) * 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + i * 0.04);
      osc.stop(t + (i + 1) * 0.08);
    });
  }

  public playShieldHit() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.linearRampToValueAtTime(300, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playBomb() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Sub rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(200, t);
    subOsc.frequency.exponentialRampToValueAtTime(20, t + 1.2);

    subGain.gain.setValueAtTime(0.8, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t);
    subOsc.stop(t + 1.2);

    // High sweep
    const sweepOsc = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(1600, t);
    sweepOsc.frequency.exponentialRampToValueAtTime(60, t + 0.9);

    sweepGain.gain.setValueAtTime(0.4, t);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    sweepOsc.connect(sweepGain);
    sweepGain.connect(this.sfxGain);
    sweepOsc.start(t);
    sweepOsc.stop(t + 0.9);
  }

  public playOverdrive() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.5);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  public playWarningSiren() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const startTime = t + i * 0.35;
      osc.frequency.setValueAtTime(400, startTime);
      osc.frequency.linearRampToValueAtTime(900, startTime + 0.17);
      osc.frequency.linearRampToValueAtTime(400, startTime + 0.34);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.34);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    }
  }

  public playUIClick() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // --- DYNAMIC PROCEDURAL SYNTHWAVE MUSIC ---

  public startBGM(isBoss: boolean = false) {
    this.initCtx();
    this.isBossBgm = isBoss;
    if (this.isBgmRunning && this.bgmInterval) {
      return;
    }
    this.isBgmRunning = true;
    this.bgmStep = 0;

    const tempo = isBoss ? 135 : 120;
    const stepDurationMs = (60 / tempo / 4) * 1000; // 16th notes

    this.bgmInterval = window.setInterval(() => {
      this.tickBGM();
    }, stepDurationMs);
  }

  public setBossMusic(isBoss: boolean) {
    if (this.isBossBgm !== isBoss) {
      this.isBossBgm = isBoss;
      this.stopBGM();
      this.startBGM(isBoss);
    }
  }

  public stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmRunning = false;
  }

  private tickBGM() {
    if (!this.ctx || !this.bgmGain || this.isMuted || !this.isBgmRunning) {
      this.bgmStep++;
      return;
    }

    const t = this.ctx.currentTime;
    const step = this.bgmStep % 32;

    // Bassline notes (Synthwave minor bass progression: Am -> F -> G -> Em or Boss Dm -> Bb -> C -> A)
    const normalBass = [
      110, 110, 220, 110,  110, 110, 164.8, 110, // A
      87.3, 87.3, 174.6, 87.3, 87.3, 87.3, 130.8, 87.3, // F
      98, 98, 196, 98,    98, 98, 146.8, 98, // G
      82.4, 82.4, 164.8, 82.4, 82.4, 82.4, 123.5, 82.4 // E
    ];

    const bossBass = [
      73.4, 73.4, 146.8, 73.4, 73.4, 146.8, 110, 73.4, // D
      58.3, 58.3, 116.5, 58.3, 58.3, 116.5, 87.3, 58.3, // Bb
      65.4, 65.4, 130.8, 65.4, 65.4, 130.8, 98, 65.4, // C
      55.0, 55.0, 110.0, 55.0, 110.0, 164.8, 220.0, 110.0 // A
    ];

    const bassFreq = this.isBossBgm ? bossBass[step] : normalBass[step];

    // Bass Synth
    if (bassFreq) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = this.isBossBgm ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(bassFreq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(this.isBossBgm ? 800 : 500, t);
      filter.frequency.exponentialRampToValueAtTime(120, t + 0.12);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + 0.13);
    }

    // Kick Drum on beats 0, 4, 8, 12, 16, 20, 24, 28
    if (step % 4 === 0) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(140, t);
      kickOsc.frequency.exponentialRampToValueAtTime(30, t + 0.15);

      kickGain.gain.setValueAtTime(0.4, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      kickOsc.connect(kickGain);
      kickGain.connect(this.bgmGain);
      kickOsc.start(t);
      kickOsc.stop(t + 0.16);
    }

    // Snare / Clap on beats 4, 12, 20, 28
    if (step % 8 === 4) {
      const snareBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.1), this.ctx.sampleRate);
      const data = snareBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

      const snareSource = this.ctx.createBufferSource();
      snareSource.buffer = snareBuffer;

      const snareFilter = this.ctx.createBiquadFilter();
      snareFilter.type = 'highpass';
      snareFilter.frequency.setValueAtTime(1000, t);

      const snareGain = this.ctx.createGain();
      snareGain.gain.setValueAtTime(0.25, t);
      snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      snareSource.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(this.bgmGain);

      snareSource.start(t);
      snareSource.stop(t + 0.11);
    }

    // Hi-hat on off-beats
    if (step % 2 === 1) {
      const hihatBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.03), this.ctx.sampleRate);
      const data = hihatBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.3;

      const hihatSource = this.ctx.createBufferSource();
      hihatSource.buffer = hihatBuffer;

      const hihatFilter = this.ctx.createBiquadFilter();
      hihatFilter.type = 'highpass';
      hihatFilter.frequency.setValueAtTime(7000, t);

      const hihatGain = this.ctx.createGain();
      hihatGain.gain.setValueAtTime(0.08, t);
      hihatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      hihatSource.connect(hihatFilter);
      hihatFilter.connect(hihatGain);
      hihatGain.connect(this.bgmGain);

      hihatSource.start(t);
      hihatSource.stop(t + 0.04);
    }

    // Arpeggio Lead synth on every 2 steps
    if (step % 2 === 0) {
      const arpScaleNormal = [440, 523.25, 659.25, 783.99, 880, 1046.5];
      const arpScaleBoss = [293.66, 349.23, 440, 523.25, 587.33, 698.46];
      const scale = this.isBossBgm ? arpScaleBoss : arpScaleNormal;
      const arpNote = scale[(step / 2) % scale.length];

      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = 'sawtooth';
      leadOsc.frequency.setValueAtTime(arpNote, t);

      leadGain.gain.setValueAtTime(this.isBossBgm ? 0.09 : 0.06, t);
      leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      leadOsc.connect(leadGain);
      leadGain.connect(this.bgmGain);

      leadOsc.start(t);
      leadOsc.stop(t + 0.11);
    }

    this.bgmStep++;
  }
}

export const sound = new SoundEngine();

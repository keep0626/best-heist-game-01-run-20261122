// audio.js — all sound is synthesized with WebAudio oscillators.
// No audio files, no network: every blip, alarm swell and jingle is
// built from a few sine/triangle waves at run time.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.alarmOsc = null;
    this.alarmGain = null;
  }

  unlock() {
    if (!this.ctx) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        this.ctx = new Ctor();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopAlarmHum();
    return this.muted;
  }

  blip(freq, dur, type, vol, when = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  pickup() { this.blip(880, 0.12, 'sine', 0.14); this.blip(1318, 0.16, 'sine', 0.1, 0.07); }
  coin() { this.blip(1180, 0.07, 'triangle', 0.09); }
  unlockCase() { this.blip(520, 0.1, 'triangle', 0.12); this.blip(780, 0.14, 'triangle', 0.1, 0.09); }
  smoke() { this.blip(220, 0.3, 'sawtooth', 0.05); this.blip(160, 0.35, 'sawtooth', 0.05, 0.08); }
  jammer() { this.blip(1400, 0.08, 'square', 0.05); this.blip(900, 0.1, 'square', 0.05, 0.07); }
  denied() { this.blip(180, 0.18, 'square', 0.08); }
  step() { this.blip(90 + Math.random() * 30, 0.05, 'sine', 0.03); }

  winJingle() {
    [523, 659, 784, 1046].forEach((f, i) => this.blip(f, 0.22, 'triangle', 0.13, i * 0.13));
  }

  caughtSting() {
    [392, 311, 233, 155].forEach((f, i) => this.blip(f, 0.3, 'sawtooth', 0.09, i * 0.16));
  }

  // A low pulsing hum while the alarm is high; pitch follows the meter.
  startAlarmHum(level) {
    if (!this.ctx || this.muted) return;
    if (!this.alarmOsc) {
      this.alarmOsc = this.ctx.createOscillator();
      this.alarmGain = this.ctx.createGain();
      this.alarmOsc.type = 'sawtooth';
      this.alarmOsc.frequency.value = 110;
      this.alarmGain.gain.value = 0.0;
      this.alarmOsc.connect(this.alarmGain).connect(this.ctx.destination);
      this.alarmOsc.start();
    }
    const target = 0.02 + level * 0.0006;
    this.alarmGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.2);
    this.alarmOsc.frequency.setTargetAtTime(110 + level * 1.1, this.ctx.currentTime, 0.2);
  }

  stopAlarmHum() {
    if (this.alarmOsc) {
      try { this.alarmOsc.stop(); } catch (e) { /* already stopped */ }
      this.alarmOsc = null;
      this.alarmGain = null;
    }
  }
}

// ============================================================
// Звуковой дизайн на WebAudio — полностью синтез, без файлов.
// Выключен по умолчанию, тумблер в HUD («ЗВУК»), состояние в localStorage.
// ============================================================

export class AudioFX {
  constructor() {
    this.enabled = false;
    this.ctx = null;
    this.last = 0;
    try { this.enabled = localStorage.getItem('azoth-sound') === '1'; } catch (e) { /* noop */ }
  }

  _ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  }

  setEnabled(on) {
    this.enabled = !!on;
    try { localStorage.setItem('azoth-sound', this.enabled ? '1' : '0'); } catch (e) { /* noop */ }
    if (this.enabled) this.chirp();
  }

  _blip(freq, dur, vol, type = 'sine', glide = 0.7, when = 0) {
    if (!this.enabled || !this._ensure()) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * glide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  // короткий тик на hover
  blip(freq = 1250, dur = 0.05, vol = 0.03) {
    if (!this.enabled) return;
    const t = performance.now();
    if (t - this.last < 50) return;
    this.last = t;
    this._blip(freq, dur, vol);
  }

  // «вжух» на шейдерном переходе
  whoosh() {
    if (!this.enabled || !this._ensure()) return;
    const dur = 0.5;
    const t = this.ctx.currentTime;
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * dur), this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.1;
    f.frequency.setValueAtTime(280, t);
    f.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.7);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.045, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.ctx.destination);
    src.start(t);
  }

  // подтверждение действия (копирование, заявка)
  chirp() {
    this._blip(880, 0.09, 0.035, 'sine', 1.0);
    this._blip(1320, 0.12, 0.028, 'sine', 1.0, 0.07);
  }

  // открытие кейса
  pop() {
    this._blip(340, 0.14, 0.05, 'triangle', 0.4);
  }
}

type AudioCtor = typeof AudioContext;

interface WindowWithWebkit extends Window {
  webkitAudioContext?: AudioCtor;
}

/**
 * Calm, looping ambient music generated with the Web Audio API (original,
 * royalty-free). To use your own track, drop it in `public/audio/` and set
 * CUSTOM_TRACK below to its path (e.g. "/audio/theme.mp3").
 */
const CUSTOM_TRACK: string | null = "/audio/theme.mp3";

class AmbientMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private timer: number | null = null;
  private started = false;
  private muted = false;

  private readonly baseVolume = 0.09;

  get isStarted() {
    return this.started;
  }

  get isMuted() {
    return this.muted;
  }

  async start() {
    if (this.started) {
      this.resume();
      return;
    }
    this.started = true;

    const Ctx = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
    if (Ctx) {
      this.ctx = new Ctx();
      try {
        await this.ctx.resume();
      } catch {
        /* ignore */
      }
    }

    // Use a user-provided track when configured.
    if (CUSTOM_TRACK) {
      try {
        const el = new Audio(CUSTOM_TRACK);
        el.loop = true;
        el.volume = this.muted ? 0 : 0.4;
        await el.play();
        this.audioEl = el;
        return;
      } catch {
        /* fall through to generated music */
      }
    }

    this.startProcedural();
  }

  private resume() {
    if (this.audioEl && this.audioEl.paused) this.audioEl.play().catch(() => {});
    if (this.ctx?.state === "suspended") this.ctx.resume().catch(() => {});
  }

  private startProcedural() {
    if (!this.ctx) return;
    if (!this.master) {
      const master = this.ctx.createGain();
      master.gain.value = this.muted ? 0 : this.baseVolume;
      master.connect(this.ctx.destination);
      this.master = master;
    }
    this.scheduleLoop();
    this.timer = window.setInterval(() => this.scheduleLoop(), 12000);
  }

  private scheduleLoop() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.12;
    this.master.gain.setTargetAtTime(this.muted ? 0 : this.baseVolume, t0, 0.3);

    const chords = [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
      [196.0, 246.94, 293.66, 349.23],
    ];
    const melody = [
      [523.25, 0, 0, 659.25],
      [587.33, 0, 0, 440.0],
      [392.0, 0, 0, 523.25],
      [493.88, 0, 0, 392.0],
    ];

    for (let bar = 0; bar < 4; bar++) {
      const start = t0 + bar * 3;
      for (const f of chords[bar]) this.pad(f, start, 3.4);
      const notes = melody[bar];
      for (let i = 0; i < notes.length; i++) {
        if (notes[i]) this.bell(notes[i], start + i * 0.75, 1.7);
      }
    }
  }

  private pad(freq: number, when: number, dur: number) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.11, when + 1.3);
    g.gain.linearRampToValueAtTime(0, when + dur);

    osc.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    osc.start(when);
    osc.stop(when + dur + 0.1);
  }

  private bell(freq: number, when: number, dur: number) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(0.07, when + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0008, when + dur);

    osc.connect(g);
    g.connect(this.master);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.audioEl) this.audioEl.volume = muted ? 0 : 0.4;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(
        muted ? 0 : this.baseVolume,
        this.ctx.currentTime,
        0.2,
      );
    }
  }

  dispose() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.audioEl?.pause();
    this.ctx?.close().catch(() => {});
  }
}

export const ambientMusic = new AmbientMusic();

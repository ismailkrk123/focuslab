/**
 * Focuslab - Spotify-Style Single Track Ambient Player & Synthesizer
 */

const TRACKS_METADATA = [
  { id: 'lofi', name: 'Lo-Fi Chill & Akustik Piyano', icon: '🎵', duration: 1800, desc: 'Sıcak vinil dokulu elektrik piyano akorları' },
  { id: 'rain', name: 'Gece Yağmuru & Sağanak', icon: '🌧️', duration: 1800, desc: 'Derin gök gürültüsü ve yumuşak cam damlaları' },
  { id: 'waves', name: 'Okyanus Dalgaları & Kıyı', icon: '🌊', duration: 1800, desc: 'Ritmik sahil dalgaları ve dingin esinti' },
  { id: 'fire', name: 'Şömine & Kamp Ateşi', icon: '🔥', duration: 1800, desc: 'Sıcak odun çatırtısı ve güven veren düşük frekans' },
  { id: 'cosmic', name: '432Hz Kozmik Odak Dalgası', icon: '🌌', duration: 1800, desc: 'Zihni derin odak durumuna geçiren çift sinüs dalgası' },
  { id: 'forest', name: 'Orman Kuşları & Nehir', icon: '🌲', duration: 1800, desc: 'Hafif akarsu şırıltısı ve doğal orman ambiyansı' }
];

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.masterVolume = 0.8;
    this.currentTrackId = 'lofi';
    this.isPlaying = false;
    this.activeNodes = [];
    this.lofiInterval = null;

    // Playback state
    this.playbackSeconds = 0;
    this.totalDurationSeconds = 1800; // 30 minutes
    this.sessionTimerLimit = 25 * 60; // 25 min default Pomodoro limit
    this.ticker = null;

    this.onStateChange = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  getTracks() {
    return TRACKS_METADATA;
  }

  getCurrentTrack() {
    return TRACKS_METADATA.find(t => t.id === this.currentTrackId) || TRACKS_METADATA[0];
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  // --- NOISE GENERATORS ---
  createNoiseBuffer(type = 'pink') {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.12;
        b6 = white * 0.115926;
      }
    } else {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.8;
      }
    }
    return buffer;
  }

  // --- SINGLE TRACK PLAYER (Spotify Style) ---
  playTrack(trackId) {
    this.stopCurrentAudio();
    this.init();
    this.currentTrackId = trackId;
    this.isPlaying = true;

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    trackGain.gain.exponentialRampToValueAtTime(0.65, this.ctx.currentTime + 1.0);
    trackGain.connect(this.masterGain);

    if (trackId === 'lofi') {
      const buffer = this.createNoiseBuffer('brown');
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(trackGain);
      source.start();

      this.startLofiChords(trackGain);
      this.activeNodes = [source, filter, gain, trackGain];
    } else if (trackId === 'rain') {
      const buffer = this.createNoiseBuffer('pink');
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(850, this.ctx.currentTime);

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(200, this.ctx.currentTime);

      source.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(trackGain);
      source.start();

      this.activeNodes = [source, lowpass, highpass, trackGain];
    } else if (trackId === 'waves') {
      const buffer = this.createNoiseBuffer('brown');
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(300, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      source.connect(filter);
      filter.connect(trackGain);
      source.start();
      lfo.start();

      this.activeNodes = [source, filter, lfo, lfoGain, trackGain];
    } else if (trackId === 'fire') {
      const buffer = this.createNoiseBuffer('brown');
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);

      source.connect(filter);
      filter.connect(trackGain);
      source.start();

      const crackle = setInterval(() => {
        if (!this.isPlaying || this.currentTrackId !== 'fire') return;
        if (Math.random() > 0.45) {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1400 + Math.random() * 2200, this.ctx.currentTime);
          g.gain.setValueAtTime(0.04, this.ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

          osc.connect(g);
          g.connect(this.masterGain);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.06);
        }
      }, 160);

      this.activeNodes = [source, filter, trackGain, { stop: () => clearInterval(crackle) }];
    } else if (trackId === 'cosmic') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(216, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(218.5, this.ctx.currentTime);

      osc1.connect(trackGain);
      osc2.connect(trackGain);
      osc1.start();
      osc2.start();

      this.activeNodes = [osc1, osc2, trackGain];
    } else if (trackId === 'forest') {
      const buffer = this.createNoiseBuffer('pink');
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      source.connect(filter);
      filter.connect(trackGain);
      source.start();

      this.activeNodes = [source, filter, trackGain];
    }

    this.startProgressTicker();
    this.notifyState();
  }

  startLofiChords(destination) {
    const chords = [
      [164.81, 196.00, 246.94, 293.66, 370.00], // Em9
      [130.81, 196.00, 246.94, 261.63, 329.63], // Cmaj7
      [110.00, 164.81, 220.00, 261.63, 329.63], // Am9
      [123.47, 185.00, 246.94, 293.66, 370.00]  // Bm7
    ];
    let idx = 0;
    const playChord = () => {
      if (!this.isPlaying || this.currentTrackId !== 'lofi' || !this.ctx) return;
      const notes = chords[idx];
      idx = (idx + 1) % chords.length;
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);

        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(0.06, now + 0.8);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(destination);

        osc.start(now + i * 0.04);
        osc.stop(now + 5.0);
      });
    };

    playChord();
    this.lofiInterval = setInterval(playChord, 5200);
  }

  stopCurrentAudio() {
    if (this.lofiInterval) {
      clearInterval(this.lofiInterval);
      this.lofiInterval = null;
    }
    if (this.activeNodes.length > 0) {
      this.activeNodes.forEach(n => {
        try {
          if (n.stop) n.stop();
          if (n.disconnect) n.disconnect();
        } catch (e) {}
      });
      this.activeNodes = [];
    }
  }

  pause() {
    this.stopCurrentAudio();
    this.isPlaying = false;
    clearInterval(this.ticker);
    this.notifyState();
  }

  resume() {
    if (!this.isPlaying) {
      this.playTrack(this.currentTrackId);
    }
  }

  toggle() {
    if (this.isPlaying) this.pause();
    else this.resume();
  }

  nextTrack() {
    const list = TRACKS_METADATA;
    const currentIdx = list.findIndex(t => t.id === this.currentTrackId);
    const nextIdx = (currentIdx + 1) % list.length;
    this.playTrack(list[nextIdx].id);
  }

  prevTrack() {
    const list = TRACKS_METADATA;
    const currentIdx = list.findIndex(t => t.id === this.currentTrackId);
    const prevIdx = (currentIdx - 1 + list.length) % list.length;
    this.playTrack(list[prevIdx].id);
  }

  seek(seconds) {
    this.playbackSeconds = Math.max(0, Math.min(this.totalDurationSeconds, seconds));
    this.notifyState();
  }

  setSessionLimitMinutes(mins) {
    this.sessionTimerLimit = mins > 0 ? mins * 60 : 0;
  }

  startProgressTicker() {
    clearInterval(this.ticker);
    this.ticker = setInterval(() => {
      this.playbackSeconds += 1;
      if (this.sessionTimerLimit > 0 && this.playbackSeconds >= this.sessionTimerLimit) {
        this.pause();
        this.playChime('complete');
        return;
      }
      this.notifyState();
    }, 1000);
  }

  notifyState() {
    if (this.onStateChange) {
      this.onStateChange({
        track: this.getCurrentTrack(),
        isPlaying: this.isPlaying,
        currentSeconds: this.playbackSeconds,
        totalSeconds: this.totalDurationSeconds
      });
    }
  }

  playChime(type = 'complete') {
    this.init();
    const now = this.ctx.currentTime;
    const freqs = type === 'complete' ? [523.25, 659.25, 783.99, 1046.50] : [783.99, 659.25, 523.25];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2 * this.masterVolume, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.75);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.8);
    });
  }
}

window.soundEngine = new SoundEngine();

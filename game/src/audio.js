import { AUDIO_ASSETS } from './audio-assets.js';

const DEFAULT_AUDIO_SETTINGS = {
  master: { volume: 80, muted: false },
  music: { volume: 38, muted: false },
  ambient: { volume: 32, muted: false },
};

const clampVolume = (value, fallback) => {
  const volume = Number(value);
  return Number.isFinite(volume) ? Math.min(100, Math.max(0, volume)) : fallback;
};

export function normalizeAudioSettings(saved = {}) {
  if (!saved || typeof saved !== 'object') saved = {};
  const ambient = saved.ambient || saved.effects || {};
  return {
    master: {
      volume: clampVolume(saved.master?.volume, DEFAULT_AUDIO_SETTINGS.master.volume),
      muted: Boolean(saved.master?.muted),
    },
    music: {
      volume: clampVolume(saved.music?.volume, DEFAULT_AUDIO_SETTINGS.music.volume),
      muted: Boolean(saved.music?.muted),
    },
    ambient: {
      volume: clampVolume(ambient.volume, DEFAULT_AUDIO_SETTINGS.ambient.volume),
      muted: Boolean(ambient.muted),
    },
  };
}

export function ambientLayersForScene(scene) {
  return {
    birds: true,
    water: scene === 'fishing',
    chickens: scene === 'coop' || scene === 'animals',
    bees: scene === 'hive' || scene === 'animals',
  };
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export class FarmAudio {
  constructor(assets = AUDIO_ASSETS) {
    this.assets = assets;
    this.assetBuffers = new Map();
    this.loadingAssets = new Set();
    this.assetsLoaded = false;
    this.context = null;
    this.masterGain = null;
    this.musicGain = null;
    this.ambientGain = null;
    this.settings = normalizeAudioSettings();
    this.scene = 'garden';
    this.active = false;
    this.started = false;
    this.scheduler = null;
    this.nextBeatTime = 0;
    this.beatIndex = 0;
    this.timers = new Map();
    this.waterTrack = null;
    this.beeTrack = null;
    this.musicTrack = null;
  }

  start(settings, scene) {
    this.settings = normalizeAudioSettings(settings);
    this.scene = scene;
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Growora audio is unavailable because this browser has no Web Audio support.');
        return;
      }
      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.musicGain = this.context.createGain();
      this.ambientGain = this.context.createGain();
      this.musicGain.connect(this.masterGain);
      this.ambientGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);
      this.applySettings();
      this.loadConfiguredAssets();
    }
    this.active = true;
    this.resume();
    if (!this.started) {
      this.started = true;
      this.nextBeatTime = this.context.currentTime + 0.1;
      this.scheduler = window.setInterval(() => this.scheduleMusic(), 200);
    }
    this.updateAmbience();
  }

  setSettings(settings) {
    this.settings = normalizeAudioSettings(settings);
    this.applySettings();
  }

  setScene(scene) {
    this.scene = scene;
    this.updateAmbience();
  }

  setActive(active) {
    this.active = active;
    if (!this.context || !this.started) return;
    if (active) {
      this.resume();
      this.updateAmbience();
    } else {
      this.stopAmbientTimers();
      this.stopWater();
      this.stopBees();
      if (this.context.state === 'running') {
        this.context.suspend().catch((error) => console.error('Could not suspend Growora audio.', error));
      }
    }
  }

  resume() {
    if (this.context.state !== 'running') {
      this.context.resume()
        .then(() => { if (this.active) this.updateAmbience(); })
        .catch((error) => console.error('Could not resume Growora audio.', error));
    }
  }

  applySettings() {
    if (!this.context) return;
    const now = this.context.currentTime;
    const setGain = (node, value) => node.gain.setTargetAtTime(value, now, 0.08);
    setGain(this.masterGain, this.settings.master.muted ? 0 : this.settings.master.volume / 100);
    setGain(this.musicGain, this.settings.music.muted ? 0 : this.settings.music.volume / 100);
    setGain(this.ambientGain, this.settings.ambient.muted ? 0 : this.settings.ambient.volume / 100);
  }

  scheduleMusic() {
    if (!this.active || this.context.state !== 'running') return;
    if (this.assetBuffers.has('music') || this.loadingAssets.has('music')) return;
    const now = this.context.currentTime;
    if (this.nextBeatTime < now - 0.2) this.nextBeatTime = now + 0.05;
    const beatLength = 60 / 68;
    const endTime = now + 0.8;
    const chords = [
      [261.63, 329.63, 392],
      [220, 261.63, 329.63],
      [174.61, 220, 261.63],
      [196, 246.94, 293.66],
    ];
    const melody = [523.25, 0, 587.33, 0, 659.25, 587.33, 523.25, 0, 493.88, 0, 440, 0, 392, 440, 493.88, 0];

    while (this.nextBeatTime < endTime) {
      const beat = this.beatIndex % 16;
      if (beat % 4 === 0) {
        chords[Math.floor(beat / 4)].forEach((frequency, index) => {
          this.playTone(frequency, this.nextBeatTime, beatLength * 3.8, 0.045 / (index + 1), 'sine', this.musicGain);
        });
      }
      if (melody[beat]) {
        this.playTone(melody[beat], this.nextBeatTime, beatLength * 1.65, 0.032, 'sine', this.musicGain);
      }
      this.nextBeatTime += beatLength;
      this.beatIndex += 1;
    }
  }

  playTone(frequency, start, duration, volume, type, destination) {
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.linearRampToValueAtTime(volume, start + 0.16);
    envelope.gain.setValueAtTime(volume, start + Math.max(0.17, duration - 0.38));
    envelope.gain.linearRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope);
    envelope.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      envelope.disconnect();
    }, { once: true });
  }

  updateAmbience() {
    if (!this.context || !this.started || !this.active) return;
    const layers = ambientLayersForScene(this.scene);
    this.setAmbientTimer('birds', layers.birds, () => this.playBirdsong());
    this.setAmbientTimer('chickens', layers.chickens, () => this.playChicken());
    if (layers.water) this.startWater();
    else this.stopWater();
    if (layers.bees) this.startBees();
    else this.stopBees();
  }

  setAmbientTimer(name, enabled, play) {
    if (!enabled) {
      window.clearTimeout(this.timers.get(name));
      this.timers.delete(name);
      return;
    }
    if (!this.timers.has(name)) {
      const schedule = () => {
        if (!this.active || this.context.state !== 'running') {
          this.timers.delete(name);
          return;
        }
        play();
        const delay = name === 'birds' ? randomBetween(5200, 10800) : randomBetween(8500, 17500);
        this.timers.set(name, window.setTimeout(schedule, delay));
      };
      this.timers.set(name, window.setTimeout(schedule, randomBetween(500, 2400)));
    }
  }

  playBirdsong() {
    const birdBuffer = this.assetBuffers.get('birds');
    if (birdBuffer) {
      const source = this.context.createBufferSource();
      source.buffer = birdBuffer;
      source.connect(this.ambientGain);
      source.start();
      source.addEventListener('ended', () => source.disconnect(), { once: true });
      return;
    }
    const count = Math.random() < 0.55 ? 2 : 3;
    for (let index = 0; index < count; index += 1) {
      const start = this.context.currentTime + index * randomBetween(0.12, 0.24);
      const oscillator = this.context.createOscillator();
      const envelope = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(randomBetween(2200, 2900), start);
      oscillator.frequency.exponentialRampToValueAtTime(randomBetween(1550, 2050), start + 0.18);
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.linearRampToValueAtTime(0.012, start + 0.025);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
      oscillator.connect(envelope);
      envelope.connect(this.ambientGain);
      oscillator.start(start);
      oscillator.stop(start + 0.22);
      oscillator.addEventListener('ended', () => {
        oscillator.disconnect();
        envelope.disconnect();
      }, { once: true });
    }
  }

  playChicken() {
    const start = this.context.currentTime;
    const chickenBuffer = this.assetBuffers.get('chickens');
    if (chickenBuffer) {
      const source = this.context.createBufferSource();
      source.buffer = chickenBuffer;
      source.connect(this.ambientGain);
      source.start(start);
      source.addEventListener('ended', () => source.disconnect(), { once: true });
      return;
    }
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(520, start);
    oscillator.frequency.exponentialRampToValueAtTime(185, start + 0.19);
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.linearRampToValueAtTime(0.018, start + 0.035);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + 0.23);
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.ambientGain);
    oscillator.start(start);
    oscillator.stop(start + 0.25);
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      filter.disconnect();
      envelope.disconnect();
    }, { once: true });
  }

  startWater() {
    if (this.waterTrack) return;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    const buffer = this.assetBuffers.get('water');
    const filter = buffer ? null : this.context.createBiquadFilter();
    source.buffer = buffer || this.createNoiseBuffer();
    source.loop = true;
    if (filter) {
      filter.type = 'lowpass';
      filter.frequency.value = 620;
      source.connect(filter);
      filter.connect(gain);
    } else {
      source.connect(gain);
    }
    gain.gain.value = 0.035;
    gain.connect(this.ambientGain);
    source.start();
    this.waterTrack = { source, filter, gain };
  }

  stopWater() {
    if (!this.waterTrack) return;
    this.waterTrack.source.stop();
    this.waterTrack.source.disconnect();
    this.waterTrack.filter?.disconnect();
    this.waterTrack.gain.disconnect();
    this.waterTrack = null;
  }

  startBees() {
    if (this.beeTrack) return;
    const beeBuffer = this.assetBuffers.get('bees');
    if (beeBuffer) {
      const source = this.context.createBufferSource();
      const gain = this.context.createGain();
      source.buffer = beeBuffer;
      source.loop = true;
      gain.gain.value = 0.035;
      source.connect(gain);
      gain.connect(this.ambientGain);
      source.start();
      this.beeTrack = { source, gain };
      return;
    }
    const oscillator = this.context.createOscillator();
    const modulation = this.context.createOscillator();
    const modulationGain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 105;
    modulation.frequency.value = 3.2;
    modulationGain.gain.value = 5;
    filter.type = 'lowpass';
    filter.frequency.value = 260;
    gain.gain.value = 0.007;
    modulation.connect(modulationGain);
    modulationGain.connect(oscillator.frequency);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);
    oscillator.start();
    modulation.start();
    this.beeTrack = { oscillator, modulation, modulationGain, filter, gain };
  }

  stopBees() {
    if (!this.beeTrack) return;
    if (this.beeTrack.source) {
      this.beeTrack.source.stop();
      this.beeTrack.source.disconnect();
      this.beeTrack.gain.disconnect();
      this.beeTrack = null;
      return;
    }
    this.beeTrack.oscillator.stop();
    this.beeTrack.modulation.stop();
    this.beeTrack.oscillator.disconnect();
    this.beeTrack.modulation.disconnect();
    this.beeTrack.modulationGain.disconnect();
    this.beeTrack.filter.disconnect();
    this.beeTrack.gain.disconnect();
    this.beeTrack = null;
  }

  createNoiseBuffer() {
    const length = this.context.sampleRate * 2;
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
    return buffer;
  }

  loadConfiguredAssets() {
    if (this.assetsLoaded) return;
    this.assetsLoaded = true;
    for (const [name, url] of Object.entries(this.assets)) {
      if (typeof url !== 'string' || !url.trim()) continue;
      this.loadingAssets.add(name);
      this.loadAsset(name, url);
    }
  }

  async loadAsset(name, url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
      this.assetBuffers.set(name, buffer);
      if (name === 'music') {
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(this.musicGain);
        source.start();
        this.musicTrack = source;
      } else if (name === 'water' || name === 'bees') {
        if (name === 'water') this.stopWater();
        if (name === 'bees') this.stopBees();
        this.updateAmbience();
      }
    } catch (error) {
      console.error(`Could not load Growora ${name} audio asset at "${url}".`, error);
    } finally {
      this.loadingAssets.delete(name);
    }
  }

  stopAmbientTimers() {
    for (const timer of this.timers.values()) window.clearTimeout(timer);
    this.timers.clear();
  }
}

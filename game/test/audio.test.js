import assert from 'node:assert/strict';
import test from 'node:test';
import { ambientLayersForScene, FarmAudio, normalizeAudioSettings } from '../src/audio.js';

test('normalizes sound settings and migrates saved effects preferences to ambience', () => {
  assert.deepEqual(normalizeAudioSettings(), {
    master: { volume: 80, muted: false },
    music: { volume: 38, muted: false },
    ambient: { volume: 32, muted: false },
  });
  assert.deepEqual(normalizeAudioSettings({
    effects: { volume: 64, muted: true },
    music: { volume: 140, muted: false },
    master: { volume: -4, muted: true },
  }), {
    master: { volume: 0, muted: true },
    music: { volume: 100, muted: false },
    ambient: { volume: 64, muted: true },
  });
  assert.deepEqual(normalizeAudioSettings(null).ambient, { volume: 32, muted: false });
});

test('selects farm ambience for the matching active area', () => {
  assert.deepEqual(ambientLayersForScene('fishing'), {
    birds: true, water: true, chickens: false, bees: false,
  });
  assert.deepEqual(ambientLayersForScene('coop'), {
    birds: true, water: false, chickens: true, bees: false,
  });
  assert.deepEqual(ambientLayersForScene('hive'), {
    birds: true, water: false, chickens: false, bees: true,
  });
  assert.deepEqual(ambientLayersForScene('garden'), {
    birds: true, water: false, chickens: false, bees: false,
  });
});

test('reuses one audio scheduler and ambient timers across repeated scene updates', () => {
  const previousWindow = globalThis.window;
  let nextTimerId = 0;
  let intervalCount = 0;
  const context = {
    currentTime: 0,
    sampleRate: 44100,
    state: 'running',
    destination: {},
    createGain: () => ({
      gain: { setTargetAtTime() {} },
      connect() {},
    }),
    resume() { this.state = 'running'; return Promise.resolve(); },
    suspend() { this.state = 'suspended'; return Promise.resolve(); },
  };
  globalThis.window = {
    AudioContext: class { constructor() { return context; } },
    setInterval() { intervalCount += 1; return intervalCount; },
    setTimeout() { nextTimerId += 1; return nextTimerId; },
    clearTimeout() {},
  };

  try {
    const audio = new FarmAudio();
    audio.start(undefined, 'garden');
    audio.start(undefined, 'garden');
    audio.setScene('coop');
    audio.setScene('coop');
    assert.equal(intervalCount, 1);
    assert.equal(audio.timers.size, 2);

    audio.setActive(false);
    assert.equal(audio.timers.size, 0);
    audio.setActive(true);
    assert.equal(intervalCount, 1);
    assert.equal(audio.timers.size, 2);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

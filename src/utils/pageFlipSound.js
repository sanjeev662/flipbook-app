/**
 * Plays a synthetic page-flip sound using Web Audio API.
 * Produces a short paper-like whoosh/rustle — no external audio file needed.
 */
let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

export function playPageFlipSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const duration = 0.12;
    const sampleRate = ctx.sampleRate;
    const numSamples = Math.floor(duration * sampleRate);
    const buffer = ctx.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    // Brown noise with punchy attack/decay — louder, snappier paper flip
    let last = 0;
    for (let i = 0; i < numSamples; i++) {
      const t = i / numSamples;
      const white = Math.random() * 2 - 1;
      last = last + 0.03 * (white - last);
      const envelope = Math.exp(-12 * t) * (1 - Math.exp(-40 * t));
      data[i] = last * envelope * 0.7;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    source.stop(ctx.currentTime + duration);
  } catch (_) {
    // Silently ignore if Web Audio is unavailable (e.g. autoplay policy)
  }
}

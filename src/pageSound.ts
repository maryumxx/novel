/** A short layered paper rustle, synthesized locally after a user gesture. */
export function playPageTurn(context: AudioContext) {
  if (context.state !== 'running') return;
  const duration = .46;
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const samples = buffer.getChannelData(0);
  let softened = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / context.sampleRate;
    softened = .62 * softened + .38 * (Math.random() * 2 - 1);
    const sweep = Math.sin(Math.PI * t / duration) ** 1.8;
    const texture = .75 + .25 * Math.sin(t * 95) * Math.sin(t * 163);
    samples[i] = softened * sweep * texture;
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.Q.value = .55;
  filter.frequency.setValueAtTime(1900, context.currentTime);
  filter.frequency.exponentialRampToValueAtTime(650, context.currentTime + duration);
  gain.gain.value = .28;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start();
  source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
}

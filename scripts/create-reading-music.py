"""Render our original, seamless 64-second music-box/piano reading loop.

No samples or third-party recordings are used. Requires numpy.
"""
from pathlib import Path
import wave
import numpy as np

RATE = 22050
SECONDS = 64
track = np.zeros(RATE * SECONDS, dtype=np.float64)

def note(midi, start, duration, volume, pad=False):
    t = np.arange(int(duration * RATE)) / RATE
    hz = 440 * 2 ** ((midi - 69) / 12)
    if pad:
        envelope = np.sin(np.pi * t / duration) ** 2
        tone = np.sin(2 * np.pi * hz * t) + .18 * np.sin(2 * np.pi * hz * 2 * t)
    else:
        envelope = (1 - np.exp(-t / .025)) * np.exp(-t / 1.7)
        envelope *= np.minimum(1, (duration - t) / .8)
        tone = (np.sin(2 * np.pi * hz * t)
                + .24 * np.sin(2 * np.pi * hz * 2 * t) * np.exp(-t / .65)
                + .06 * np.sin(2 * np.pi * hz * 3 * t) * np.exp(-t / .3))
    samples = tone * envelope * volume
    # Wrap the natural tails over the boundary, so the loop has no silent gap.
    indices = (int(start * RATE) + np.arange(len(samples))) % len(track)
    np.add.at(track, indices, samples)
    if not pad:
        np.add.at(track, (indices + int(.31 * RATE)) % len(track), samples * .13)
        np.add.at(track, (indices + int(.67 * RATE)) % len(track), samples * .06)

# Cmaj7 / Am7 / Fmaj7 / Gsus2, with a gentle second phrase.
chords = [(48, 55, 59, 64), (45, 52, 55, 60), (41, 48, 52, 57), (43, 50, 57, 62)] * 2
melody = [76, 74, 72, 71, 72, 76, 74, 72]
for bar, chord in enumerate(chords):
    start = bar * 8
    for pitch in chord[:3]:
        note(pitch, start - 1, 10, .055, pad=True)
    for beat, pitch in enumerate([chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[3] + 12]):
        note(pitch, start + beat * 1.75, 6, .18 if beat == 0 else .14)
    note(melody[bar], start + 3.5, 6, .09)

track *= .65 / max(np.max(np.abs(track)), .001)
output = Path('public/audio/our-quiet-pages.wav')
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), 'wb') as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(RATE)
    wav.writeframes((track * 32767).astype('<i2').tobytes())
print(f'Created {output}: {SECONDS}s, original instrumental, seamless loop.')

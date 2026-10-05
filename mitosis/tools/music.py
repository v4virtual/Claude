"""Synthesise a gentle ambient score (pads, bass, bell arpeggios, scene whooshes) that
follows timeline.js, then mix it under the narration.

Usage: python3 tools/music.py   ->  build/music.wav, build/mix.wav
"""
import json, os, re, wave
import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
rng = np.random.default_rng(8)

tl = json.loads(re.search(r"window.TIMELINE = (.*);", open(os.path.join(HERE, "timeline.js")).read(), re.S).group(1))
DUR = tl["duration"]
N = int(DUR * SR)
t = np.arange(N) / SR


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# D major-ish dreamy loop: Dmaj7 - Bm7 - Gmaj7 - A6sus
CHORDS = [[50, 54, 57, 61], [47, 50, 54, 57], [43, 47, 50, 54], [45, 50, 52, 54]]
CH_LEN = 8.0

# energy per scene: how busy the bells are
ENERGY = {"hook": 0.55, "cell": 0.35, "cycle": 0.4, "interphase": 0.4, "mitosis": 0.6, "prophase": 0.6, "metaphase": 0.6,
          "anaphase": 0.75, "telophase": 0.6, "cytokinesis": 0.7, "daughters": 0.45, "wrong": 0.25, "recap": 0.6, "outro": 0.5}


def scene_at(x):
    for s in tl["scenes"]:
        if x < s["end"]:
            return s["id"]
    return tl["scenes"][-1]["id"]


def pad_voice(freq, n, detune):
    out = np.zeros(n)
    tt = np.arange(n) / SR
    for d in (-detune, 0, detune):
        f = freq * (1 + d)
        ph = rng.random() * 6.28
        for h in range(1, 9):
            out += np.sin(2 * np.pi * f * h * tt + ph * h) * (1 / h) * np.exp(-h * 0.45)
    return out / 3


L = np.zeros(N); R = np.zeros(N)

# --- pads, crossfaded between chords
fade = 2.0
k = 0
start = 0.0
while start < DUR:
    chord = CHORDS[k % 4]
    a, b = max(0, start - fade / 2), min(DUR, start + CH_LEN + fade / 2)
    i0, i1 = int(a * SR), int(b * SR)
    n = i1 - i0
    env = np.ones(n)
    f = int(fade * SR)
    ramp = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, min(f, n)))
    env[: len(ramp)] *= ramp
    env[-len(ramp):] *= ramp[::-1]
    for j, m in enumerate(chord):
        v = pad_voice(hz(m), n, 0.003) * env * 0.05
        pan = 0.35 + 0.3 * (j / 3)
        L[i0:i1] += v * (1 - pan); R[i0:i1] += v * pan
    # soft bass on the root
    tt = np.arange(n) / SR
    bass = np.sin(2 * np.pi * hz(chord[0] - 12) * tt) * env * 0.09 * (1 - np.exp(-tt * 3))
    L[i0:i1] += bass; R[i0:i1] += bass
    start += CH_LEN; k += 1

# --- bell arpeggios
step = 0.5
x = 2.0
while x < DUR - 3:
    chord = CHORDS[int(x // CH_LEN) % 4]
    if rng.random() < ENERGY[scene_at(x)]:
        m = chord[rng.integers(0, 4)] + 24 + (12 if rng.random() < 0.25 else 0)
        n = int(2.2 * SR)
        i0 = int(x * SR)
        n = min(n, N - i0)
        tt = np.arange(n) / SR
        bell = (np.sin(2 * np.pi * hz(m) * tt) + 0.3 * np.sin(2 * np.pi * hz(m) * 2.01 * tt) * np.exp(-tt * 4)) * np.exp(-tt * 2.2)
        bell *= (1 - np.exp(-tt * 400)) * 0.045 * (0.6 + 0.4 * rng.random())
        pan = rng.random()
        L[i0:i0 + n] += bell * (1 - pan); R[i0:i0 + n] += bell * pan
    x += step

# --- whoosh into each scene
for s in tl["scenes"][1:]:
    n = int(1.4 * SR)
    i0 = int((s["start"] - 0.9) * SR)
    noise = rng.standard_normal(n)
    # crude band-pass: difference of two moving averages, sweeping
    lo = np.convolve(noise, np.ones(40) / 40, mode="same")
    hi = np.convolve(noise, np.ones(6) / 6, mode="same")
    tt = np.linspace(0, 1, n)
    sw = (hi - lo) * (np.sin(np.pi * tt) ** 2) * 0.05
    L[i0:i0 + n] += sw * (1 - tt * 0.6); R[i0:i0 + n] += sw * (0.4 + tt * 0.6)

# --- reverb: convolve with a decaying noise tail (FFT overlap-add)
ir_n = int(2.8 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 2.2)
ir /= np.sqrt(np.sum(ir ** 2))


def convolve(sig, ir):
    block = 1 << 18
    nfft = 1 << int(np.ceil(np.log2(block + len(ir))))
    IR = np.fft.rfft(ir, nfft)
    out = np.zeros(len(sig) + len(ir))
    for i in range(0, len(sig), block):
        seg = sig[i:i + block]
        y = np.fft.irfft(np.fft.rfft(seg, nfft) * IR, nfft)[: len(seg) + len(ir)]
        out[i:i + len(y)] += y
    return out[: len(sig)]


L = 0.75 * L + 0.45 * convolve(L, ir)
R = 0.75 * R + 0.45 * convolve(R, ir)

# overall shape: fade in, gentle swell on the title card and the ending, fade out
g = np.clip(t / 4, 0, 1) * np.clip((DUR - t) / 3.5, 0, 1)
L *= g; R *= g
peak = max(np.abs(L).max(), np.abs(R).max())
L /= peak / 0.5; R /= peak / 0.5


def save(path, chans, sr):
    pcm = (np.clip(np.stack(chans, 1), -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(len(chans)); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())


save(os.path.join(HERE, "build", "music.wav"), [L, R], SR)
print(f"music: {DUR:.1f}s")

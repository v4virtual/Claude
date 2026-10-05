# Mitosis explainer video

An 8-minute animated explainer on mitosis for a Year 8 (MYP 3) student, in a Kurzgesagt-inspired
style: flat, colourful vector shapes, a deep-blue background, cute cells, and calm ambient music.

| File | What it is |
|---|---|
| `mitosis-explainer.mp4` | **The video**: 1080p, 30 fps, with narration, music and toggleable English subtitles |
| `script.md` | Narration with timestamps, a glossary, a PMAT cheat sheet, a quiz and fact notes |
| `captions.srt` | Subtitles |
| `animation.html` | The animation itself. Open it in a browser to play it with synced audio, scrub, and show captions |
| `soundtrack.m4a` | Mixed narration and music, used by the HTML player and the MP4 |
| `narration.json` | **Source of truth** for the narration text and pacing |
| `timeline.js` | Generated scene and line timings, shared by the audio and the animation |
| `tools/` | Build pipeline (see below) |

Topics covered: PMAT, the cell cycle, interphase (G1/S/G2), mitosis, parent and daughter cells,
chromatin, somatic cells, the nuclear envelope, spindle fibers, cytoplasm and cytokinesis
(animal and plant), plus checkpoints and cancer.

## How it works

- **Narration**: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0), an open text-to-speech model,
  run locally through `kokoro-onnx`. Voice `af_heart`. `tools/tts.py` speaks each line, lays the lines out on a timeline
  (`timeline.js`), and writes `captions.srt`.
- **Animation**: `animation.html` draws everything on a canvas as a pure function of time (`renderAt(t)`). Each scene
  times its visuals to the start of each narration line, so editing the script keeps everything in sync.
- **Music**: `tools/music.py` synthesises an ambient score from the timeline: D-major pads, bass, bell arpeggios
  that get busier during the action, and whooshes between scenes. It's mixed under the voice with side-chain ducking.
- **Video**: `tools/render.mjs` renders frames in parallel headless Chromium (Playwright), encodes them with ffmpeg,
  and muxes in the audio and subtitles.

## Rebuilding

Requirements: Python 3 with `numpy` and `kokoro-onnx`, Node with `playwright` (Chromium), and `ffmpeg`.

The Kokoro model and voices aren't committed (about 120 MB). One way to get them:

```bash
# model: ONNX weights, sharded on npm
npm pack kokoro-q8-shards@1.0.0 && tar xzf kokoro-q8-shards-1.0.0.tgz
cat package/kokoro-q8.part{0..5}.bin > kokoro-q8.onnx   # sha256 fbae9257…a1478
# voices: shipped inside the kokoro-js npm package, converted to the .npz kokoro-onnx expects
npm pack kokoro-js@1.2.1 && tar xzf kokoro-js-1.2.1.tgz
python3 -c "import numpy as np,glob,os; np.savez('voices.npz', **{os.path.basename(f)[:-4]: np.fromfile(f, np.float32).reshape(-1,1,256) for f in glob.glob('package/voices/*.bin')})"
```

Then:

```bash
KOKORO_MODEL=/path/kokoro-q8.onnx KOKORO_VOICES=/path/voices.npz tools/build.sh
```

To change a line, edit `narration.json` and re-run. Only changed lines are re-spoken. To check visuals without
a full render, use `node tools/stills.mjs out/ scene:prophase:b2+3` (that renders 3 s after line 2 of the
prophase scene starts).

Fonts: Nunito (SIL Open Font License, see `fonts/OFL-Nunito.txt`).

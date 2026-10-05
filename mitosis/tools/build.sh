#!/usr/bin/env bash
# Full rebuild: narration -> music -> mix -> video.
# Needs: python3 (numpy, kokoro-onnx), node + playwright (Chromium), ffmpeg.
# KOKORO_MODEL / KOKORO_VOICES point at the Kokoro-82M ONNX model and a voices .npz (see README).
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tools/tts.py "${KOKORO_MODEL:?set KOKORO_MODEL}" "${KOKORO_VOICES:?set KOKORO_VOICES}"
python3 tools/music.py
ffmpeg -loglevel error -y -i build/narration.wav -i build/music.wav -filter_complex \
  "[0:a]aresample=44100,pan=stereo|c0=c0|c1=c0,asplit=2[v][sc];[1:a]volume=0.45[m];[m][sc]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=700[md];[v][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[out]" \
  -map "[out]" -c:a aac -b:a 128k soundtrack.m4a
node tools/render.mjs 30 3

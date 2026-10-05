// Render animation.html frame-by-frame to H.264, in parallel chunks, then mux audio + subtitles.
// Usage: node tools/render.mjs [fps=30] [workers=3] [from=0] [to=end]
import { chromium } from "playwright";
import { spawn, execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const here = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const fps = +(process.argv[2] || 30), workers = +(process.argv[3] || 3);
const build = path.join(here, "build");
fs.mkdirSync(build, { recursive: true });

const browser = await chromium.launch();
const url = "file://" + path.join(here, "animation.html") + "?render";
const probe = await browser.newPage();
await probe.goto(url);
await probe.waitForFunction(() => window.READY);
const duration = await probe.evaluate(() => window.DURATION);
await probe.close();
const from = +(process.argv[4] || 0), to = +(process.argv[5] || duration);
const f0 = Math.round(from * fps), f1 = Math.round(to * fps);
const per = Math.ceil((f1 - f0) / workers);
console.log(`rendering ${f1 - f0} frames @${fps}fps with ${workers} workers`);

let done = 0;
const t0 = Date.now();
async function worker(w) {
  const a = f0 + w * per, b = Math.min(f1, a + per);
  const out = path.join(build, `part${w}.mp4`);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on("pageerror", e => console.error("PAGE ERROR", e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.READY);
  const ff = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-tune", "animation", "-crf", "27", "-pix_fmt", "yuv420p", "-threads", "1", out], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = a; f < b; f++) {
    const data = await page.evaluate(T => { window.renderAt(T); return document.getElementById("c").toDataURL("image/jpeg", 0.95); }, f / fps);
    const buf = Buffer.from(data.slice(data.indexOf(",") + 1), "base64");
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (++done % 300 === 0) {
      const el = (Date.now() - t0) / 1000;
      console.log(`${done}/${f1 - f0} frames, ${el.toFixed(0)}s elapsed, ~${(el / done * (f1 - f0 - done)).toFixed(0)}s left`);
    }
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await page.close();
  return out;
}
const parts = await Promise.all(Array.from({ length: workers }, (_, w) => worker(w)));
await browser.close();

fs.writeFileSync(path.join(build, "parts.txt"), parts.map(p => `file '${p}'`).join("\n"));
const final = path.join(here, "mitosis-explainer.mp4");
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(build, "parts.txt"),
  "-ss", String(from), "-t", String(to - from), "-i", path.join(here, "soundtrack.m4a"),
  "-i", path.join(here, "captions.srt"),
  "-map", "0:v", "-map", "1:a", "-map", "2:s", "-c:v", "copy", "-c:a", "copy", "-c:s", "mov_text",
  "-metadata:s:s:0", "language=eng", "-metadata", "title=Mitosis: How One Cell Becomes Two",
  "-movflags", "+faststart", final], { stdio: "inherit" });
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${final}`);

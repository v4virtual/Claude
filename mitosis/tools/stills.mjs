// Render a few still frames for checking: node tools/stills.mjs out_dir t1 t2 ...  (or scene:id:frac)
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
const here = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const [out, ...times] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on("pageerror", e => console.error("PAGE ERROR", e.message));
page.on("console", m => m.type() === "error" && console.error("CONSOLE", m.text()));
await page.goto("file://" + path.join(here, "animation.html") + "?render");
await page.waitForFunction(() => window.READY);
for (const spec of times) {
  const T = await page.evaluate(spec => {
    if (!spec.includes(":")) return +spec;
    const [, id, f] = spec.split(":");
    const s = TIMELINE.scenes.find(s => s.id === id);
    // f like "b3+1.5" (line 3 start + 1.5s) or a 0..1 fraction
    const m = f.match(/^b(\d+)([+-][\d.]+)?$/);
    if (m) return s.lines[+m[1]].start + (+(m[2] || 0));
    return s.start + (s.end - s.start) * +f;
  }, spec);
  const t0 = Date.now();
  await page.evaluate(T => window.renderAt(T), T);
  const ms = Date.now() - t0;
  const file = path.join(out, spec.replace(/[:+]/g, "_") + ".jpg");
  const data = await page.evaluate(() => document.getElementById("c").toDataURL("image/jpeg", 0.8));
  fs.writeFileSync(file, Buffer.from(data.split(",")[1], "base64"));
  console.log(spec, "T=" + T.toFixed(2), ms + "ms", file);
}
await browser.close();

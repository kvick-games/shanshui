// Tanuki fork: render every painting as a loading-screen still.
//
//   node tools/tanuki-stills.mjs [--scenes s07,s01,...] [--t 3] [--samples 2] [--quality 82]
//        [--dest D:/Dreamatron/Games/Tanuki/Rebuild/assets/ui/arrival/shanshui]
//
// Writes out/tanuki/<scene>.png at 1920x1080, then <scene>.webp next to it with ffmpeg
// (libwebp), and out/tanuki/seal-tanuki.png: a 狸 seal on a transparent ground. With --dest,
// the webps and the seal are copied there too. The loading screen shows them
// as still images, so the game's boot never runs this engine.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { openPage, parseArgs, ROOT } from './lib.mjs';

// Film order: the cut already sequences these paintings well.
const FILM_ORDER = ['s07', 's01', 's04', 's09', 's08', 's10', 's02', 's05', 's03', 's06'];

const a = parseArgs();
const scenes = a.scenes ? String(a.scenes).split(',') : FILM_ORDER;
const t = +(a.t ?? 3);
const samples = +(a.samples ?? 2);
const quality = +(a.quality ?? 82);
const dir = path.join(ROOT, 'out', 'tanuki');
fs.mkdirSync(dir, { recursive: true });

const { page, close } = await openPage({ scale: 1, quiet: true });
let code = 0;
try {
  for (const id of scenes) {
    const b = await page.evaluate((s) => window.__api.loadScene(s), id);
    const ms = await page.evaluate((tt, s) => window.__api.renderScene(tt, { samples: s }), t, samples);
    await page.evaluate((p) => window.__api.savePNG(p), `out/tanuki/${id}.png`);
    const png = path.join(dir, `${id}.png`);
    const webp = path.join(dir, `${id}.webp`);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-c:v', 'libwebp', '-quality', String(quality), webp]);
    const kb = Math.round(fs.statSync(webp).size / 1024);
    console.log(`${id} "${b.title}": built ${b.buildMs} ms, rendered ${ms} ms, ${kb} KB`);
    if (a.dest) {
      fs.mkdirSync(a.dest, { recursive: true });
      fs.copyFileSync(webp, path.join(a.dest, `${id}.webp`));
    }
  }
  // The seal 狸 ("tanuki") on a transparent ground, for the loading screen's title.
  const sealB64 = await page.evaluate(async () => {
    const { paintSeal, sealHeight } = await import('/src/lib/seal.js');
    const w = 240, h = sealHeight(w, '狸'), m = 12;
    const cv = new OffscreenCanvas(w + m * 2, h + m * 2);
    paintSeal(cv.getContext('2d'), m, m, w, { text: '狸', seed: 11 });
    const bytes = new Uint8Array(await (await cv.convertToBlob({ type: 'image/png' })).arrayBuffer());
    let s = ''; for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s);
  });
  const sealPng = path.join(dir, 'seal-tanuki.png');
  fs.writeFileSync(sealPng, Buffer.from(sealB64, 'base64'));
  console.log(`seal: ${Math.round(fs.statSync(sealPng).size / 1024)} KB`);
  if (a.dest) fs.copyFileSync(sealPng, path.join(a.dest, 'seal-tanuki.png'));
} catch (e) { console.error('ERROR:', e.message); code = 1; } finally { await close(); }
process.exit(code);

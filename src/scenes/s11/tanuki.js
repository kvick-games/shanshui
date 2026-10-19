// A tanuki standing at its stove, painted like the animals in Japanese ink sketches:
// grey washes for the grizzled coat, a darker back, black legs, arms and bandit mask,
// broken dry hairs along every outline, a bare-paper apron and a red maple leaf on
// its head (a tanuki needs only a leaf to become anything; today, a cook).
//
// Facing right. (x, y) = between the feet on the ground, h = height to the top of the
// ears. The body is baked once; the arms and the ladle are drawn every frame.
import { stroke, dryStroke, blob, wash, tone, rgba, inkCss, granulate, PAPER } from '../../lib/brush.js';
import { paintMapleLeaf } from '../../lib/flora.js';

const BASE_H = 230;

// local (dx, dy) in a 230 px tall tanuki -> design px
const frame = (x, y, h) => { const k = h / BASE_H; return { k, P: (dx, dy) => [x + dx * k, y + dy * k] }; };

// body outline, clockwise from the front of the neck
const BODY = [[26, -146], [40, -130], [50, -108], [57, -82], [60, -54], [51, -32], [28, -18], [-4, -15], [-34, -21], [-55, -37], [-63, -62], [-59, -92], [-47, -120], [-26, -140], [0, -150]];
const APRON = [[14, -122], [38, -120], [49, -104], [56, -80], [59, -54], [50, -32], [28, -20], [12, -19], [16, -60], [12, -96]];
const TAIL = [[-40, -52], [-70, -48], [-94, -34], [-106, -12], [-102, 4]];
export const TANUKI_PARTS = {
  shoulderNear: [24, -122], shoulderFar: [2, -128],
  head: [18, -170], headR: 33,
};

function polyPath(ctx, pts) { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }

// short dry hairs along a contour, pointing outward (n = outward normal side +1 / -1)
function furEdge(ctx, pts, rng, { k = 1, len = [5, 11], width = [1.6, 3], v = [0.12, 0.35], alpha = [0.55, 0.9], spacing = 4, out = 1, sweep = 0, closed = true, from = 0, to = 1 } = {}) {
  const n = pts.length;
  const segs = closed ? n : n - 1;
  for (let i = Math.floor(segs * from); i < Math.ceil(segs * to); i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    const nx = dy / L * out, ny = -dx / L * out; // clockwise polygon: (dy, -dx) points outward
    const m = Math.max(1, Math.round(L / (spacing * k)));
    for (let j = 0; j < m; j++) {
      const s = (j + rng()) / m;
      const px = a[0] + dx * s, py = a[1] + dy * s;
      const l = (len[0] + rng() * (len[1] - len[0])) * k;
      const tilt = (rng() - 0.5) * 0.9 - sweep * (0.7 + rng() * 0.6);
      const ux = nx + tilt * dx / L, uy = ny + tilt * dy / L, un = Math.hypot(ux, uy);
      const ex = px + ux / un * l, ey = py + uy / un * l;
      stroke(ctx, [[px - nx * l * 0.35, py - ny * l * 0.35], [ex, ey]], {
        width: (width[0] + rng() * (width[1] - width[0])) * k, profile: 'taper',
        color: tone(v[0] + rng() * (v[1] - v[0])), alpha: alpha[0] + rng() * (alpha[1] - alpha[0]), rng, rough: 0.3,
      });
    }
  }
}

// Paint the tanuki's body, tail, legs, head and leaf (no arms) into ctx.
export function paintTanuki(ctx, { x, y, h = BASE_H, rng, paper = PAPER } = {}) {
  const { k, P } = frame(x, y, h);
  const pp = (pts) => pts.map(([dx, dy]) => P(dx, dy));
  const body = pp(BODY);

  // ---- tail (behind): a bushy brush loaded grey, dark at the tip
  const tail = pp(TAIL);
  for (let i = 0; i < 26; i++) {
    const s = i / 25, seg = Math.min(TAIL.length - 2, Math.floor(s * (TAIL.length - 1)));
    const u = s * (TAIL.length - 1) - seg;
    const cx = tail[seg][0] + (tail[seg + 1][0] - tail[seg][0]) * u, cy = tail[seg][1] + (tail[seg + 1][1] - tail[seg][1]) * u;
    const r = (19 - 6 * s + Math.sin(s * 3.1) * 4) * k;
    blob(ctx, cx, cy, r, { color: tone(s > 0.72 ? 0.12 : 0.5 - s * 0.15), alpha: s > 0.72 ? 0.5 : 0.22, rng, irregular: 0.25 });
  }
  for (let i = 0; i < 60; i++) {
    const s = rng(), seg = Math.min(TAIL.length - 2, Math.floor(s * (TAIL.length - 1)));
    const u = s * (TAIL.length - 1) - seg;
    const cx = tail[seg][0] + (tail[seg + 1][0] - tail[seg][0]) * u, cy = tail[seg][1] + (tail[seg + 1][1] - tail[seg][1]) * u;
    const a = rng() * Math.PI * 2, r = (17 - 5 * s) * k * (0.6 + rng() * 0.6);
    stroke(ctx, [[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9]], { width: 2.4 * k, profile: 'taper', color: tone(s > 0.7 ? 0.05 : 0.25 + rng() * 0.2), alpha: 0.75, rng });
  }

  // ---- legs: short, black, planted
  const legs = [[[-24, -34], [-26, -14], [-22, -2]], [[22, -32], [24, -14], [28, -2]]];
  for (const L of legs) stroke(ctx, pp(L), { width: 20 * k, profile: 'even', color: tone(0.06), rng, rough: 0.2 });
  blob(ctx, ...P(-18, 0), 13 * k, { color: tone(0.04), rng, squash: 0.45, irregular: 0.2 });
  blob(ctx, ...P(33, 0), 13 * k, { color: tone(0.04), rng, squash: 0.45, irregular: 0.2 });

  // ---- body: pale grizzled wash, darker back, fur along the outline
  wash(ctx, (c) => polyPath(c, body), { color: tone(0.62, paper), alpha: 0.85, blur: 2.5 * k, rim: 0.5, rimWidth: 2.5 * k });
  ctx.save();
  ctx.beginPath(); polyPath(ctx, body); ctx.clip();
  const [bx0] = P(-56, 0), [bx1] = P(30, 0);
  const g = ctx.createLinearGradient(bx0, 0, bx1, 0);
  g.addColorStop(0, rgba(tone(0.18), 0.85)); g.addColorStop(0.45, rgba(tone(0.35), 0.45)); g.addColorStop(1, rgba(tone(0.5), 0));
  ctx.fillStyle = g; ctx.filter = `blur(${3 * k}px)`; ctx.fillRect(bx0 - 20, P(0, -160)[1], bx1 - bx0 + 40, 160 * k);
  ctx.filter = 'none';
  // grizzled guard hairs over the back and shoulders
  for (let i = 0; i < 70; i++) {
    const px = -50 + rng() * 60, py = -140 + rng() * 105;
    const [sx, sy] = P(px, py);
    stroke(ctx, [[sx, sy], [sx - (3 + rng() * 5) * k, sy + (5 + rng() * 6) * k]], { width: 1.6 * k, profile: 'taper', color: tone(0.08 + rng() * 0.25), alpha: 0.5, rng });
  }
  ctx.restore();
  furEdge(ctx, body, rng, { k, v: [0.1, 0.32], len: [3, 7], width: [1.1, 2.2], alpha: [0.3, 0.6], spacing: 5, sweep: 1.4, from: 0.45, to: 1 });   // back and rump: soft, laid back
  furEdge(ctx, body, rng, { k, v: [0.3, 0.5], len: [2, 5], width: [1, 1.8], from: 0, to: 0.45, alpha: [0.25, 0.45], spacing: 6, sweep: -1 });

  // ---- apron: bare paper with a light ink line, ties around the waist
  const apron = pp(APRON);
  ctx.fillStyle = rgba(paper, 1);
  ctx.beginPath(); polyPath(ctx, apron); ctx.fill();
  ctx.fillStyle = rgba(tone(0.82, paper), 0.6);  // a faint fold shadow
  ctx.beginPath(); polyPath(ctx, pp([[18, -100], [26, -96], [24, -40], [17, -24], [14, -60]])); ctx.fill();
  for (let i = 0; i < APRON.length - 1; i++) {
    stroke(ctx, [apron[i], apron[i + 1]], { width: 1.8 * k, profile: 'brush', color: tone(0.25), alpha: 0.85, rng, rough: 0.25 });
  }
  stroke(ctx, pp([[14, -84], [-14, -88], [-40, -84]]), { width: 2.6 * k, profile: 'even', color: tone(0.2), alpha: 0.9, rng });
  stroke(ctx, pp([[-40, -84], [-56, -96], [-60, -84], [-44, -82]]), { width: 2.2 * k, profile: 'brush', color: tone(0.15), rng });
  stroke(ctx, pp([[-42, -82], [-58, -66]]), { width: 2.2 * k, profile: 'taper', color: tone(0.15), rng });

  // ---- head: round, a fluffy cheek ruff, small rounded ears
  const [hx, hy] = P(18, -170), hr = 33 * k;
  for (const [ex, ey, rot] of [[2, -196, -0.5], [28, -200, 0.3]]) {
    blob(ctx, ...P(ex, ey), 11 * k, { color: tone(0.08), rng, squash: 1.1, rot, irregular: 0.15 });
    blob(ctx, ...P(ex + 1, ey + 3), 5 * k, { color: tone(0.55), alpha: 0.8, rng });
  }
  wash(ctx, (c) => c.ellipse(hx, hy, hr * 1.05, hr * 0.95, 0, 0, Math.PI * 2), { color: tone(0.66, paper), alpha: 0.9, blur: 2 * k, rim: 0.4 });
  // ruff: pale fur flaring out at the cheeks and under the chin
  for (let i = 0; i < 40; i++) {
    const a = Math.PI * (0.25 + rng() * 0.75);
    const r0 = hr * 0.82, r1 = hr * (1.02 + rng() * 0.16);
    stroke(ctx, [[hx + Math.cos(a) * r0, hy + Math.sin(a) * r0 * 0.9], [hx + Math.cos(a) * r1 * 1.08, hy + Math.sin(a) * r1]], {
      width: 1.8 * k, profile: 'taper', color: tone(0.32 + rng() * 0.25), alpha: 0.5, rng });
  }
  // crown: darker
  ctx.save(); ctx.beginPath(); ctx.ellipse(hx, hy, hr * 1.05, hr * 0.95, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = rgba(tone(0.3), 0.55); ctx.filter = `blur(${4 * k}px)`;
  ctx.beginPath(); ctx.ellipse(hx - hr * 0.35, hy - hr * 0.7, hr * 0.9, hr * 0.45, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // muzzle: pale, pointing right, with a black nose
  wash(ctx, (c) => c.ellipse(...P(44, -160), 17 * k, 11 * k, 0.12, 0, Math.PI * 2), { color: tone(0.9, paper), alpha: 1, blur: 1.5 * k, rim: 0 });
  stroke(ctx, pp([[34, -150], [46, -149], [56, -154]]), { width: 2 * k, profile: 'brush', color: tone(0.2), alpha: 0.85, rng });
  blob(ctx, ...P(60, -161), 5.2 * k, { color: tone(0.02), rng, squash: 0.8, irregular: 0.15 });
  // the bandit mask: a black patch sloping down from the eye to the cheek
  const mask = pp([[16, -178], [30, -180], [40, -173], [38, -163], [26, -156], [14, -160], [10, -170]]);
  wash(ctx, (c) => polyPath(c, mask), { color: tone(0.04), alpha: 0.95, blur: 1.6 * k, rim: 0.3 });
  // pale brow above the mask, a glint in the eye
  stroke(ctx, pp([[12, -184], [26, -188], [40, -181]]), { width: 4 * k, profile: 'leaf', color: tone(0.9, paper), alpha: 0.9, rng });
  blob(ctx, ...P(31, -171), 2.3 * k, { color: paper, rng, irregular: 0.1 });
  granulate(ctx, ...P(-110, -215), 190 * k, 220 * k, { amount: 0.18, cell: 2.2 * k, seed: 23 });

  // ---- the leaf on its head
  paintMapleLeaf(ctx, ...P(12, -207), 30 * k, { rot: -0.55, rng, curl: 0.2 });
  return { k, P };
}

// One frame of the arms and the ladle. The ladle's bowl circles in the pot; the hands ride the handle.
// pot = { x, y } surface centre, stir = { rx, ry, period }.
export function paintArmsAndLadle(ctx, t, { x, y, h = BASE_H, pot, stir, rng }) {
  const { k, P } = frame(x, y, h);
  const a = (t / stir.period) * Math.PI * 2;
  const tip = [pot.x + Math.cos(a) * stir.rx, pot.y + 4 * k + Math.sin(a) * stir.ry];
  // the handle leans back toward the tanuki; its far end sways with the stir
  const end = [tip[0] - 168 * k + Math.cos(a) * 9 * k, tip[1] - 36 * k + Math.sin(a) * 4 * k];
  const along = (s) => [tip[0] + (end[0] - tip[0]) * s, tip[1] + (end[1] - tip[1]) * s];
  const handNear = along(0.46), handFar = along(0.7);
  // far arm first (behind the handle), then the handle, then the near arm over it
  const arm = (sh, hand, v) => {
    const [sx, sy] = P(...sh);
    const mid = [(sx + hand[0]) / 2 - 2 * k, (sy + hand[1]) / 2 + 9 * k];
    stroke(ctx, [[sx, sy], mid, hand], { width: [15 * k, 11 * k], profile: 'even', color: tone(v), rng, rough: 0.2 });
    blob(ctx, hand[0], hand[1], 7 * k, { color: tone(v * 0.6), rng, squash: 0.85, irregular: 0.2 });
  };
  arm(TANUKI_PARTS.shoulderFar, handFar, 0.14);
  // handle: a long wooden ladle, a darker grain line along it
  stroke(ctx, [end, tip], { width: 5.5 * k, profile: 'even', color: tone(0.32), rng, rough: 0.1, smooth: false });
  stroke(ctx, [along(0.98), along(0.08)], { width: 1.4 * k, profile: 'even', color: tone(0.1), alpha: 0.7, rng, smooth: false });
  // the bowl dips into the soup: only its rim shows, half sunk
  ctx.save();
  ctx.fillStyle = rgba(tone(0.2), 0.75);
  ctx.beginPath(); ctx.ellipse(tip[0], tip[1], 10 * k, 3.5 * k, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.restore();
  arm(TANUKI_PARTS.shoulderNear, handNear, 0.06);
  return { tip };
}

export { BASE_H };

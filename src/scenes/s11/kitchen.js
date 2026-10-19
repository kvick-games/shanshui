// The tanuki's open-air kitchen: a clay stove with a fire in its mouth, an iron pot,
// steam rising into the mountain mist, a red lantern on a bamboo pole (the sign of a
// food stall), a stand of bowls and a basket of mushrooms.
import { stroke, dryStroke, blob, wash, tone, rgba, granulate, dots, PAPER, VERMILION } from '../../lib/brush.js';

function poly(ctx, pts) { ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }

// Stove and the pot's back half. s = { x, top, ground, w } (x = centre). pot = { x, y, rx, ry }.
export function paintStove(ctx, s, pot, rng, paper = PAPER) {
  const { x, top, ground, w } = s;
  const hw = w / 2;
  // clay body: a rounded block, slightly wider at the foot
  const body = [[x - hw + 6, top], [x + hw - 6, top], [x + hw + 2, top + 18], [x + hw + 8, ground], [x - hw - 8, ground], [x - hw - 2, top + 18]];
  wash(ctx, (c) => poly(c, body), { color: tone(0.7, paper), alpha: 0.95, blur: 2, rim: 0.6, rimWidth: 2.5 });
  // shadow side (light from the left) and the dark ground line
  ctx.save(); ctx.beginPath(); poly(ctx, body); ctx.clip();
  const g = ctx.createLinearGradient(x - hw, 0, x + hw, 0);
  g.addColorStop(0, rgba(tone(0.5), 0)); g.addColorStop(0.6, rgba(tone(0.45), 0.25)); g.addColorStop(1, rgba(tone(0.2), 0.7));
  ctx.fillStyle = g; ctx.fillRect(x - hw - 10, top, w + 20, ground - top);
  // clay seams
  for (let i = 0; i < 4; i++) {
    const yy = top + 26 + i * 22 + (rng() - 0.5) * 6;
    dryStroke(ctx, [[x - hw - 6, yy], [x - hw * 0.2, yy + (rng() - 0.5) * 3], [x + hw + 6, yy + 2]], { width: 3, bristles: 4, color: tone(0.35), alpha: 0.45, dry: 0.6, rng });
  }
  ctx.restore();
  dryStroke(ctx, body.concat([body[0]]), { width: 4, bristles: 5, color: tone(0.15), alpha: 0.75, dry: 0.35, rng });
  // the fire mouth: a dark arch with the fire inside
  const mx = x - 6, my = ground - 10, mw = 30, mh = 34;
  ctx.fillStyle = rgba(tone(0.04), 0.95);
  ctx.beginPath(); ctx.moveTo(mx - mw, my); ctx.lineTo(mx - mw, my - mh * 0.45); ctx.quadraticCurveTo(mx - mw, my - mh, mx, my - mh); ctx.quadraticCurveTo(mx + mw, my - mh, mx + mw, my - mh * 0.45); ctx.lineTo(mx + mw, my); ctx.closePath(); ctx.fill();
  // split logs poking out
  for (const [dx, dy, l] of [[-20, -4, 40], [4, -2, 46], [-8, -9, 30]]) stroke(ctx, [[mx + dx, my + dy], [mx + dx + l, my + dy + 6]], { width: 7, profile: 'even', color: tone(0.18), rng });
  granulate(ctx, x - hw - 12, top - 4, w + 24, ground - top + 8, { amount: 0.25, cell: 2.2, seed: 41 });

  // pot: iron, black, its back rim and the soup inside
  const { rx, ry } = pot;
  ctx.fillStyle = rgba(tone(0.05), 0.95);
  ctx.beginPath(); ctx.ellipse(pot.x, pot.y, rx + 4, ry + 3, 0, Math.PI, Math.PI * 2); ctx.fill();
  wash(ctx, (c) => c.ellipse(pot.x, pot.y + 1, rx - 3, ry - 2, 0, 0, Math.PI * 2), { color: tone(0.55, paper), alpha: 1, blur: 1.2, rim: 0.8, rimWidth: 2 });
  // soup: a darker swirl and a few floating bits
  stroke(ctx, [[pot.x - rx * 0.6, pot.y + 1], [pot.x - rx * 0.1, pot.y - ry * 0.4], [pot.x + rx * 0.5, pot.y + 2]], { width: 3, color: tone(0.35), alpha: 0.6, rng });
  dots(ctx, pot.x, pot.y, rx * 0.6, 9, { size: [1.6, 3.4], color: tone(0.25), rng, squash: 0.3 });
}

// The pot's front: the iron belly below the rim, and the rim's front lip (drawn over the ladle).
export function paintPotFront(ctx, pot, stoveTop, rng, paper = PAPER) {
  const { rx, ry } = pot;
  ctx.fillStyle = rgba(tone(0.05), 0.97);
  ctx.beginPath();
  ctx.ellipse(pot.x, pot.y, rx + 4, ry + 3, 0, 0, Math.PI);
  ctx.quadraticCurveTo(pot.x - rx * 0.9, stoveTop + 6, pot.x - rx * 0.55, stoveTop + 8);
  ctx.lineTo(pot.x + rx * 0.55, stoveTop + 8);
  ctx.quadraticCurveTo(pot.x + rx * 0.95, stoveTop + 6, pot.x + rx + 4, pot.y);
  ctx.fill();
  // a dry highlight along the belly, and the lugs
  dryStroke(ctx, [[pot.x - rx * 0.7, pot.y + ry + 6], [pot.x - rx * 0.2, pot.y + ry + 14]], { width: 6, bristles: 5, color: tone(0.6, paper), alpha: 0.6, dry: 0.5, rng });
  for (const sx of [-1, 1]) stroke(ctx, [[pot.x + sx * (rx + 2), pot.y + 3], [pot.x + sx * (rx + 12), pot.y + 1]], { width: 6, profile: 'even', color: tone(0.04), rng });
  // wet lip of the soup
  ctx.strokeStyle = rgba(tone(0.75, paper), 0.7); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(pot.x, pot.y + 1, rx - 3, ry - 2, 0, 0.15, Math.PI - 0.15); ctx.stroke();
}

// Bamboo pole with a red paper lantern hanging from a crossbar. (x, ground) = foot, top = crossbar y.
export function paintLanternPole(ctx, { x, ground, top, rng, paper = PAPER }) {
  // the pole: culm segments with nodes
  const nodes = 6;
  for (let i = 0; i < nodes; i++) {
    const y0 = ground - (ground - top) * (i / nodes), y1 = ground - (ground - top) * ((i + 1) / nodes) + 3;
    stroke(ctx, [[x + i * 0.6, y0], [x + (i + 1) * 0.6, y1]], { width: 7, profile: 'even', color: tone(0.3), rng, rough: 0.1, smooth: false });
    stroke(ctx, [[x + i * 0.6 - 5, y1 + 1], [x + i * 0.6 + 5, y1 + 1]], { width: 2.4, profile: 'brush', color: tone(0.06), rng });
  }
  // crossbar and cord
  const lx = x - 40;
  stroke(ctx, [[x + 4, top + 2], [lx - 8, top + 6]], { width: 4, profile: 'brush', color: tone(0.2), rng });
  stroke(ctx, [[lx, top + 6], [lx, top + 26]], { width: 1.4, profile: 'even', color: tone(0.1), rng });
  // the lantern: a ribbed red paper drum with black caps
  const cy = top + 58, rx = 24, ry = 31;
  blob(ctx, lx, cy, rx, { color: VERMILION, alpha: 0.95, rng, squash: ry / rx, irregular: 0.06, sides: 16 });
  ctx.save(); ctx.beginPath(); ctx.ellipse(lx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = rgba([120, 24, 16], 0.5); ctx.filter = 'blur(4px)';
  ctx.beginPath(); ctx.ellipse(lx + rx * 0.55, cy, rx * 0.6, ry * 1.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.filter = 'none';
  for (let i = -3; i <= 3; i++) {
    const yy = cy + i * ry * 0.27;
    const half = rx * Math.sqrt(Math.max(0, 1 - (i * 0.27) ** 2));
    stroke(ctx, [[lx - half, yy], [lx, yy + 2], [lx + half, yy]], { width: 1.1, profile: 'even', color: [90, 20, 14], alpha: 0.55, rng });
  }
  ctx.restore();
  // the character 狸 brushed on the paper
  ctx.save();
  ctx.font = `bold 30px "SimSun", "MS Mincho", "Songti SC", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = rgba(tone(0.03), 0.88); ctx.filter = 'blur(0.4px)';
  ctx.fillText('狸', lx, cy + 1);
  ctx.restore();
  for (const yy of [cy - ry + 2, cy + ry - 2]) stroke(ctx, [[lx - 12, yy], [lx + 12, yy]], { width: 6, profile: 'even', color: tone(0.05), rng });
  stroke(ctx, [[lx, cy + ry], [lx + 1, cy + ry + 18]], { width: 2, profile: 'taper', color: tone(0.1), rng });
  granulate(ctx, lx - 40, top - 10, 100, 130, { amount: 0.15, cell: 2, seed: 43 });
}

// A low wooden stand with a stack of bowls and chopsticks. (x, ground) = foot centre.
export function paintBowlStand(ctx, { x, ground, rng, paper = PAPER }) {
  const top = ground - 34;
  stroke(ctx, [[x - 46, top], [x + 46, top]], { width: 7, profile: 'even', color: tone(0.25), rng });
  for (const lx of [x - 38, x + 38]) stroke(ctx, [[lx, top + 2], [lx + (lx < x ? -3 : 3), ground]], { width: 5, profile: 'even', color: tone(0.2), rng });
  for (let i = 0; i < 3; i++) {
    const by = top - 4 - i * 9, bw = 26 - i;
    wash(ctx, (c) => { c.ellipse(x - 10, by - 6, bw, 9, 0, 0, Math.PI); }, { color: tone(0.85, paper), alpha: 1, blur: 0.8, rim: 0 });
    stroke(ctx, [[x - 10 - bw, by - 6], [x - 10, by + 3], [x - 10 + bw, by - 6]], { width: 2, profile: 'brush', color: tone(0.2), rng });
    stroke(ctx, [[x - 10 - bw * 0.8, by - 1], [x - 10 + bw * 0.8, by - 1]], { width: 1.6, profile: 'even', color: VERMILION, alpha: 0.75, rng }); // a red band
  }
  stroke(ctx, [[x + 14, top - 6], [x + 46, top - 14]], { width: 2, profile: 'even', color: tone(0.1), rng });
  stroke(ctx, [[x + 14, top - 3], [x + 47, top - 9]], { width: 2, profile: 'even', color: tone(0.1), rng });
}

// A woven basket of mushrooms on the ground. (x, ground) = foot centre.
export function paintBasket(ctx, { x, ground, rng, paper = PAPER }) {
  const top = ground - 30, hw = 34;
  // mushrooms first, peeking over the rim
  for (let i = 0; i < 6; i++) {
    const mx = x - hw * 0.7 + i * hw * 0.28 + (rng() - 0.5) * 6, my = top + 2 - rng() * 10;
    stroke(ctx, [[mx, my + 10], [mx + (rng() - 0.5) * 3, my]], { width: 4, profile: 'even', color: tone(0.7, paper), rng });
    blob(ctx, mx, my - 2, 8 + rng() * 3, { color: tone(0.18 + rng() * 0.15), rng, squash: 0.55, irregular: 0.15 });
  }
  const body = [[x - hw, top], [x + hw, top], [x + hw - 6, ground], [x - hw + 6, ground]];
  wash(ctx, (c) => poly(c, body), { color: tone(0.6, paper), alpha: 0.95, blur: 1, rim: 0.6 });
  for (let i = 0; i < 4; i++) dryStroke(ctx, [[x - hw + 2, top + 5 + i * 7], [x + hw - 2, top + 5 + i * 7]], { width: 3, bristles: 3, color: tone(0.25), alpha: 0.6, dry: 0.5, rng });
  for (let i = 0; i < 7; i++) stroke(ctx, [[x - hw + 4 + i * 10, top], [x - hw + 7 + i * 9.3, ground]], { width: 1.4, profile: 'even', color: tone(0.3), alpha: 0.6, rng });
  stroke(ctx, [[x - hw - 2, top], [x + hw + 2, top]], { width: 4, profile: 'even', color: tone(0.15), rng });
}

// Steam: faint grey ink wisps curling up out of the pot, leaning with the breeze and
// thinning into the mist. Pure function of time, rest-space p.
export function makeSteam(api, { x, y, rect, z = 1, lean = 0.35, rise = 34, opacity = 1 }) {
  return api.shader(/* glsl */ `
    uniform vec2 uSrc;
    vec4 shade(vec2 p, vec2 uv) {
      float h = uSrc.y - p.y;                       // height above the soup
      if (h < -6.0) return vec4(0.0);
      float hn = max(h, 0.0);
      // the column bends with the breeze and widens as it rises
      float cx = uSrc.x + ${lean.toFixed(3)} * hn + 18.0 * sin(hn * 0.012 - uTime * 0.5);
      float wdt = 26.0 + hn * 0.42;
      vec2 q = vec2((p.x - cx) / wdt, hn * 0.010 - uTime * ${(rise / 100).toFixed(3)});
      // curling strands: warped streaks moving up
      vec2 w = vec2(fbm(q * vec2(1.6, 2.2) + vec2(3.1, 0.0), 3), fbm(q * vec2(1.6, 2.2) + vec2(7.7, 4.2), 3));
      float strands = fbm(vec2(q.x * 2.4 + w.x * 1.3, q.y * 3.0 + w.y), 4) * 0.5 + 0.5;
      float s = smoothstep(0.5, 0.78, strands);
      float across = exp(-pow((p.x - cx) / wdt, 2.0) * 1.6);
      float lifeIn = smoothstep(-6.0, 26.0, h);
      float lifeOut = exp(-hn / 330.0);
      float a = s * across * lifeIn * lifeOut * 0.56 * uOpacity;
      // grey ink with a paler core, like a dilute wash dragged upward
      vec3 c = mix(vec3(0.36, 0.34, 0.32), vec3(0.56, 0.54, 0.50), s);
      return vec4(c * a, a);
    }`, { rect, z, uniforms: { uSrc: [x, y] }, name: 'steam' });
}

// The fire in the stove's mouth: vermilion tongues and gold sparks, flickering (no glow, just paint).
export function makeFire(api, { x, y, z = 1 }) {
  const rect = [x - 40, y - 46, 80, 50];
  return api.shader(/* glsl */ `
    uniform vec2 uC;
    vec4 shade(vec2 p, vec2 uv) {
      vec2 d = p - uC;                              // uC = centre of the fire's base
      float h = -d.y;
      if (h < -2.0) return vec4(0.0);
      float wob = snoise(vec2(d.x * 0.08, h * 0.05 - uTime * 2.2)) * 7.0;
      float flame = smoothstep(26.0, 0.0, abs(d.x + wob * smoothstep(0.0, 30.0, h)) - (24.0 - h * 0.75));
      float lick = snoise(vec2(d.x * 0.12 + 4.0, h * 0.09 - uTime * 3.1)) * 0.5 + 0.5;
      float a = flame * smoothstep(-2.0, 4.0, h) * smoothstep(30.0, 6.0, h + lick * 10.0);
      a = clamp(a * (0.75 + 0.25 * sin(uTime * 7.3 + d.x * 0.2)), 0.0, 1.0) * 0.92;
      vec3 c = mix(vec3(0.70, 0.18, 0.12), vec3(0.93, 0.70, 0.36), smoothstep(10.0, 0.0, h + lick * 8.0) * 0.8);
      return vec4(c * a, a);
    }`, { rect, z, uniforms: { uC: [x, y] }, name: 'fire' });
}

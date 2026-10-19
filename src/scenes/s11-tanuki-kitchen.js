// s11 Tanuki's kitchen (Tanuki fork, no reference painting): on a ledge below a cliff-top
// restaurant hall, a tanuki with a maple leaf on its head stirs a pot on a clay stove.
// The steam rises into the mountain mist; a red lantern on a bamboo pole marks the stall.
// Misty pillar peaks with a pavilion and far ranges fill the right; two cranes pass.
import { makeSky, makeMist } from '../lib/atmos.js';
import { makePeaks, makeRange } from '../lib/peaks.js';
import { cliff, bakeRocks } from '../lib/rock.js';
import { makePine } from '../lib/pine.js';
import { bakeArch, paintHall, paintPavilion } from '../lib/architecture.js';
import { paintMaple } from '../lib/flora.js';
import { makeCraneFlock } from '../lib/fauna.js';
import { inkify } from '../lib/inkfx.js';
import { PAPER } from '../lib/brush.js';
import { paintTanuki, paintArmsAndLadle } from './s11/tanuki.js';
import { paintStove, paintPotFront, paintLanternPole, paintBowlStand, paintBasket, makeSteam, makeFire } from './s11/kitchen.js';

const D = Math.PI / 180;
const GROUND = 748;                                   // the kitchen ledge
const TANUKI = { x: 682, y: GROUND, h: 230 };
const STOVE = { x: 832, top: 656, ground: GROUND + 2, w: 150 };
const POT = { x: 832, y: 632, rx: 62, ry: 13 };
const STIR = { rx: 22, ry: 5, period: 2.6 };

export default {
  id: 's11', title: "Tanuki's kitchen", ref: null,
  build(api) {
    const layers = [];
    const r = api.rng(11);
    layers.push(makeSky(api, { variant: 'rice', seed: 11 }));

    // ---------------------------------------------------------------- far ranges and the peaks on the right
    layers.push(makeRange(api, { x0: 380, x1: 2200, base: 640, top: 300, tone: 0.8, shape: 'pillar', seed: 4 }).layer({ z: 8, name: 'far' }));
    layers.push(makeMist(api, { top: 520, bottom: 760, z: 6.5, lobe: 90, seed: 1, drift: 7 }));
    const mid = makePeaks(api, {
      peaks: [
        { x: 1230, top: 430, base: 790, width: 200, cols: 3, tone: 0.48, seed: 7, fade: 0.4 },
        { x: 1500, top: 250, base: 830, tone: 0.32, seed: 5, fade: 0.45, clearTop: [0], columns: [
          { dx: 0, top: 254, hw: 46, cap: 'flat', lit: 0.5 }, { dx: -70, top: 330, hw: 48, lit: 0.3 }, { dx: 72, top: 300, hw: 44, lit: 0.6 }, { dx: 130, top: 400, hw: 38 }] },
        { x: 1800, top: 360, base: 860, width: 280, cols: 4, tone: 0.3, seed: 6, fade: 0.45 },
      ],
    });
    layers.push(mid.layer({ z: 3.2, name: 'mid' }));
    const top = mid.anchors.tops.reduce((a, b) => (b.flat && (!a || b.y < a.y) ? b : a), null) || { x: 1500, y: 254 };
    const pavRect = [top.x - 70, top.y - 90, 140, 110];
    layers.push(api.tex(bakeArch(api, pavRect, (ctx) => paintPavilion(ctx, { x: top.x, y: top.y + 2, w: 48, fade: 0.25, seed: 21, variant: 'peak' })), { rect: pavRect, z: 3.2, name: 'pavilion' }));
    layers.push(makeCraneFlock(api, { z: 3, cranes: [
      { x: 1310, y: 200, size: 70, heading0: -8 * D, phase: 0.2, vx: 42, vy: -4, seed: 31 },
      { x: 1400, y: 236, size: 62, heading0: -4 * D, phase: 0.7, vx: 44, vy: -3, seed: 32 },
    ] }));
    layers.push(makeMist(api, { top: 700, bottom: 1000, z: 2.6, lobe: 100, seed: 2, drift: 10 }));

    // ---------------------------------------------------------------- the cliff: a high step for the hall, the kitchen ledge below
    const rock = cliff({
      seed: 11,
      outline: [[-80, 404], [40, 390], [150, 382], [260, 392], [340, 404], [384, 430], [404, 500], [420, 590], [438, 680], [460, 742],
        [560, 746], [700, GROUND], [900, GROUND], [1060, 751], [1110, 762], [1140, 800], [1160, 880], [1176, 990], [1190, 1160], [-80, 1160]],
      columns: [{ x: 90 }, { x: 230, tone: -0.08 }, { x: 395, tone: 0.3, dark: 0.2 }, { x: 640, tone: 0.1 }, { x: 900 }, { x: 1080, tone: 0.2 }],
      firstColumn: { tone: 0.1 },
      fade: [[0, 900, 1120], [400, 880, 1100], [700, 850, 1060], [1000, 820, 1000], [1190, 800, 960]],
      tone: 0.2, shadow: 0.5, moss: 1.3, foliage: 1.2, ledges: 0,
      tufts: [[30, 394, 40], [300, 398, 36], [410, 520, 30], [1080, 754, 34], [1120, 770, 40]],
    });
    layers.push(bakeRocks(api, { rect: [-80, 340, 1300, 820], items: [rock], seed: 5 }).layer({ z: 1, name: 'cliff' }));

    // the restaurant hall on the high step, a small maple beside it
    const hallRect = [40, 230, 330, 180];
    layers.push(api.tex(bakeArch(api, hallRect, (ctx) => {
      paintMaple(ctx, { x: 318, y: 398, height: 70, width: 80, lean: 12, seed: 302, leafSize: 1.4 });
      paintHall(ctx, { x: 190, y: 394, w: 200, seed: 13, turn: 0.5 });
    }), { rect: hallRect, z: 1, name: 'hall' }));

    // the pine on the step's edge, arching out over the kitchen
    const pine = makePine(api, { x: 372, y: 420, height: 380, lean: 38, bend: 96, bendAt: 0.35, reach: 0.95, seed: 7, scale: 1.25 });
    layers.push(pine.layer({ z: 1 }));

    // ---------------------------------------------------------------- the kitchen
    const KR = [470, 440, 640, 330];                    // bake rect for the props behind the tanuki
    const back = api.bakeCanvas(KR[2], KR[3], (ctx) => {
      ctx.translate(-KR[0], -KR[1]);
      paintLanternPole(ctx, { x: 1052, ground: GROUND + 4, top: 470, rng: r.fork('pole') });
      paintStove(ctx, STOVE, POT, r.fork('stove'));
      paintBowlStand(ctx, { x: 966, ground: GROUND + 3, rng: r.fork('bowls') });
      paintBasket(ctx, { x: 540, ground: GROUND + 3, rng: r.fork('basket') });
    }, { scale: 1.5 });
    layers.push(api.tex(inkify(api, back, { edge: 0.35, granulation: 0.14, bleed: 0.6, seed: 3 }), { rect: KR, z: 1, name: 'kitchen' }));
    layers.push(makeFire(api, { x: STOVE.x - 6, y: STOVE.ground - 12, z: 1 }));

    const TR = [TANUKI.x - 140, TANUKI.y - 260, 230, 275];
    const body = api.bakeCanvas(TR[2], TR[3], (ctx) => {
      ctx.translate(-TR[0], -TR[1]);
      paintTanuki(ctx, { ...TANUKI, rng: r.fork('tanuki') });
    }, { scale: 2 });
    layers.push(api.tex(inkify(api, body, { edge: 0.3, granulation: 0.12, bleed: 0.5, seed: 5 }), { rect: TR, z: 1, name: 'tanuki' }));

    const AR = [TANUKI.x - 40, POT.y - 90, 240, 130];
    layers.push(api.canvas((ctx, t) => {
      paintArmsAndLadle(ctx, t, { ...TANUKI, pot: POT, stir: STIR, rng: api.rng(77) });
    }, { rect: AR, z: 1, res: 2, name: 'arms' }));

    const PR = [POT.x - 90, POT.y - 20, 180, STOVE.top - POT.y + 40];
    const potFront = api.bakeCanvas(PR[2], PR[3], (ctx) => { ctx.translate(-PR[0], -PR[1]); paintPotFront(ctx, POT, STOVE.top, r.fork('pot')); }, { scale: 2 });
    layers.push(api.tex(inkify(api, potFront, { edge: 0.3, granulation: 0.1, bleed: 0.4, seed: 7 }), { rect: PR, z: 1, name: 'pot' }));

    layers.push(makeSteam(api, { x: POT.x, y: POT.y - 4, rect: [POT.x - 160, -100, 700, POT.y + 96], z: 1, lean: 0.38 }));

    // mist in front of the cliff's foot
    layers.push(makeMist(api, { top: 930, bottom: 1250, z: 0.98, lobe: 110, seed: 3, drift: 12, density: 0.9 }));

    return {
      layers,
      // framed in on the kitchen: pan left and down, zoom about the frame centre
      camera: (t) => ({ x: -170 + 4 * (t - 3), y: 60, dolly: 0.012 + 0.004 * t, zoom: 1.22, roll: 0 }),
      grade: { vignette: 0 },
      meta: { clear: PAPER.map((v) => v / 255) },
    };
  },
};

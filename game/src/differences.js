// differences.js — the difference sets: one clear job, the data for each scene.
// Coordinates live in scene space (600 x 440), the same on both panels.
// `label` names the change so hints and the win screen can describe it.

export const SCENE_COUNT = 3;
export const DIFFS_PER_SCENE = 7;

export const SCENES = [
  {
    id: 'canal',
    name: 'Lantern Canal',
    subtitle: 'a floating market at dusk',
    timeLimit: 180,
    hints: 3,
    diffs: [
      { x: 118, y: 244, r: 26, label: 'the paper lantern on the bridge' },
      { x: 402, y: 300, r: 26, label: 'the cat asleep on the boat' },
      { x: 512, y: 62,  r: 24, label: 'the moon over the rooftops' },
      { x: 268, y: 215, r: 24, label: 'the lit window of the tea house' },
      { x: 421, y: 248, r: 24, label: 'the colour of the boat flag' },
      { x: 196, y: 386, r: 24, label: 'the fish under the dock' },
      { x: 545, y: 320, r: 26, label: 'the colour of the dock flowers' },
    ],
  },
  {
    id: 'cove',
    name: 'Lighthouse Cove',
    subtitle: 'where the harbour meets the sea',
    timeLimit: 150,
    hints: 2,
    diffs: [
      { x: 93,  y: 88,  r: 26, label: 'the lighthouse beam' },
      { x: 330, y: 70,  r: 24, label: 'the seagull in the sky' },
      { x: 474, y: 360, r: 24, label: 'the colour of the buoy' },
      { x: 196, y: 52,  r: 22, label: 'the brightest star' },
      { x: 300, y: 278, r: 26, label: 'the cottage door' },
      { x: 128, y: 356, r: 24, label: 'the crab on the rock' },
      { x: 505, y: 224, r: 26, label: 'the stripes on the sail' },
    ],
  },
  {
    id: 'garden',
    name: 'Night Garden',
    subtitle: 'fireflies over the old fountain',
    timeLimit: 120,
    hints: 1,
    diffs: [
      { x: 150, y: 120, r: 26, label: 'the fireflies by the willow' },
      { x: 300, y: 266, r: 28, label: 'the fountain water' },
      { x: 470, y: 318, r: 26, label: 'the colour of the roses' },
      { x: 96,  y: 168, r: 26, label: 'the owl on the branch' },
      { x: 372, y: 140, r: 24, label: 'the garden lantern' },
      { x: 520, y: 120, r: 22, label: 'the butterfly by the lamp' },
      { x: 240, y: 396, r: 24, label: 'the stepping stone' },
    ],
  },
];

// findDifference(sceneIndex, x, y) — the unfound difference nearest the point,
// or null when the click lands nowhere near one. A generous radius keeps
// the hunt fair: near misses still count as a tap on the spot.
export function findDifference(sceneIndex, x, y) {
  const diffs = SCENES[sceneIndex].diffs;
  let best = null;
  let bestDist = Infinity;
  for (let i = 0; i < diffs.length; i++) {
    const d = diffs[i];
    const dist = Math.hypot(x - d.x, y - d.y);
    if (dist < d.r + 10 && dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  }
  return best;
}

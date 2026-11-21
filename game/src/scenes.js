// scenes.js — the three scene painters. One clear job: draw a scene on a canvas.
// Every scene is hand-drawn procedural canvas art (no borrowed images).
// drawScene(ctx, sceneIndex, changed) paints the scene; `changed` is a Set of
// difference indices whose "different" variant is shown (the right panel).
// The left panel is always called with an empty Set.

import { SCENES } from './differences.js';

const W = 600;
const H = 440;

// Fixed star fields so both panels — and every run — match exactly.
const STARS = [
  [40, 30], [90, 70], [150, 24], [210, 55], [260, 28], [330, 44], [380, 26],
  [430, 60], [480, 30], [545, 90], [570, 40], [70, 110], [250, 90], [360, 80],
];

function sky(ctx, top, mid, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function stars(ctx, skipIndex = -1) {
  ctx.fillStyle = '#fff8d6';
  for (let i = 0; i < STARS.length; i++) {
    if (i === skipIndex) continue;
    const [x, y] = STARS[i];
    ctx.globalAlpha = 0.5 + (i % 3) * 0.2;
    ctx.beginPath();
    ctx.arc(x, y, i % 4 === 0 ? 2.2 : 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function disc(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function glow(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x, y, 2, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(255, 200, 90, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// A paper lantern: glowing body, dark caps, a hanging tassel.
function paperLantern(ctx, x, y, r, bodyColor) {
  glow(ctx, x, y, r + 16, 'rgba(255, 190, 80, 0.55)');
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.8, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 40, 20, 0.7)';
  ctx.lineWidth = 1.5;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y + i * r * 0.45, r * 0.78, r * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  rect(ctx, x - r * 0.35, y - r - 5, r * 0.7, 5, '#7a2d12');
  rect(ctx, x - r * 0.35, y + r, r * 0.7, 5, '#7a2d12');
  ctx.strokeStyle = '#c98a2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + r + 5);
  ctx.lineTo(x, y + r + 14);
  ctx.stroke();
  disc(ctx, x, y + r + 17, 3, '#c0392b');
}

function water(ctx, y, base, sparkle) {
  const g = ctx.createLinearGradient(0, y, 0, H);
  g.addColorStop(0, base);
  g.addColorStop(1, '#0d1526');
  ctx.fillStyle = g;
  ctx.fillRect(0, y, W, H - y);
  ctx.strokeStyle = sparkle;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 7; i++) {
    const wy = y + 14 + i * 16;
    const wx = 30 + ((i * 137) % 480);
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + 46 - (i % 3) * 12, wy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function fish(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 10, y);
  ctx.lineTo(x - 20, y - 7);
  ctx.lineTo(x - 20, y + 7);
  ctx.closePath();
  ctx.fill();
  disc(ctx, x + 6, y - 2, 1.6, '#0d1526');
}

// ---------- Scene 1: Lantern Canal ----------
function drawCanal(ctx, changed) {
  sky(ctx, '#2b1d4e', '#7a3b63', '#e8834f');
  stars(ctx);
  // Moon — difference 2: full on the left, a crescent on the right.
  disc(ctx, 512, 62, 24, '#ffe9a8');
  glow(ctx, 512, 62, 44, 'rgba(255, 233, 168, 0.35)');
  if (changed.has(2)) {
    disc(ctx, 522, 56, 20, '#5a3a63');
  }
  // Rooftops and the tea house.
  ctx.fillStyle = '#1d1430';
  ctx.beginPath();
  ctx.moveTo(0, 190); ctx.lineTo(90, 130); ctx.lineTo(180, 190); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(150, 200); ctx.lineTo(250, 140); ctx.lineTo(350, 200); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a1c44';
  rect(ctx, 200, 190, 150, 70, '#2a1c44');
  rect(ctx, 190, 180, 170, 12, '#3d2a5e');
  // Tea-house window — difference 3: lit gold vs dark.
  if (changed.has(3)) {
    rect(ctx, 256, 200, 24, 30, '#241a38');
    ctx.strokeStyle = '#4a3a6e';
    ctx.strokeRect(256, 200, 24, 30);
  } else {
    glow(ctx, 268, 215, 26, 'rgba(255, 205, 92, 0.6)');
    rect(ctx, 256, 200, 24, 30, '#ffd76a');
    ctx.strokeStyle = '#7a5a1e';
    ctx.beginPath(); ctx.moveTo(268, 200); ctx.lineTo(268, 230); ctx.stroke();
  }
  rect(ctx, 316, 205, 18, 25, changed.has(3) ? '#241a38' : '#ffd76a');
  // The arched bridge, with its hanging lantern — difference 0.
  ctx.strokeStyle = '#4a2c1e';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(118, 300, 92, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#3a2118';
  ctx.fillRect(18, 196, 200, 12);
  if (!changed.has(0)) {
    ctx.strokeStyle = '#c98a2e';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(118, 208); ctx.lineTo(118, 222); ctx.stroke();
    paperLantern(ctx, 118, 244, 20, '#ff5a3c');
  }
  // Canal water.
  water(ctx, 260, '#28455e', 'rgba(255, 190, 110, 0.6)');
  // Fish under the dock — difference 5.
  if (!changed.has(5)) fish(ctx, 196, 386, '#ff9a5c');
  fish(ctx, 330, 410, '#5c8aa8');
  // The little boat with its cat and flag.
  ctx.fillStyle = '#5a2e1e';
  ctx.beginPath();
  ctx.moveTo(360, 300); ctx.lineTo(450, 300); ctx.lineTo(430, 322); ctx.lineTo(380, 322);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3a1c12';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(405, 300); ctx.lineTo(405, 238); ctx.stroke();
  // Flag — difference 4: red vs blue.
  ctx.fillStyle = changed.has(4) ? '#3a7bd5' : '#e23b2e';
  ctx.beginPath();
  ctx.moveTo(405, 238); ctx.lineTo(438, 247); ctx.lineTo(405, 258);
  ctx.closePath(); ctx.fill();
  // Cat asleep on the boat — difference 1.
  if (!changed.has(1)) {
    ctx.fillStyle = '#f0e6d2';
    ctx.beginPath(); ctx.ellipse(402, 294, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
    disc(ctx, 414, 286, 7, '#f0e6d2');
    ctx.beginPath(); ctx.moveTo(410, 280); ctx.lineTo(412, 273); ctx.lineTo(415, 280); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(417, 280); ctx.lineTo(419, 273); ctx.lineTo(421, 280); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#f0e6d2'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(388, 292, 8, 0.4, 2.4); ctx.stroke();
  }
  // Dock on the right with its flower pot — difference 6.
  ctx.fillStyle = '#4a2c1e';
  ctx.fillRect(500, 330, 100, 14);
  ctx.fillRect(516, 344, 10, 40);
  ctx.fillRect(574, 344, 10, 40);
  ctx.fillStyle = '#7a4a2e';
  ctx.beginPath(); ctx.moveTo(528, 330); ctx.lineTo(562, 330); ctx.lineTo(558, 352); ctx.lineTo(532, 352); ctx.closePath(); ctx.fill();
  const petal = changed.has(6) ? '#f2ead8' : '#ff7eb0';
  for (const [fx, fy] of [[534, 322], [545, 314], [556, 322], [540, 326], [550, 326]]) {
    disc(ctx, fx, fy, 5, petal);
    disc(ctx, fx, fy, 2, '#ffd76a');
  }
  // A second lantern string, always there, for depth.
  paperLantern(ctx, 60, 330, 13, '#ffb03c');
  paperLantern(ctx, 330, 360, 12, '#ff7eb0');
}

// ---------- Scene 2: Lighthouse Cove ----------
function drawCove(ctx, changed) {
  sky(ctx, '#101d3a', '#274b6e', '#e07a4f');
  stars(ctx, 3); // the brightest star is drawn by hand below (difference 3)
  // Brightest star — difference 3: shining vs gone.
  if (!changed.has(3)) {
    glow(ctx, 196, 52, 18, 'rgba(255, 248, 214, 0.7)');
    disc(ctx, 196, 52, 3.5, '#fff8d6');
    ctx.strokeStyle = '#fff8d6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(196, 40); ctx.lineTo(196, 64); ctx.moveTo(184, 52); ctx.lineTo(208, 52);
    ctx.stroke();
  }
  // Seagull — difference 1.
  if (!changed.has(1)) {
    ctx.strokeStyle = '#f5ead2';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(322, 70, 9, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(338, 70, 9, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
  ctx.strokeStyle = '#f5ead2';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(430, 100, 8, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  ctx.beginPath();
  ctx.arc(444, 100, 8, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  // Cliffs and the lighthouse.
  ctx.fillStyle = '#1a2440';
  ctx.beginPath();
  ctx.moveTo(0, 440); ctx.lineTo(0, 260); ctx.lineTo(60, 200); ctx.lineTo(150, 230); ctx.lineTo(170, 440);
  ctx.closePath(); ctx.fill();
  rect(ctx, 76, 96, 34, 150, '#f2ead8');
  rect(ctx, 72, 150, 42, 12, '#c0392b');
  rect(ctx, 72, 196, 42, 12, '#c0392b');
  rect(ctx, 80, 78, 26, 20, '#2a1c44');
  // The lamp room glow and the beam — difference 0.
  glow(ctx, 93, 88, 26, 'rgba(255, 230, 140, 0.8)');
  disc(ctx, 93, 88, 9, '#ffe98a');
  if (!changed.has(0)) {
    ctx.fillStyle = 'rgba(255, 236, 150, 0.35)';
    ctx.beginPath();
    ctx.moveTo(100, 80); ctx.lineTo(300, 40); ctx.lineTo(300, 128); ctx.lineTo(100, 96);
    ctx.closePath(); ctx.fill();
    glow(ctx, 200, 84, 30, 'rgba(255, 236, 150, 0.25)');
  }
  // Sea.
  water(ctx, 290, '#1d4a63', 'rgba(180, 220, 255, 0.5)');
  // Sailboat — difference 6: plain white sail vs striped sail.
  ctx.fillStyle = '#5a2e1e';
  ctx.beginPath();
  ctx.moveTo(480, 250); ctx.lineTo(552, 250); ctx.lineTo(536, 266); ctx.lineTo(496, 266);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3a1c12'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(516, 250); ctx.lineTo(516, 200); ctx.stroke();
  if (changed.has(6)) {
    ctx.fillStyle = '#f2ead8';
    ctx.beginPath(); ctx.moveTo(516, 200); ctx.lineTo(516, 248); ctx.lineTo(488, 248); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(516, 214); ctx.lineTo(516, 228); ctx.lineTo(498, 228); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(516, 234); ctx.lineTo(516, 246); ctx.lineTo(490, 246); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = '#f2ead8';
    ctx.beginPath(); ctx.moveTo(516, 200); ctx.lineTo(516, 248); ctx.lineTo(488, 248); ctx.closePath(); ctx.fill();
  }
  // The cottage on the far shore, door — difference 4.
  ctx.fillStyle = '#3a2a4e';
  rect(ctx, 258, 240, 84, 54, '#3a2a4e');
  ctx.beginPath();
  ctx.moveTo(252, 240); ctx.lineTo(300, 210); ctx.lineTo(348, 240); ctx.closePath();
  ctx.fillStyle = '#c0392b'; ctx.fill();
  if (changed.has(4)) {
    rect(ctx, 290, 262, 20, 32, '#241a38');
    ctx.strokeStyle = '#4a3a6e'; ctx.strokeRect(290, 262, 20, 32);
  } else {
    glow(ctx, 300, 278, 22, 'rgba(255, 205, 92, 0.6)');
    rect(ctx, 290, 262, 20, 32, '#ffd76a');
  }
  rect(ctx, 318, 252, 14, 14, '#ffd76a');
  // Rocks, the crab, and the buoy.
  ctx.fillStyle = '#2a3048';
  ctx.beginPath(); ctx.ellipse(128, 368, 52, 22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(196, 392, 40, 16, 0, 0, Math.PI * 2); ctx.fill();
  // Crab — difference 5.
  if (!changed.has(5)) {
    ctx.fillStyle = '#e2604a';
    ellipse(ctx, 128, 352, 12, 8, '#e2604a');
    ctx.strokeStyle = '#e2604a'; ctx.lineWidth = 2;
    for (const dx of [-10, -4, 4, 10]) {
      ctx.beginPath(); ctx.moveTo(128 + dx, 358); ctx.lineTo(128 + dx * 1.4, 368); ctx.stroke();
    }
    disc(ctx, 120, 344, 3, '#e2604a');
    disc(ctx, 136, 344, 3, '#e2604a');
  }
  // Buoy — difference 2: red vs green.
  const buoyColor = changed.has(2) ? '#2ecc71' : '#e23b2e';
  ctx.fillStyle = buoyColor;
  ctx.beginPath(); ctx.moveTo(468, 352); ctx.lineTo(480, 352); ctx.lineTo(476, 378); ctx.lineTo(472, 378); ctx.closePath(); ctx.fill();
  disc(ctx, 474, 350, 6, buoyColor);
  ctx.strokeStyle = '#f5ead2'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(474, 344); ctx.lineTo(474, 332); ctx.stroke();
  disc(ctx, 474, 330, 3, '#ffd76a');
}

// ---------- Scene 3: Night Garden ----------
function drawGarden(ctx, changed) {
  sky(ctx, '#0e1a2e', '#1d2f4e', '#3a2a55');
  stars(ctx);
  // The old willow on the left.
  ctx.fillStyle = '#241a12';
  ctx.fillRect(60, 150, 22, 180);
  ctx.fillStyle = '#2e4a26';
  ctx.beginPath(); ctx.ellipse(120, 130, 110, 70, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(70, 170, 70, 50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3d6b34'; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const wx = 40 + i * 30;
    ctx.beginPath(); ctx.moveTo(wx, 180); ctx.quadraticCurveTo(wx + 8, 230, wx - 4, 262); ctx.stroke();
  }
  // Fireflies by the willow — difference 0.
  if (!changed.has(0)) {
    for (const [fx, fy, fr] of [[138, 112, 3], [162, 128, 2.5], [128, 140, 2], [172, 104, 2.5], [150, 122, 3]]) {
      glow(ctx, fx, fy, 12, 'rgba(190, 255, 120, 0.55)');
      disc(ctx, fx, fy, fr, '#d8ff9a');
    }
  }
  // The owl on the branch — difference 3.
  if (!changed.has(3)) {
    ctx.fillStyle = '#6e5138';
    ctx.beginPath(); ctx.ellipse(96, 168, 14, 18, 0, 0, Math.PI * 2); ctx.fill();
    disc(ctx, 84, 152, 7, '#6e5138');
    disc(ctx, 108, 152, 7, '#6e5138');
    disc(ctx, 91, 164, 3.5, '#ffe9a8');
    disc(ctx, 101, 164, 3.5, '#ffe9a8');
    disc(ctx, 91, 164, 1.6, '#14100c');
    disc(ctx, 101, 164, 1.6, '#14100c');
    ctx.fillStyle = '#e8a13a';
    ctx.beginPath(); ctx.moveTo(96, 168); ctx.lineTo(92, 174); ctx.lineTo(100, 174); ctx.closePath(); ctx.fill();
  }
  // Garden lantern on its post — difference 4: lit vs unlit.
  ctx.fillStyle = '#3a2c1c';
  ctx.fillRect(368, 150, 8, 60);
  if (changed.has(4)) {
    rect(ctx, 360, 128, 24, 24, '#2a2438');
    ctx.strokeStyle = '#4a3a6e'; ctx.strokeRect(360, 128, 24, 24);
  } else {
    glow(ctx, 372, 140, 26, 'rgba(255, 205, 92, 0.65)');
    rect(ctx, 360, 128, 24, 24, '#ffd76a');
    ctx.strokeStyle = '#7a5a1e'; ctx.strokeRect(360, 128, 24, 24);
  }
  // Butterfly by the lamp — difference 5.
  if (!changed.has(5)) {
    ctx.fillStyle = '#c9a7ff';
    ctx.beginPath(); ctx.ellipse(514, 116, 7, 10, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(526, 116, 7, 10, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a3a8e';
    ctx.beginPath(); ctx.ellipse(520, 120, 2, 8, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Lawn.
  ctx.fillStyle = '#1e3a24';
  ctx.fillRect(0, 300, W, 140);
  ctx.fillStyle = '#274d2d';
  for (let i = 0; i < 10; i++) {
    const gx = 20 + i * 58;
    ctx.beginPath(); ctx.ellipse(gx, 330 + (i % 3) * 30, 46, 10, 0, 0, Math.PI * 2); ctx.fill();
  }
  // The fountain — difference 1: water arcs vs still.
  ctx.fillStyle = '#5a5e6e';
  ctx.beginPath(); ctx.ellipse(300, 300, 84, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6e7488';
  ctx.beginPath(); ctx.ellipse(300, 296, 72, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a90a2';
  ctx.fillRect(294, 240, 12, 58);
  disc(ctx, 300, 236, 10, '#8a90a2');
  if (changed.has(1)) {
    ctx.fillStyle = '#2a5a7a';
    ctx.beginPath(); ctx.ellipse(300, 296, 66, 11, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.strokeStyle = '#7fd4ff'; ctx.lineWidth = 3;
    for (const dx of [-26, -13, 0, 13, 26]) {
      ctx.beginPath();
      ctx.moveTo(300, 238);
      ctx.quadraticCurveTo(300 + dx * 1.6, 262, 300 + dx * 2.2, 292);
      ctx.stroke();
    }
    ctx.fillStyle = '#4aa8d8';
    ctx.beginPath(); ctx.ellipse(300, 296, 66, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.ellipse(286, 293, 16, 3, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Rose bush — difference 2: red roses vs purple roses.
  ctx.fillStyle = '#2e4a26';
  ctx.beginPath(); ctx.ellipse(470, 330, 62, 44, 0, 0, Math.PI * 2); ctx.fill();
  const rose = changed.has(2) ? '#9b59d0' : '#e23b5e';
  for (const [rx, ry] of [[446, 312], [470, 300], [494, 314], [458, 330], [484, 332], [470, 320]]) {
    disc(ctx, rx, ry, 7, rose);
    disc(ctx, rx, ry, 3, '#ffd76a');
  }
  // Stepping stones — difference 6: the middle stone is there, or not.
  ctx.fillStyle = '#8a8578';
  ctx.beginPath(); ctx.ellipse(200, 396, 26, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(280, 404, 26, 10, 0, 0, Math.PI * 2); ctx.fill();
  if (!changed.has(6)) {
    ctx.beginPath(); ctx.ellipse(240, 396, 26, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#6e6a5e'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(240, 396, 18, 6, 0, 0, Math.PI * 2); ctx.stroke();
  }
}

const PAINTERS = [drawCanal, drawCove, drawGarden];

export function drawScene(ctx, sceneIndex, changed) {
  ctx.clearRect(0, 0, W, H);
  PAINTERS[sceneIndex](ctx, changed);
}

export function sceneName(sceneIndex) {
  return SCENES[sceneIndex].name;
}

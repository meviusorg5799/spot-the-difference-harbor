// render.js — one clear job: paint the two panels and everything on top of them.
// It owns the found-difference rings, the hint pulse, the crosshair, the
// magnifier lens and the miss ripple. It never owns game state.

import { drawScene } from './scenes.js';
import { SCENES } from './differences.js';

const GOLD = '#ffcf5c';
const WHITE = '#ffffff';

// A satisfying mark: a gold ring, a starburst, and a small star in the middle.
export function drawFoundMark(ctx, x, y, radius, timeMs) {
  const pulse = 1 + 0.06 * Math.sin(timeMs / 220);
  const r = radius * pulse;
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.shadowColor = GOLD;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r - 6, 0, Math.PI * 2);
  ctx.stroke();
  // Starburst ticks around the ring.
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + timeMs / 4000;
    const x1 = x + Math.cos(angle) * (r + 3);
    const y1 = y + Math.sin(angle) * (r + 3);
    const x2 = x + Math.cos(angle) * (r + 10);
    const y2 = y + Math.sin(angle) * (r + 10);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  // A small five-point star in the centre.
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? 9 : 4;
    const px = x + Math.cos(angle) * rr;
    const py = y + Math.sin(angle) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHintPulse(ctx, x, y, radius, timeMs) {
  const phase = (timeMs % 900) / 900;
  const r = radius + phase * 22;
  ctx.save();
  ctx.globalAlpha = 1 - phase;
  ctx.strokeStyle = '#59d6c9';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawMissRipple(ctx, x, y, ageMs) {
  const phase = ageMs / 500;
  if (phase >= 1) return;
  ctx.save();
  ctx.globalAlpha = 0.8 * (1 - phase);
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 6 + phase * 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCrosshair(ctx, x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 20, y); ctx.lineTo(x - 8, y);
  ctx.moveTo(x + 8, y); ctx.lineTo(x + 20, y);
  ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 8);
  ctx.moveTo(x, y + 8); ctx.lineTo(x, y + 20);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// The magnifier: a circular lens showing the scene 2x around the crosshair.
function drawMagnifier(ctx, sceneIndex, changed, x, y) {
  const lensR = 62;
  const zoom = 2;
  const off = document.createElement('canvas');
  off.width = 600;
  off.height = 440;
  const offCtx = off.getContext('2d');
  drawScene(offCtx, sceneIndex, changed);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, lensR, 0, Math.PI * 2);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    off,
    x - lensR / zoom, y - lensR / zoom, (lensR * 2) / zoom, (lensR * 2) / zoom,
    x - lensR, y - lensR, lensR * 2, lensR * 2,
  );
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, lensR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// renderPanels draws both panels from the same state object:
// { sceneIndex, found:Set, hintIndex, hintStartedAt, miss:{x,y,at}|null,
//   crosshair:{x,y,panel}, magnifier:bool, timeMs }
export function renderPanels(leftCtx, rightCtx, state) {
  const { sceneIndex, found, timeMs } = state;
  const diffs = SCENES[sceneIndex].diffs;
  const changed = new Set(diffs.map((_, i) => i));

  drawScene(leftCtx, sceneIndex, new Set());
  drawScene(rightCtx, sceneIndex, changed);

  // Found marks on BOTH panels, so a find is visible wherever you look.
  for (const i of found) {
    const d = diffs[i];
    drawFoundMark(leftCtx, d.x, d.y, d.r, timeMs);
    drawFoundMark(rightCtx, d.x, d.y, d.r, timeMs);
  }

  // Hint pulse on the right panel only (that is where the difference hides).
  if (state.hintIndex !== null && state.hintStartedAt !== null) {
    const d = diffs[state.hintIndex];
    drawHintPulse(rightCtx, d.x, d.y, d.r, timeMs - state.hintStartedAt);
  }

  // Miss ripple on the panel that was clicked.
  if (state.miss) {
    const ctx = state.miss.panel === 0 ? leftCtx : rightCtx;
    drawMissRipple(ctx, state.miss.x, state.miss.y, timeMs - state.miss.at);
  }

  // Crosshair on the active panel; the magnifier replaces it when switched on.
  const ctx = state.crosshair.panel === 0 ? leftCtx : rightCtx;
  if (state.magnifier) {
    const changedForPanel = state.crosshair.panel === 0 ? new Set() : changed;
    drawMagnifier(ctx, sceneIndex, changedForPanel, state.crosshair.x, state.crosshair.y);
  } else {
    drawCrosshair(ctx, state.crosshair.x, state.crosshair.y, 'rgba(255, 207, 92, 0.95)');
  }
}

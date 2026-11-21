// main.js — the entry point: wire the page's elements into the game and start it.
// It does nothing else; the game lives in game.js, the art in scenes.js,
// the painting in render.js, the sounds in audio.js, the data in differences.js.

import { createGame } from './game.js';

const game = createGame({
  leftCanvas: document.getElementById('panel-left'),
  rightCanvas: document.getElementById('panel-right'),
  foundCount: document.getElementById('found-count'),
  remainCount: document.getElementById('remain-count'),
  timerEl: document.getElementById('timer'),
  scoreEl: document.getElementById('score'),
  hintsEl: document.getElementById('hints'),
  hintBtn: document.getElementById('hint-btn'),
  magnifyBtn: document.getElementById('magnify-btn'),
  soundBtn: document.getElementById('sound-btn'),
  restartBtn: document.getElementById('restart-btn'),
  sceneButtons: [...document.querySelectorAll('.scene-btn')],
  banner: document.getElementById('banner'),
  toast: document.getElementById('toast'),
  status: document.getElementById('status'),
});

export default game;

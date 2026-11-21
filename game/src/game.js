// game.js — one clear job: the game's state, input and rules.
// It owns the scene, the found set, the timer, hints, scoring and the win
// screen; render.js owns painting, audio.js owns sound, scenes.js owns art.

import { SCENES, DIFFS_PER_SCENE, findDifference } from './differences.js';
import { renderPanels } from './render.js';
import { playFound, playMiss, playHint, playWin, playTimeUp, setMuted } from './audio.js';

export const POINTS_PER_FIND = 100;
export const TIME_BONUS_PER_SECOND = 2;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function createGame(elements) {
  const {
    leftCanvas, rightCanvas, foundCount, remainCount, timerEl, scoreEl,
    hintsEl, hintBtn, magnifyBtn, soundBtn, restartBtn, sceneButtons,
    banner, toast, status,
  } = elements;

  const leftCtx = leftCanvas.getContext('2d');
  const rightCtx = rightCanvas.getContext('2d');

  const state = {
    sceneIndex: 0,
    found: new Set(),
    hintsLeft: SCENES[0].hints,
    timeLeft: SCENES[0].timeLimit,
    score: 0,
    totalScore: 0,
    hintIndex: null,
    hintStartedAt: null,
    hintTimer: null,
    miss: null,
    crosshair: { x: 300, y: 220, panel: 0 },
    magnifier: false,
    phase: 'playing', // 'playing' | 'won' | 'timeup'
    timeMs: 0,
    ticking: false,
  };

  let toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function announce(message) {
    status.textContent = message;
  }

  function updateHud() {
    const scene = SCENES[state.sceneIndex];
    foundCount.textContent = `${state.found.size} / ${DIFFS_PER_SCENE}`;
    remainCount.textContent = `${DIFFS_PER_SCENE - state.found.size} left`;
    timerEl.textContent = formatTime(Math.max(0, state.timeLeft));
    timerEl.classList.toggle('low', state.timeLeft <= 30 && state.phase === 'playing');
    scoreEl.textContent = String(state.totalScore + state.score);
    hintsEl.textContent = String(state.hintsLeft);
    hintBtn.disabled = state.hintsLeft <= 0 || state.phase !== 'playing';
    sceneButtons.forEach((button, i) => button.classList.toggle('active', i === state.sceneIndex));
  }

  function showBanner(html) {
    banner.innerHTML = html;
    banner.hidden = false;
  }

  function hideBanner() {
    banner.hidden = true;
    banner.innerHTML = '';
  }

  function clearHint() {
    state.hintIndex = null;
    state.hintStartedAt = null;
    if (state.hintTimer) {
      clearTimeout(state.hintTimer);
      state.hintTimer = null;
    }
  }

  function startScene(sceneIndex, foundPreset = []) {
    state.sceneIndex = sceneIndex;
    state.found = new Set(foundPreset);
    const scene = SCENES[sceneIndex];
    state.hintsLeft = scene.hints;
    state.timeLeft = scene.timeLimit;
    state.score = 0;
    state.lastSceneScore = null;
    state.phase = state.found.size === DIFFS_PER_SCENE ? 'won' : 'playing';
    state.crosshair = { x: 300, y: 220, panel: 0 };
    state.miss = null;
    clearHint();
    hideBanner();
    if (state.phase === 'won') showWinBanner();
    updateHud();
    announce(`${scene.name}: find ${DIFFS_PER_SCENE} differences. ${DIFFS_PER_SCENE - state.found.size} remain.`);
  }

  function showWinBanner() {
    const scene = SCENES[state.sceneIndex];
    const timeBonus = state.timeLeft * TIME_BONUS_PER_SECOND;
    // markAt banks the scene score into lastSceneScore before resetting it,
    // so the banner shows the real total; a preset win (?shot=win) has none.
    const sceneTotal = state.lastSceneScore ?? (state.score + timeBonus);
    const next = state.sceneIndex + 1;
    const nextLabel = next < SCENES.length
      ? `Next: ${SCENES[next].name} — fewer hints, less time.`
      : 'You cleared every scene. The canal is yours!';
    showBanner(
      `<h2>🎉 Scene cleared — ${scene.name}!</h2>` +
      `<p>All ${DIFFS_PER_SCENE} differences found · time bonus +${timeBonus} · scene score ${sceneTotal}</p>` +
      `<p>${nextLabel}</p>` +
      (next < SCENES.length
        ? `<button type="button" data-next="${next}">Play ${SCENES[next].name} →</button>`
        : `<button type="button" data-next="0">Play again from Scene 1</button>`),
    );
    banner.querySelector('[data-next]').addEventListener('click', (event) => {
      const target = Number(event.currentTarget.dataset.next);
      if (target === 0 && next >= SCENES.length) state.totalScore = 0;
      startScene(target);
    });
  }

  function showTimeUpBanner() {
    const scene = SCENES[state.sceneIndex];
    showBanner(
      `<h2>⏳ The lanterns burned down…</h2>` +
      `<p>You found ${state.found.size} of ${DIFFS_PER_SCENE} differences in ${scene.name}.</p>` +
      `<p>The ${DIFFS_PER_SCENE - state.found.size} you missed: ` +
      scene.diffs.filter((_, i) => !state.found.has(i)).map((d) => d.label).join(', ') + '.</p>' +
      `<button type="button" id="retry-scene">Try ${scene.name} again</button>`,
    );
    banner.querySelector('#retry-scene').addEventListener('click', () => startScene(state.sceneIndex));
  }

  function markAt(x, y, panel) {
    if (state.phase !== 'playing') return;
    state.crosshair = { x, y, panel };
    const diffIndex = findDifference(state.sceneIndex, x, y);
    if (diffIndex === null) {
      state.miss = { x, y, panel, at: state.timeMs };
      playMiss();
      announce('Not a difference — keep looking.');
      return;
    }
    if (state.found.has(diffIndex)) {
      showToast('Already found — that one is ringed in gold.');
      return;
    }
    state.found.add(diffIndex);
    state.score += POINTS_PER_FIND;
    state.miss = null;
    playFound();
    const remaining = DIFFS_PER_SCENE - state.found.size;
    const label = SCENES[state.sceneIndex].diffs[diffIndex].label;
    if (remaining === 0) {
      state.lastSceneScore = state.score + state.timeLeft * TIME_BONUS_PER_SECOND;
      state.totalScore += state.lastSceneScore;
      state.score = 0;
      state.phase = 'won';
      playWin();
      showWinBanner();
      announce(`Scene cleared! You found all ${DIFFS_PER_SCENE} differences.`);
    } else {
      showToast(`✨ Found ${label}! ${remaining} left.`);
      announce(`Found ${label}. ${remaining} differences remain.`);
    }
    updateHud();
  }

  function useHint() {
    if (state.phase !== 'playing' || state.hintsLeft <= 0) return;
    const unfound = SCENES[state.sceneIndex].diffs
      .map((_, i) => i)
      .filter((i) => !state.found.has(i));
    if (unfound.length === 0) return;
    state.hintsLeft -= 1;
    // The hint always points at the unfound difference nearest the crosshair,
    // so it feels like a nudge, not a giveaway.
    let best = unfound[0];
    let bestDist = Infinity;
    for (const i of unfound) {
      const d = SCENES[state.sceneIndex].diffs[i];
      const dist = Math.hypot(d.x - state.crosshair.x, d.y - state.crosshair.y);
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    }
    state.hintIndex = best;
    state.hintStartedAt = state.timeMs;
    playHint();
    showToast(`💡 Hint: look near ${SCENES[state.sceneIndex].diffs[best].label}. (${state.hintsLeft} left)`);
    clearTimeout(state.hintTimer);
    state.hintTimer = setTimeout(() => {
      state.hintIndex = null;
      state.hintStartedAt = null;
    }, 3000);
    updateHud();
  }

  function canvasPoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.round((event.clientX - rect.left) * scaleX),
      y: Math.round((event.clientY - rect.top) * scaleY),
    };
  }

  function bindCanvas(canvas, panel) {
    canvas.addEventListener('click', (event) => {
      const point = canvasPoint(canvas, event);
      markAt(point.x, point.y, panel);
    });
    canvas.addEventListener('mousemove', (event) => {
      const point = canvasPoint(canvas, event);
      state.crosshair = { x: point.x, y: point.y, panel };
    });
  }

  bindCanvas(leftCanvas, 0);
  bindCanvas(rightCanvas, 1);

  document.addEventListener('keydown', (event) => {
    if (event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) return;
    const step = event.shiftKey ? 24 : 8;
    const crosshair = state.crosshair;
    switch (event.key) {
      case 'ArrowLeft': crosshair.x = Math.max(0, crosshair.x - step); event.preventDefault(); break;
      case 'ArrowRight': crosshair.x = Math.min(600, crosshair.x + step); event.preventDefault(); break;
      case 'ArrowUp': crosshair.y = Math.max(0, crosshair.y - step); event.preventDefault(); break;
      case 'ArrowDown': crosshair.y = Math.min(440, crosshair.y + step); event.preventDefault(); break;
      case 'Enter':
      case ' ': markAt(crosshair.x, crosshair.y, crosshair.panel); event.preventDefault(); break;
      case 'h': case 'H': useHint(); break;
      case 'm': case 'M': toggleMagnifier(); break;
      case '1': startScene(0); break;
      case '2': startScene(1); break;
      case '3': startScene(2); break;
      case 'Tab': {
        // Tab swaps the crosshair to the other panel.
        if (!event.shiftKey) {
          crosshair.panel = 1 - crosshair.panel;
          event.preventDefault();
        }
        break;
      }
      default: break;
    }
  });

  function toggleMagnifier() {
    state.magnifier = !state.magnifier;
    magnifyBtn.setAttribute('aria-pressed', String(state.magnifier));
    showToast(state.magnifier ? '🔍 Magnifier on — hover the panels to zoom in.' : 'Magnifier off.');
  }

  hintBtn.addEventListener('click', useHint);
  magnifyBtn.addEventListener('click', toggleMagnifier);
  soundBtn.addEventListener('click', () => {
    const muted = soundBtn.getAttribute('aria-pressed') === 'false';
    soundBtn.setAttribute('aria-pressed', String(!muted));
    soundBtn.textContent = muted ? '🔊 Sound' : '🔇 Muted';
    setMuted(!muted);
  });
  restartBtn.addEventListener('click', () => startScene(state.sceneIndex));
  sceneButtons.forEach((button, i) => button.addEventListener('click', () => startScene(i)));

  // The timer: one tick a second, only while a scene is being played.
  setInterval(() => {
    if (state.phase !== 'playing') return;
    state.timeLeft -= 1;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.phase = 'timeup';
      playTimeUp();
      showTimeUpBanner();
      announce('Time is up. Try the scene again.');
    }
    updateHud();
  }, 1000);

  // The render loop: repaint both panels every animation frame.
  function frame(time) {
    state.timeMs = time;
    renderPanels(leftCtx, rightCtx, state);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ?shot= states, used only to take honest screenshots of real game states:
  //   start — scene 1, nothing found yet
  //   cover — scene 1, 3 of 7 found, 4 remain (the cover shot)
  //   play  — scene 2, 2 of 7 found, 5 remain
  //   win   — scene 3, all 7 found, win banner showing
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot === 'cover') {
    startScene(0, [0, 1, 4]);
  } else if (shot === 'play') {
    startScene(1, [2, 5]);
  } else if (shot === 'win') {
    startScene(2, [0, 1, 2, 3, 4, 5, 6]);
  } else {
    startScene(0);
  }
  // Freeze the timer for screenshot states so the frame is stable.
  if (shot) state.phase = shot === 'win' ? 'won' : 'playing';
  if (shot === 'cover' || shot === 'play') {
    // Start the clock 47 seconds in so the frame reads as mid-hunt; the
    // one-second timer still ticks, so take the screenshot promptly.
    state.timeLeft = SCENES[state.sceneIndex].timeLimit - 47;
  }

  // A small test surface for headless play-testing (never shown in the UI).
  window.__game = {
    state,
    startScene,
    markAt,
    useHint,
    sceneCount: SCENES.length,
    diffsPerScene: DIFFS_PER_SCENE,
  };

  return { state, startScene, markAt, useHint };
}

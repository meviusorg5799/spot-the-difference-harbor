# Lantern Canal — Spot the Difference

A complete spot-the-difference game that runs in a desktop browser from static files, with no network request. Two near-identical pictures side by side, 7 hidden differences per scene, across three hand-drawn procedural-canvas scenes of a floating canal market at dusk.

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/meviusorg5799/spot-the-difference-harbor/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/meviusorg5799/spot-the-difference-harbor/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

## Play it

Serve `game/` with any static server (for example `node serve.ts`, then open http://localhost:8080) and play in a desktop browser. No build step, no network: every scene is drawn by the game's own canvas code, every sound is a tiny WebAudio blip generated in code.

## The game

- **Three scenes, 7 differences each** — Scene 1: Lantern Canal · Scene 2: Lighthouse Cove · Scene 3: Night Garden. Difficulty rises: fewer hints and less time on later scenes.
- **Click or keyboard** — click a difference on either picture, or move the crosshair with the arrow keys and press Enter/Space. A gold ring with a starburst marks the find on *both* panels.
- **Counter, timer, score** — the HUD always shows how many differences remain, the time left, and the score; clearing a scene adds a time bonus.
- **Hints** — the Hint button (or `H`) pulses a teal ring around one unfound difference, nearest your crosshair. Limited uses per scene.
- **Magnifier** — `M` (or the button) turns the crosshair into a 2× zoom lens for studying fine detail.
- **Win screen per scene** — with your scene score, the differences you found, and the next scene to play.

## Controls

| Key | Action |
| --- | --- |
| Arrow keys | Move the crosshair (Shift = faster) |
| Enter / Space | Mark the spot under the crosshair |
| H | Hint |
| M | Magnifier on/off |
| 1 / 2 / 3 | Switch scene |
| Tab | Swap the crosshair to the other panel |
| Mouse | Click a difference on either picture |

## Screenshots

The screenshots in `screenshots/` are real renders of this game's own code running in headless Chromium. They are driven by a `?shot=` state parameter in the game itself (`start`, `cover`, `play`, `win`), which loads a scene with a preset set of differences already found — no image was edited or composited.

## Structure

- `game/index.html` — the page: HUD, scene bar, two panels, help
- `game/style.css` — all styling
- `game/src/main.js` — entry point: wires the page into the game
- `game/src/game.js` — state, input, timer, hints, scoring, win screen
- `game/src/scenes.js` — the three procedural-canvas scene painters
- `game/src/differences.js` — the difference sets (positions and labels)
- `game/src/render.js` — painting the panels: found marks, hint pulse, crosshair, magnifier
- `game/src/audio.js` — WebAudio blips: found chime, miss thud, hint ping, win arpeggio
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's vendored library, unchanged

## License

MIT — see [LICENSE](LICENSE).

<!-- SPDX-License-Identifier: MIT -->

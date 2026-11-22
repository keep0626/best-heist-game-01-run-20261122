# The Marlow Gallery Heist

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/keep0626/best-heist-game-01-run-20261122/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/keep0626/best-heist-game-01-run-20261122/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

A top-down stealth heist game. You are Wren, a thief slipping through the
Marlow Gallery after dark. Three rooms, three prizes — the Star Sapphire,
the Crown of Tides and the Copper Moon — and a night shift that is very
much awake.

## How to play

- **Move:** WASD / arrow keys, or click the floor to walk there. **Shift** sneaks (slower, harder to spot).
- **Steal:** walk over coins and small valuables. The main prize sits in a locked case — hold **F** beside it to pick the lock, then grab it.
- **Tools (bought with coins):** **1** smoke bomb (15c, hides you for 5s), **2** camera jammer (20c, blinds all cameras for 6s).
- **Win a room:** take the main prize, then reach the green EXIT.
- **Lose:** a guard grabs you, or the alarm meter hits 100%. Guards patrol with red vision cones; cameras sweep amber cones. Walls, display cases and plants block sight — read the patrols before you move.
- **M** mute, **R** restart the room.

## Run it

Static files, no build step, no network requests. Serve `game/` with any
static server (`node serve.ts` opens http://localhost:8080) or open
`game/index.html` directly in desktop Chrome.

## Files

- `game/index.html` — the page, `game/src/` — the game, split by job:
  `main.js` (loop & states), `levels.js` (three rooms), `player.js`,
  `guards.js`, `cameras.js`, `loot.js`, `alarm.js`, `render.js`,
  `audio.js` (synthesized WebAudio sounds), `input.js`, `config.js`.
- `main.ts` — the make.fun hand-in program (Node 22, standard library only).
- `screenshots/` — real renders of the game in a browser.
- `vendor/makefun-game.ts` — the kit's library, unchanged.

An original game: its name, art, sounds and levels were made for this
competition. No third-party engine or library is used — pure hand-written
Canvas 2D.

// main.js — the game itself: state machine, per-frame update, detection,
// win / lose, and the debug handle the play-test drives (window.__heist).
// Wires together player, guards, cameras, loot, alarm, sound and render.

import { GAME_TITLE, FLOOR, START_CREDITS } from './config.js';
import { buildLevels } from './levels.js';
import { Player } from './player.js';
import { Guard, lineOfSightBlocked } from './guards.js';
import { Camera } from './cameras.js';
import { LootTable } from './loot.js';
import { Alarm } from './alarm.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { Renderer } from './render.js';

const LEVEL_TIME = 240; // seconds per room before dawn breaks

class HeistGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new Input(canvas);
    this.sounds = new SoundBank();
    this.levels = buildLevels();
    this.levelIndex = 0;
    this.phase = 'title';
    this.time = 0;
    this.timeLeft = LEVEL_TIME;
    this.totalScore = 0;
    this.elapsed = 0;
    this.message = null;
    this.messageTimer = 0;
    this.caughtReason = '';
    this.loadLevel(0, START_CREDITS);
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }

  get level() { return this.levels[this.levelIndex]; }

  get elapsedFormatted() {
    const s = Math.floor(this.elapsed);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  loadLevel(index, credits) {
    this.levelIndex = index;
    this.levelStartCredits = credits;
    const level = this.level;
    this.player = new Player(level.playerStart.x, level.playerStart.y);
    this.player.credits = credits;
    this.guards = level.guards.map((g) => new Guard(g));
    this.cameras = level.cameras.map((c) => new Camera(c));
    this.loot = new LootTable(level);
    this.alarm = new Alarm();
    this.smokes = [];
    this.jammerTime = 0;
    this.timeLeft = LEVEL_TIME;
    this.message = null;
  }

  showMessage(text, seconds = 2.5) {
    this.message = { text };
    this.messageTimer = seconds;
  }

  blockers() {
    return [...this.level.walls, ...this.level.cover, ...this.level.plants];
  }

  playerInSmoke() {
    return this.smokes.some((s) => Math.hypot(s.x - this.player.x, s.y - this.player.y) < s.r);
  }

  startGame() {
    this.totalScore = 0;
    this.elapsed = 0;
    this.loadLevel(0, START_CREDITS);
    this.phase = 'playing';
    this.sounds.unlock();
    this.showMessage('Lift the Star Sapphire — then reach the EXIT.', 3.5);
  }

  nextLevel() {
    this.totalScore += this.loot.score;
    if (this.levelIndex + 1 >= this.levels.length) {
      this.phase = 'victory';
      this.sounds.winJingle();
      return;
    }
    const credits = this.player.credits;
    this.loadLevel(this.levelIndex + 1, credits);
    this.phase = 'playing';
    this.showMessage(`${this.level.name} — lift the ${this.loot.main.name}.`, 3.5);
  }

  caught(reason) {
    if (this.phase !== 'playing') return;
    this.phase = 'caught';
    this.caughtReason = reason;
    this.sounds.caughtSting();
    this.sounds.stopAlarmHum();
  }

  update(dt) {
    this.time += dt;
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) this.message = null;
    }
    if (this.phase === 'title') {
      if (this.input.wasPressed('enter', ' ') || this.input.click) this.startGame();
      return;
    }
    if (this.phase === 'caught') {
      if (this.input.wasPressed('r', 'enter', ' ')) {
        this.loadLevel(this.levelIndex, this.levelStartCredits);
        this.phase = 'playing';
      }
      return;
    }
    if (this.phase === 'levelClear') {
      if (this.input.wasPressed('enter', ' ', 'r')) this.nextLevel();
      return;
    }
    if (this.phase === 'victory') {
      if (this.input.wasPressed('r', 'enter', ' ')) this.startGame();
      return;
    }

    // --- playing ---
    this.elapsed += dt;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) { this.caught('Dawn broke — the museum opened with you still inside.'); return; }
    if (this.jammerTime > 0) this.jammerTime -= dt;
    for (const s of this.smokes) s.t -= dt;
    this.smokes = this.smokes.filter((s) => s.t > 0);

    if (this.input.wasPressed('m')) {
      const muted = this.sounds.toggleMute();
      this.showMessage(muted ? 'Sound off' : 'Sound on', 1.2);
    }
    if (this.input.wasPressed('r')) { this.loadLevel(this.levelIndex, this.player.credits); this.showMessage('Room reset.', 1.2); }
    if (this.input.wasPressed('1')) {
      if (this.player.trySmoke(this)) { this.sounds.smoke(); this.showMessage('Smoke out — they cannot see through it.', 2); }
      else { this.sounds.denied(); this.showMessage('No smoke left, or not enough coins (15c).', 2); }
    }
    if (this.input.wasPressed('2')) {
      if (this.player.tryJammer(this)) { this.sounds.jammer(); this.showMessage('Cameras jammed for 6 seconds.', 2); }
      else { this.sounds.denied(); this.showMessage('No jammer left, or not enough coins (20c).', 2); }
    }
    if (this.input.click) {
      const c = this.input.click;
      if (c.y > FLOOR.y) this.player.walkTarget = { x: c.x, y: c.y };
    }

    const solids = [...this.level.walls, ...this.level.cover];
    this.player.update(dt, this.input, solids, this.sounds);

    for (const g of this.guards) g.update(dt);
    for (const c of this.cameras) c.update(dt, this.time);

    // Lock-picking the main prize.
    const cracked = this.player.pickLock(dt, this.loot.main, this.input.down('f'));
    if (cracked) {
      this.sounds.unlockCase();
      this.showMessage(`${this.loot.main.name} unlocked — grab it!`, 2.5);
    }

    const events = this.loot.collectNear(this.player.x, this.player.y, this.player);
    for (const e of events) {
      if (e.kind === 'main') {
        this.sounds.winJingle();
        this.showMessage(`${e.name} secured! Get to the EXIT!`, 3);
      } else if (e.kind === 'small') {
        this.sounds.pickup();
        this.showMessage(`Pocketed the ${e.name} (+${e.value} coins).`, 2);
      } else {
        this.sounds.coin();
      }
    }

    // Detection: guards and cameras, unless hidden by smoke.
    const inSmoke = this.playerInSmoke();
    const blockers = this.blockers();
    let seenByGuard = false, seenByCamera = false;
    for (const g of this.guards) {
      g.alerted = g.canSee(this.player.x, this.player.y, blockers, inSmoke);
      if (g.alerted) seenByGuard = true;
      if (g.touchDistance(this.player.x, this.player.y) < g.radius + this.player.radius - 2) {
        this.caught(`${g.name} grabbed you by the collar.`);
        return;
      }
    }
    for (const c of this.cameras) {
      c.seeing = c.canSee(this.player.x, this.player.y, blockers, this.jammerTime > 0, inSmoke);
      if (c.seeing) seenByCamera = true;
    }
    this.alarm.update(dt, seenByGuard, seenByCamera, this.input.sneaking);
    if (this.alarm.value >= 35) this.sounds.startAlarmHum(this.alarm.value);
    else this.sounds.stopAlarmHum();
    if (this.alarm.tripped) {
      this.caught('The alarm hit 100% — the whole building locked down.');
      return;
    }

    // Escape: main prize in hand and standing in the exit doorway.
    if (this.loot.mainTaken) {
      const e = this.level.exit;
      if (this.player.x > e.x - 24 && this.player.x < e.x + e.w + 24
        && this.player.y > e.y - 24 && this.player.y < e.y + e.h + 24) {
        this.phase = 'levelClear';
        this.sounds.winJingle();
        this.sounds.stopAlarmHum();
      }
    }
  }

  frame(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.renderer.render({
      level: this.level,
      guards: this.guards,
      cameras: this.cameras,
      loot: this.loot,
      player: this.player,
      alarm: this.alarm,
      phase: this.phase,
      time: this.time,
      levelIndex: this.levelIndex,
      totalLevels: this.levels.length,
      timeLeft: this.timeLeft,
      message: this.message,
      smokes: this.smokes,
      jammerTime: this.jammerTime,
      totalScore: this.totalScore,
      elapsedFormatted: this.elapsedFormatted,
      caughtReason: this.caughtReason,
    });
    this.input.endFrame();
    requestAnimationFrame((t) => this.frame(t));
  }
}

const canvas = document.getElementById('game');
document.title = GAME_TITLE;
const game = new HeistGame(canvas);

// Debug handle for automated play-testing only: move the thief, read the
// state, jump between rooms. It changes nothing about how the game plays.
window.__heist = {
  game,
  phase: () => game.phase,
  alarm: () => game.alarm.value,
  warp: (x, y) => { game.player.x = x; game.player.y = y; game.player.walkTarget = null; },
  playerPos: () => ({ x: game.player.x, y: game.player.y }),
  mainLoot: () => ({ x: game.loot.main.x, y: game.loot.main.y, locked: game.loot.main.locked, taken: game.loot.main.taken }),
  start: () => { if (game.phase === 'title') game.startGame(); },
  press: (key) => { game.input.pressed.add(key); game.input.keys.add(key); },
  release: (key) => { game.input.keys.delete(key); },
};
window.__heistReady = true;

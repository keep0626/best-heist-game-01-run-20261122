// loot.js — everything worth stealing: the locked main prize, small
// valuables and loose coins. Picking something up is a radius check;
// the main prize must be lock-picked first (see player.pickLock).

import { COIN_VALUE, SMALL_LOOT_VALUE } from './config.js';

export class LootTable {
  constructor(level) {
    this.main = { ...level.mainLoot, taken: false };
    this.small = level.smallLoot.map((s) => ({ ...s, taken: false }));
    this.coins = level.coins.map((c) => ({ ...c, taken: false }));
    this.score = 0;
  }

  // Returns a list of {kind, name, value} events for things just grabbed.
  collectNear(px, py, player) {
    const events = [];
    for (const c of this.coins) {
      if (!c.taken && Math.hypot(c.x - px, c.y - py) < 30) {
        c.taken = true;
        player.credits += COIN_VALUE;
        this.score += COIN_VALUE;
        events.push({ kind: 'coin', name: 'Loose coin', value: COIN_VALUE });
      }
    }
    for (const s of this.small) {
      if (!s.taken && Math.hypot(s.x - px, s.y - py) < 34) {
        s.taken = true;
        player.credits += SMALL_LOOT_VALUE;
        this.score += s.value;
        events.push({ kind: 'small', name: s.name, value: s.value });
      }
    }
    if (!this.main.taken && !this.main.locked && Math.hypot(this.main.x - px, this.main.y - py) < 40) {
      this.main.taken = true;
      this.score += this.main.value;
      events.push({ kind: 'main', name: this.main.name, value: this.main.value });
    }
    return events;
  }

  get mainTaken() { return this.main.taken; }
  get remainingSmall() { return this.small.filter((s) => !s.taken).length; }
}

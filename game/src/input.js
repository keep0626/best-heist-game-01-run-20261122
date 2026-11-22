// input.js — keyboard and mouse in one place.
// WASD / arrows move, Shift sneaks, F picks up / picks locks, 1 smoke bomb,
// 2 jammer, M mute, R restart, Enter starts. Clicking the floor sets a
// walk target (mouse play); clicking a tool button in the HUD uses it.

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set(); // edge-triggered keys, consumed each frame
    this.click = null; // {x, y} in canvas coordinates, consumed each frame
    this.mouse = { x: 0, y: 0 };

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (!e.repeat) this.pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => { this.keys.clear(); });

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener('mousedown', (e) => {
      const r = canvas.getBoundingClientRect();
      this.click = {
        x: (e.clientX - r.left) * (canvas.width / r.width),
        y: (e.clientY - r.top) * (canvas.height / r.height),
      };
    });
  }

  down(...names) { return names.some((n) => this.keys.has(n)); }

  wasPressed(...names) { return names.some((n) => this.pressed.has(n)); }

  // Movement vector from keys, normalised. Zero when idle.
  moveVector() {
    let x = 0, y = 0;
    if (this.down('a', 'arrowleft')) x -= 1;
    if (this.down('d', 'arrowright')) x += 1;
    if (this.down('w', 'arrowup')) y -= 1;
    if (this.down('s', 'arrowdown')) y += 1;
    if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
    return { x, y };
  }

  get sneaking() { return this.down('shift'); }

  endFrame() {
    this.pressed.clear();
    this.click = null;
  }
}

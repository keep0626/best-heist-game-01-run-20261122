// levels.js — the three rooms of the heist. Each level is plain data:
// walls (block movement and sight), cover (display cases, block movement
// and sight), plants (block sight only), guards, cameras, loot, coins,
// the player's start and the exit door. No logic lives here.

export function buildLevels() {
  return [
    {
      name: 'Hall of Marble',
      subtitle: 'Level 1 — slip past the night shift',
      playerStart: { x: 90, y: 620 },
      exit: { x: 24, y: 360, w: 34, h: 92 },
      mainLoot: {
        id: 'sapphire', name: 'Star Sapphire', x: 1155, y: 150,
        locked: true, value: 500, color: '#7fd4ff',
      },
      walls: [
        // Spine wall with a gap in the middle: top route vs bottom route.
        { x: 470, y: 80, w: 26, h: 250 },
        { x: 470, y: 430, w: 26, h: 266 },
        // Second spine, gap at the top: forces a choice of corridor.
        { x: 830, y: 300, w: 26, h: 396 },
        { x: 830, y: 80, w: 26, h: 120 },
      ],
      cover: [
        { x: 180, y: 180, w: 150, h: 54, kind: 'case' },
        { x: 180, y: 500, w: 150, h: 54, kind: 'case' },
        { x: 560, y: 150, w: 150, h: 54, kind: 'case' },
        { x: 560, y: 560, w: 150, h: 54, kind: 'case' },
        { x: 950, y: 420, w: 150, h: 54, kind: 'case' },
        { x: 1050, y: 560, w: 120, h: 44, kind: 'bench' },
      ],
      plants: [
        { x: 380, y: 120, r: 26 },
        { x: 760, y: 620, r: 26 },
        { x: 1180, y: 420, r: 26 },
      ],
      guards: [
        {
          name: 'Rook', waypoints: [{ x: 560, y: 300 }, { x: 760, y: 300 }, { x: 760, y: 480 }, { x: 560, y: 480 }],
          pause: 1.2,
        },
        {
          name: 'Bishop', waypoints: [{ x: 950, y: 620 }, { x: 1180, y: 620 }, { x: 1180, y: 300 }, { x: 950, y: 300 }],
          pause: 0.9,
        },
      ],
      cameras: [
        { x: 1240, y: 96, baseAngle: Math.PI * 0.75, sweep: 0.9, speed: 0.55 },
        { x: 496, y: 96, baseAngle: Math.PI * 0.5, sweep: 1.1, speed: 0.45 },
      ],
      smallLoot: [
        { id: 'scarab', name: 'Jade Scarab', x: 255, y: 620, value: 10, color: '#39d98a' },
        { id: 'ledger', name: 'Gold Ledger', x: 640, y: 130, value: 10, color: '#ffd34d' },
      ],
      coins: [
        { x: 300, y: 350 }, { x: 420, y: 620 }, { x: 640, y: 400 },
        { x: 900, y: 150 }, { x: 1100, y: 300 }, { x: 700, y: 640 },
      ],
    },
    {
      name: 'Vault Corridor',
      subtitle: 'Level 2 — three cameras, no blind luck',
      playerStart: { x: 90, y: 130 },
      exit: { x: 1196, y: 560, w: 60, h: 92 },
      mainLoot: {
        id: 'crown', name: 'Crown of Tides', x: 640, y: 380,
        locked: true, value: 800, color: '#ffd34d',
      },
      walls: [
        { x: 330, y: 80, w: 26, h: 220 },
        { x: 330, y: 420, w: 26, h: 276 },
        { x: 700, y: 80, w: 26, h: 180 },
        { x: 700, y: 380, w: 26, h: 316 },
        { x: 980, y: 80, w: 26, h: 220 },
        { x: 980, y: 420, w: 26, h: 276 },
      ],
      cover: [
        { x: 140, y: 300, w: 120, h: 54, kind: 'case' },
        { x: 420, y: 560, w: 150, h: 54, kind: 'case' },
        { x: 760, y: 150, w: 150, h: 54, kind: 'case' },
        { x: 1040, y: 300, w: 120, h: 54, kind: 'case' },
        { x: 500, y: 300, w: 110, h: 44, kind: 'bench' },
      ],
      plants: [
        { x: 200, y: 620, r: 26 },
        { x: 880, y: 620, r: 26 },
        { x: 1150, y: 140, r: 26 },
      ],
      guards: [
        {
          name: 'Rook', waypoints: [{ x: 200, y: 200 }, { x: 200, y: 560 }, { x: 300, y: 560 }, { x: 300, y: 200 }],
          pause: 1.0,
        },
        {
          name: 'Knight', waypoints: [{ x: 520, y: 380 }, { x: 660, y: 380 }, { x: 660, y: 600 }, { x: 520, y: 600 }],
          pause: 1.4,
        },
        {
          name: 'Bishop', waypoints: [{ x: 860, y: 150 }, { x: 860, y: 520 }, { x: 940, y: 520 }, { x: 940, y: 150 }],
          pause: 0.8,
        },
      ],
      cameras: [
        { x: 640, y: 96, baseAngle: Math.PI * 0.5, sweep: 1.2, speed: 0.6 },
        { x: 40, y: 680, baseAngle: -Math.PI * 0.25, sweep: 1.0, speed: 0.5 },
        { x: 1240, y: 680, baseAngle: Math.PI * 1.25, sweep: 1.0, speed: 0.5 },
      ],
      smallLoot: [
        { id: 'mask', name: 'Ivory Mask', x: 200, y: 400, value: 10, color: '#e8e2d0' },
        { id: 'fan', name: 'Silver Fan', x: 1080, y: 620, value: 10, color: '#c9d6ff' },
      ],
      coins: [
        { x: 180, y: 500 }, { x: 400, y: 130 }, { x: 560, y: 620 },
        { x: 800, y: 300 }, { x: 1040, y: 130 }, { x: 1150, y: 460 },
      ],
    },
    {
      name: "Director's Wing",
      subtitle: 'Level 3 — the Copper Moon, then the roof',
      playerStart: { x: 640, y: 620 },
      exit: { x: 590, y: 80, w: 100, h: 30 },
      mainLoot: {
        id: 'moon', name: 'The Copper Moon', x: 640, y: 220,
        locked: true, value: 1200, color: '#ff9d2e',
      },
      walls: [
        { x: 300, y: 80, w: 26, h: 200 },
        { x: 300, y: 400, w: 26, h: 296 },
        { x: 950, y: 80, w: 26, h: 200 },
        { x: 950, y: 400, w: 26, h: 296 },
        { x: 500, y: 480, w: 280, h: 26 },
      ],
      cover: [
        { x: 420, y: 150, w: 150, h: 54, kind: 'case' },
        { x: 720, y: 150, w: 150, h: 54, kind: 'case' },
        { x: 180, y: 300, w: 130, h: 54, kind: 'case' },
        { x: 960, y: 300, w: 130, h: 54, kind: 'case' },
        { x: 420, y: 560, w: 150, h: 54, kind: 'case' },
        { x: 720, y: 560, w: 150, h: 54, kind: 'case' },
      ],
      plants: [
        { x: 120, y: 150, r: 26 },
        { x: 1160, y: 620, r: 26 },
        { x: 640, y: 420, r: 24 },
      ],
      guards: [
        {
          name: 'Rook', waypoints: [{ x: 200, y: 620 }, { x: 200, y: 150 }, { x: 280, y: 150 }, { x: 280, y: 620 }],
          pause: 1.1,
        },
        {
          name: 'Queen', waypoints: [{ x: 500, y: 380 }, { x: 780, y: 380 }, { x: 780, y: 300 }, { x: 500, y: 300 }],
          pause: 1.5,
        },
        {
          name: 'Bishop', waypoints: [{ x: 1080, y: 620 }, { x: 1080, y: 150 }, { x: 1000, y: 150 }, { x: 1000, y: 620 }],
          pause: 0.9,
        },
      ],
      cameras: [
        { x: 40, y: 96, baseAngle: Math.PI * 0.35, sweep: 1.0, speed: 0.55 },
        { x: 1240, y: 96, baseAngle: Math.PI * 0.65, sweep: 1.0, speed: 0.55 },
        { x: 640, y: 680, baseAngle: -Math.PI * 0.5, sweep: 1.3, speed: 0.65 },
      ],
      smallLoot: [
        { id: 'pearl', name: 'Black Pearl', x: 120, y: 400, value: 10, color: '#c9d6ff' },
        { id: 'dagger', name: 'Gilded Dagger', x: 1160, y: 400, value: 10, color: '#ffd34d' },
      ],
      coins: [
        { x: 180, y: 620 }, { x: 400, y: 300 }, { x: 880, y: 300 },
        { x: 1080, y: 620 }, { x: 640, y: 520 }, { x: 480, y: 130 },
      ],
    },
  ];
}

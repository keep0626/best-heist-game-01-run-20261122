// render.js — every pixel the player sees. Canvas 2D, hand-drawn:
// checkerboard marble floor, brass-trimmed walls, display cases, plants,
// guard and camera vision cones (red / amber, hotter when spotting),
// the glowing loot, the exit door, smoke clouds, and the HUD bar with
// the alarm meter, credits, tools and level name.

import { CANVAS_W, CANVAS_H, HUD_H, FLOOR, PALETTE, GUARD_CONE_RANGE, GUARD_CONE_HALF_ANGLE, CAMERA_RANGE, CAMERA_CONE_HALF_ANGLE, ALARM_MAX } from './config.js';

function drawCone(ctx, x, y, angle, halfAngle, range, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  drawFloor(ctx) {
    ctx.fillStyle = PALETTE.hudBg;
    ctx.fillRect(0, 0, CANVAS_W, HUD_H);
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, HUD_H, CANVAS_W, CANVAS_H - HUD_H);
    // Marble checkerboard inside the room.
    const tile = 58;
    for (let y = FLOOR.y; y < FLOOR.y + FLOOR.h; y += tile) {
      for (let x = FLOOR.x; x < FLOOR.x + FLOOR.w; x += tile) {
        const odd = ((x - FLOOR.x) / tile + (y - FLOOR.y) / tile) % 2 === 0;
        ctx.fillStyle = odd ? PALETTE.floorA : PALETTE.floorB;
        ctx.fillRect(x, y, Math.min(tile, FLOOR.x + FLOOR.w - x), Math.min(tile, FLOOR.y + FLOOR.h - y));
      }
    }
    ctx.strokeStyle = PALETTE.floorLine;
    ctx.lineWidth = 1;
    for (let x = FLOOR.x; x <= FLOOR.x + FLOOR.w; x += tile) {
      ctx.beginPath(); ctx.moveTo(x, FLOOR.y); ctx.lineTo(x, FLOOR.y + FLOOR.h); ctx.stroke();
    }
    for (let y = FLOOR.y; y <= FLOOR.y + FLOOR.h; y += tile) {
      ctx.beginPath(); ctx.moveTo(FLOOR.x, y); ctx.lineTo(FLOOR.x + FLOOR.w, y); ctx.stroke();
    }
    // Brass inner trim.
    ctx.strokeStyle = '#8a6d3b';
    ctx.lineWidth = 3;
    ctx.strokeRect(FLOOR.x, FLOOR.y, FLOOR.w, FLOOR.h);
  }

  drawWalls(ctx, walls) {
    for (const w of walls) {
      ctx.fillStyle = PALETTE.wallTop;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = PALETTE.wall;
      ctx.fillRect(w.x + 3, w.y + 3, w.w - 6, w.h - 6);
    }
  }

  drawCover(ctx, cover, plants) {
    for (const c of cover) {
      if (c.kind === 'bench') {
        ctx.fillStyle = PALETTE.bench;
        roundRect(ctx, c.x, c.y, c.w, c.h, 8);
        ctx.fill();
        ctx.fillStyle = '#7a5c3e';
        ctx.fillRect(c.x + 8, c.y + 6, c.w - 16, 6);
      } else {
        ctx.fillStyle = PALETTE.coverTop;
        roundRect(ctx, c.x, c.y, c.w, c.h, 6);
        ctx.fill();
        ctx.fillStyle = PALETTE.cover;
        ctx.fillRect(c.x + 5, c.y + 5, c.w - 10, c.h - 10);
        ctx.strokeStyle = 'rgba(255, 211, 77, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(c.x + 8, c.y + 8, c.w - 16, c.h - 16);
      }
    }
    for (const p of plants) {
      ctx.fillStyle = '#3a2a1a';
      ctx.beginPath(); ctx.arc(p.x, p.y + 8, p.r * 0.55, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PALETTE.plant;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2f7a4d';
      ctx.beginPath(); ctx.arc(p.x - 7, p.y - 6, p.r * 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x + 8, p.y - 4, p.r * 0.45, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawExit(ctx, exit, mainTaken) {
    const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 280);
    ctx.fillStyle = mainTaken ? PALETTE.exitGlow : '#2c6b45';
    ctx.globalAlpha = mainTaken ? 0.55 + 0.45 * pulse : 0.9;
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0d141c';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cx = exit.x + exit.w / 2, cy = exit.y + exit.h / 2;
    if (exit.w > exit.h) ctx.fillText(mainTaken ? 'EXIT — GO!' : 'EXIT', cx, cy);
    else {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI / 2);
      ctx.fillText(mainTaken ? 'EXIT — GO!' : 'EXIT', 0, 0); ctx.restore();
    }
    ctx.strokeStyle = PALETTE.exitGlow;
    ctx.lineWidth = 2;
    ctx.strokeRect(exit.x - 2, exit.y - 2, exit.w + 4, exit.h + 4);
  }

  drawLoot(ctx, loot, time) {
    const bob = Math.sin(time * 2.4) * 3;
    for (const c of loot.coins) {
      if (c.taken) continue;
      ctx.fillStyle = '#ffe27a';
      ctx.beginPath(); ctx.arc(c.x, c.y + bob * 0.3, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c9962e';
      ctx.font = 'bold 10px Georgia, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('$', c.x, c.y + bob * 0.3);
    }
    for (const s of loot.small) {
      if (s.taken) continue;
      const glow = 0.5 + 0.5 * Math.sin(time * 3 + s.x);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = 0.25 + 0.35 * glow;
      ctx.beginPath(); ctx.arc(s.x, s.y + bob, 22, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(s.x, s.y + bob, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0d141c';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('◆', s.x, s.y + bob);
    }
    const m = loot.main;
    if (!m.taken) {
      const glow = 0.5 + 0.5 * Math.sin(time * 3.5);
      ctx.fillStyle = m.color;
      ctx.globalAlpha = 0.3 + 0.4 * glow;
      ctx.beginPath(); ctx.arc(m.x, m.y + bob, 34, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      // Locked case: brass frame + glass; unlocked: open glow.
      ctx.fillStyle = m.locked ? '#8a6d3b' : '#ffd34d';
      roundRect(ctx, m.x - 24, m.y - 24 + bob, 48, 48, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(20, 30, 40, 0.85)';
      ctx.fillRect(m.x - 18, m.y - 18 + bob, 36, 36);
      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y - 12 + bob); ctx.lineTo(m.x + 11, m.y + bob);
      ctx.lineTo(m.x, m.y + 12 + bob); ctx.lineTo(m.x - 11, m.y + bob);
      ctx.closePath(); ctx.fill();
      if (m.locked) {
        ctx.fillStyle = '#e8e2d0';
        ctx.font = 'bold 12px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 LOCKED — hold F', m.x, m.y + 42 + bob);
      } else {
        ctx.fillStyle = '#ffe27a';
        ctx.font = 'bold 12px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(m.name.toUpperCase(), m.x, m.y + 42 + bob);
      }
    }
  }

  drawGuards(ctx, guards) {
    for (const g of guards) {
      drawCone(ctx, g.x, g.y, g.facing, GUARD_CONE_HALF_ANGLE, GUARD_CONE_RANGE,
        g.alerted ? PALETTE.guardConeHot : PALETTE.guardCone);
      ctx.fillStyle = PALETTE.guard;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7d2c2c';
      ctx.beginPath(); ctx.arc(g.x, g.y, g.radius - 5, 0, Math.PI * 2); ctx.fill();
      // Cap brim + facing tick.
      ctx.fillStyle = '#3a1414';
      ctx.fillRect(g.x - 8, g.y - g.radius - 2, 16, 5);
      ctx.strokeStyle = '#ffd9d9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(g.x, g.y);
      ctx.lineTo(g.x + Math.cos(g.facing) * (g.radius + 7), g.y + Math.sin(g.facing) * (g.radius + 7));
      ctx.stroke();
      ctx.fillStyle = '#ffd9d9';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.name.toUpperCase(), g.x, g.y - g.radius - 9);
      if (g.alerted) {
        ctx.fillStyle = '#ff4d4d';
        ctx.font = 'bold 18px Georgia, serif';
        ctx.fillText('!', g.x, g.y - g.radius - 26);
      }
    }
  }

  drawCameras(ctx, cameras, jammed) {
    for (const c of cameras) {
      drawCone(ctx, c.x, c.y, c.angle, CAMERA_CONE_HALF_ANGLE, CAMERA_RANGE,
        c.seeing ? PALETTE.cameraConeHot : PALETTE.cameraCone);
      ctx.fillStyle = jammed ? '#5a6b7a' : PALETTE.camera;
      ctx.beginPath(); ctx.arc(c.x, c.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0d141c';
      ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = jammed ? '#5a6b7a' : PALETTE.camera;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x + Math.cos(c.angle) * 20, c.y + Math.sin(c.angle) * 20);
      ctx.stroke();
      if (jammed) {
        ctx.fillStyle = '#9fb3c8';
        ctx.font = 'bold 12px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('JAMMED', c.x, c.y - 18);
      } else if (c.seeing) {
        ctx.fillStyle = '#ff4d4d';
        ctx.font = 'bold 16px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', c.x, c.y - 18);
      }
    }
  }

  drawPlayer(ctx, player, time) {
    if (player.walkTarget) {
      ctx.strokeStyle = 'rgba(127, 212, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(player.walkTarget.x, player.walkTarget.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(player.walkTarget.x, player.walkTarget.y, 6, 0, Math.PI * 2); ctx.stroke();
    }
    // Shadow + body: a hooded thief in midnight blue.
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(player.x, player.y + 9, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.player;
    ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.playerDark;
    ctx.beginPath(); ctx.arc(player.x, player.y, player.radius - 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0d141c';
    ctx.beginPath(); ctx.arc(player.x + Math.cos(player.facing) * 4, player.y + Math.sin(player.facing) * 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8f6ff';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('WREN', player.x, player.y - player.radius - 8);
    if (player.lockpicking) {
      const p = player.lockpickProgress;
      ctx.fillStyle = '#0d141c';
      ctx.fillRect(player.x - 26, player.y - 34, 52, 8);
      ctx.fillStyle = '#ffd34d';
      ctx.fillRect(player.x - 25, player.y - 33, 50 * p, 6);
      ctx.fillStyle = '#ffe27a';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.fillText('PICKING LOCK…', player.x, player.y - 40);
    }
  }

  drawSmoke(ctx, smokes) {
    for (const s of smokes) {
      ctx.fillStyle = PALETTE.smoke;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(s.x - 30, s.y + 12, s.r * 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(s.x + 32, s.y - 10, s.r * 0.6, 0, Math.PI * 2); ctx.fill();
    }
  }

  drawHud(ctx, state) {
    const { alarm, loot, player, level, levelIndex, totalLevels, timeLeft, message } = state;
    ctx.fillStyle = PALETTE.hudBg;
    ctx.fillRect(0, 0, CANVAS_W, HUD_H);
    ctx.fillStyle = '#8a6d3b';
    ctx.fillRect(0, HUD_H - 3, CANVAS_W, 3);
    ctx.fillStyle = PALETTE.hudText;
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('THE MARLOW GALLERY HEIST', 20, 22);
    ctx.fillStyle = PALETTE.hudMuted;
    ctx.font = '14px Georgia, serif';
    ctx.fillText(`${level.name}  ·  Level ${levelIndex + 1}/${totalLevels}`, 20, 48);
    // Alarm meter — the heart of the HUD.
    const ax = 470, ay = 18, aw = 300, ah = 22;
    ctx.fillStyle = '#1a2632';
    roundRect(ctx, ax, ay, aw, ah, 6); ctx.fill();
    const col = alarm.band === 'high' ? PALETTE.alarmHigh : alarm.band === 'mid' ? PALETTE.alarmMid : PALETTE.alarmLow;
    ctx.fillStyle = col;
    if (alarm.value > 0) { roundRect(ctx, ax + 2, ay + 2, (aw - 4) * (alarm.value / ALARM_MAX), ah - 4, 5); ctx.fill(); }
    ctx.strokeStyle = '#e8e2d0';
    ctx.lineWidth = 1.5;
    roundRect(ctx, ax, ay, aw, ah, 6); ctx.stroke();
    ctx.fillStyle = '#0d141c';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(alarm.value >= 70 ? 'ALARM!' : 'ALARM', ax + aw / 2, ay + ah / 2 + 1);
    ctx.fillStyle = PALETTE.hudText;
    ctx.textAlign = 'left';
    ctx.font = 'bold 14px Georgia, serif';
    ctx.fillText(`ALARM ${Math.round(alarm.value)}%`, ax, ay + ah + 15);
    // Loot / credits / tools.
    ctx.fillStyle = PALETTE.hudText;
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText(`◆ ${loot.mainTaken ? '★ ' + loot.main.name : loot.main.name}  ${loot.mainTaken ? '✓' : loot.main.locked ? '(locked)' : '(grab it!)'}`, 800, 20);
    ctx.fillStyle = PALETTE.hudMuted;
    ctx.font = '14px Georgia, serif';
    ctx.fillText(`Coins ${player.credits}  ·  Smoke [1] ×${player.smokes} (15c)  ·  Jammer [2] ×${player.jammers} (20c)`, 800, 46);
    ctx.fillStyle = PALETTE.hudMuted;
    ctx.textAlign = 'right';
    ctx.fillText(`⏱ ${Math.max(0, Math.ceil(timeLeft))}s`, CANVAS_W - 20, 22);
    ctx.fillText('M mute · R restart', CANVAS_W - 20, 46);
    ctx.textAlign = 'left';
    if (message) {
      ctx.fillStyle = '#ffe27a';
      ctx.font = 'bold 16px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(message.text, CANVAS_W / 2, HUD_H + 26);
      ctx.textAlign = 'left';
    }
  }

  drawTitle(ctx, time) {
    ctx.fillStyle = 'rgba(10, 16, 24, 0.88)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE MARLOW GALLERY HEIST', CANVAS_W / 2, 190);
    ctx.fillStyle = '#e8e2d0';
    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillText('Three rooms. Three prizes. One very awake night shift.', CANVAS_W / 2, 240);
    ctx.fillStyle = '#8fa3b5';
    ctx.font = '17px Georgia, serif';
    ctx.fillText('WASD / arrows to move  ·  Shift to sneak  ·  Click the floor to walk there', CANVAS_W / 2, 320);
    ctx.fillText('F — pick up loot / hold F to pick a locked case  ·  1 — smoke bomb  ·  2 — camera jammer', CANVAS_W / 2, 350);
    ctx.fillText('Stay out of the red cones and the amber camera sweeps. Fill the alarm and you are caught.', CANVAS_W / 2, 380);
    ctx.fillText('Grab the main prize, then reach the green EXIT. Small loot and coins buy your tools.', CANVAS_W / 2, 410);
    const pulse = 0.6 + 0.4 * Math.sin(time * 3);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#39d98a';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.fillText('Press ENTER or click to begin', CANVAS_W / 2, 500);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#8fa3b5';
    ctx.font = '15px Georgia, serif';
    ctx.fillText('An original game — art, sound and names made for this heist.', CANVAS_W / 2, 560);
    ctx.textAlign = 'left';
  }

  drawEndScreen(ctx, title, lines, accent, hint) {
    ctx.fillStyle = 'rgba(10, 16, 24, 0.9)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = accent;
    ctx.font = 'bold 52px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, CANVAS_W / 2, 240);
    ctx.fillStyle = '#e8e2d0';
    ctx.font = '21px Georgia, serif';
    lines.forEach((line, i) => ctx.fillText(line, CANVAS_W / 2, 310 + i * 36));
    ctx.fillStyle = '#39d98a';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(hint, CANVAS_W / 2, 520);
    ctx.textAlign = 'left';
  }

  render(state) {
    const ctx = this.ctx;
    const { level, guards, cameras, loot, player, alarm, phase, time } = state;
    this.drawFloor(ctx);
    const solids = [...level.walls, ...level.cover];
    this.drawWalls(ctx, level.walls);
    this.drawCover(ctx, level.cover, level.plants);
    this.drawExit(ctx, level.exit, loot.mainTaken);
    this.drawLoot(ctx, loot, time);
    this.drawGuards(ctx, guards);
    this.drawCameras(ctx, cameras, state.jammerTime > 0);
    this.drawSmoke(ctx, state.smokes);
    this.drawPlayer(ctx, player, time);
    this.drawHud(ctx, state);
    if (phase === 'title') this.drawTitle(ctx, time);
    else if (phase === 'caught') {
      this.drawEndScreen(ctx, 'CAUGHT!', [
        state.caughtReason || 'The night shift found you.',
        `You reached Level ${state.levelIndex + 1} — ${level.name}.`,
        `Score so far: ${state.totalScore}`,
      ], '#ff4d4d', 'Press R or Enter to try the room again');
    } else if (phase === 'levelClear') {
      this.drawEndScreen(ctx, 'CLEAN GETAWAY!', [
        `You lifted the ${loot.main.name} from the ${level.name}.`,
        `Room score: ${loot.score}  ·  Total score: ${state.totalScore + loot.score}`,
        'The next room is already watching…',
      ], '#39d98a', 'Press Enter for the next room  ·  R to replay this room');
    } else if (phase === 'victory') {
      this.drawEndScreen(ctx, 'THE PERFECT HEIST!', [
        'All three prizes — Sapphire, Crown and Copper Moon — are yours.',
        `Final score: ${state.totalScore}  ·  Time: ${state.elapsedFormatted}`,
        'Wren slips into the night. The Marlow never knew what hit it.',
      ], '#ffd34d', 'Press R or Enter to play again');
    }
  }
}

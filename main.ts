// main.ts — hands The Marlow Gallery Heist in to make.fun (Node 22,
// standard library only). It copies this repository's game/ and
// screenshots/ into the output directory and writes dossier.json with
// the vendored make.fun library, exactly as the competition requires.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Outside the grader MAKEFUN_OUTPUT_DIR stands in for /output; the
// grader itself sets /output. The run is deterministic: same input
// files, same output bytes, every time.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

function fail(message: string): never {
  throw new Error(`main.ts: ${message}`);
}

function countEntries(dir: string): { entries: number; bytes: number } {
  let entries = 0;
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    entries += 1;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = countEntries(full);
      entries += sub.entries;
      bytes += sub.bytes;
    } else if (entry.isFile()) {
      bytes += statSync(full).size;
    } else {
      fail(`game/ holds a non-file entry: ${entry.name}`);
    }
  }
  return { entries, bytes };
}

function checkGameTree(gameDir: string): void {
  if (!existsSync(join(gameDir, 'index.html'))) fail('game/index.html is missing');
  if (!statSync(join(gameDir, 'index.html')).isFile()) fail('game/index.html is not a file');
  const { entries, bytes } = countEntries(gameDir);
  if (entries > 993) fail(`game/ holds ${entries} entries, over the 993 cap`);
  if (bytes > 50331648) fail(`game/ holds ${bytes} bytes, over the 48 MiB cap`);
}

const gameDir = join(repoRoot, 'game');
const shotsDir = join(repoRoot, 'screenshots');
checkGameTree(gameDir);

mkdirSync(outputDir, { recursive: true });
cpSync(gameDir, join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

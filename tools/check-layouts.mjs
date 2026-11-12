// Sprawdza układy z js/layouts.js i pokazuje, jak „ciasne” są w grze.
// Użycie: node tools/check-layouts.mjs [id układu …]
//
// Błędy: nieparzysta liczba kafelków, kafelki nachodzące na siebie na tym samym
// piętrze, kafelek wiszący w powietrzu (nic pod nim na piętrze niżej).
// Miary: ile kafelków jest wolnych na starcie, średnio i najwięcej w trakcie
// gry (losowe zbieranie par), oraz jak często losowe zbieranie kończy planszę.
// Reguły wolnego kafelka są takie same jak w js/game.js (computeNeighbors/freeWith).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const ctx = {};
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL('../js/layouts.js', import.meta.url), 'utf8') + ';this.Layouts = Layouts;', ctx);

const only = process.argv.slice(2);
const RUNS = 300;
let bad = 0;
const rows = [];

for (const l of ctx.Layouts.list) {
  if (only.length && !only.includes(l.id)) continue;
  const tiles = l.build().map((p, id) => ({ ...p, id }));
  const errors = [];
  if (tiles.length % 2) errors.push('nieparzysta liczba kafelków');
  for (const a of tiles) {
    for (const b of tiles) {
      if (a.id < b.id && a.z === b.z && Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2) {
        errors.push(`nachodzą na siebie: ${JSON.stringify(a)} i ${JSON.stringify(b)}`);
      }
    }
    if (a.z > 0 && !tiles.some((o) => o.z === a.z - 1 && Math.abs(o.x - a.x) < 2 && Math.abs(o.y - a.y) < 2)) {
      errors.push(`wisi w powietrzu: ${JSON.stringify(a)}`);
    }
  }
  for (const t of tiles) {
    t.above = []; t.left = []; t.right = [];
    for (const o of tiles) {
      if (o === t) continue;
      const dx = o.x - t.x;
      const dy = Math.abs(o.y - t.y);
      if (o.z > t.z && Math.abs(dx) < 2 && dy < 2) t.above.push(o.id);
      else if (o.z === t.z && dy < 2) {
        if (dx === -2) t.left.push(o.id);
        else if (dx === 2) t.right.push(o.id);
      }
    }
  }
  const freeOf = (on) => tiles.filter((t) => on.has(t.id) && !t.above.some((i) => on.has(i)) &&
    (!t.left.some((i) => on.has(i)) || !t.right.some((i) => on.has(i))));
  const start = freeOf(new Set(tiles.map((t) => t.id))).length;
  let sum = 0, n = 0, max = 0, cleared = 0;
  for (let r = 0; r < RUNS; r++) {
    const on = new Set(tiles.map((t) => t.id));
    while (on.size > 1) {
      const free = freeOf(on);
      sum += free.length; n++; max = Math.max(max, free.length);
      if (free.length < 2) break;
      const a = free.splice(Math.floor(Math.random() * free.length), 1)[0];
      const b = free[Math.floor(Math.random() * free.length)];
      on.delete(a.id); on.delete(b.id);
    }
    if (on.size === 0) cleared++;
  }
  if (errors.length) bad++;
  rows.push({
    id: l.id, name: l.name, count: l.count, size: `${l.cols}×${l.rows}`, phone: l.phone ? 'tel.' : 'duży',
    start, avg: sum / n, max, cleared: Math.round((100 * cleared) / RUNS), errors,
  });
}

rows.sort((a, b) => a.avg - b.avg);
console.log('układ'.padEnd(14) + 'nazwa'.padEnd(16) + 'kaf.'.padEnd(6) + 'wymiar'.padEnd(8) +
  'gdzie'.padEnd(7) + 'start'.padEnd(7) + 'średnio'.padEnd(9) + 'max'.padEnd(5) + 'losowo do końca');
for (const r of rows) {
  console.log(r.id.padEnd(14) + r.name.padEnd(16) + String(r.count).padEnd(6) + r.size.padEnd(8) +
    r.phone.padEnd(7) + String(r.start).padEnd(7) + r.avg.toFixed(1).padEnd(9) + String(r.max).padEnd(5) + `${r.cleared}%`);
  for (const e of r.errors.slice(0, 5)) console.log(`   ✗ ${e}`);
}
if (bad) {
  console.error(`\nUkłady z błędami: ${bad}`);
  process.exit(1);
}

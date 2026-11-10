// Zbiory obrazków na kafelkach.
const TileSets = (() => {
  const wrap = (inner) =>
    `<svg viewBox="0 0 60 80" class="tsvg" aria-hidden="true">${inner}</svg>`;

  // ---- Klasyczny zestaw (rysowany w SVG) ----
  const DOT_POS = {
    1: [[30, 40]],
    2: [[30, 20], [30, 60]],
    3: [[15, 17], [30, 40], [45, 63]],
    4: [[17, 20], [43, 20], [17, 60], [43, 60]],
    5: [[17, 18], [43, 18], [30, 40], [17, 62], [43, 62]],
    6: [[19, 17], [41, 17], [19, 40], [41, 40], [19, 63], [41, 63]],
    7: [[14, 11], [30, 20], [46, 29], [19, 49], [41, 49], [19, 68], [41, 68]],
    8: [[19, 11], [41, 11], [19, 30], [41, 30], [19, 50], [41, 50], [19, 69], [41, 69]],
    9: [[14, 16], [30, 16], [46, 16], [14, 40], [30, 40], [46, 40], [14, 64], [30, 64], [46, 64]],
  };
  const DOT_COLORS = ['#1e5aa8', '#c62828', '#2e7d32'];

  function dots(n) {
    const r = n === 1 ? 22 : n <= 4 ? 12 : n <= 6 ? 9.5 : 7.8;
    return wrap(
      DOT_POS[n]
        .map(([cx, cy], i) => {
          const c = n === 1 ? '#c62828' : DOT_COLORS[(i + n) % 3];
          return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${r * 0.32}"/>` +
            `<circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="${c}"/>`;
        })
        .join('')
    );
  }

  const BAMBOO_ROWS = {
    2: [[30], [30]],
    3: [[30], [18, 42]],
    4: [[18, 42], [18, 42]],
    5: [[16, 44], [30], [16, 44]],
    6: [[14, 30, 46], [14, 30, 46]],
    7: [[30], [14, 30, 46], [14, 30, 46]],
    8: [[12, 24, 36, 48], [12, 24, 36, 48]],
    9: [[14, 30, 46], [14, 30, 46], [14, 30, 46]],
  };

  function stick(cx, y, h, color, w = 10) {
    const x = cx - w / 2;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2.5}" fill="${color}"/>` +
      `<rect x="${x - 1}" y="${y + h / 2 - 1.2}" width="${w + 2}" height="2.4" rx="1" fill="#1b4d1f"/>` +
      `<rect x="${x - 1}" y="${y + 1}" width="${w + 2}" height="2" rx="1" fill="#1b4d1f"/>` +
      `<rect x="${x - 1}" y="${y + h - 3}" width="${w + 2}" height="2" rx="1" fill="#1b4d1f"/>`;
  }

  function bamboo(n) {
    if (n === 1) {
      return wrap(
        stick(30, 4, 72, '#2e7d32', 20) +
        `<circle cx="30" cy="14" r="8" fill="#c62828"/>`
      );
    }
    const rows = BAMBOO_ROWS[n];
    const gap = 3;
    const h = (74 - (rows.length - 1) * gap) / rows.length;
    let out = '';
    rows.forEach((row, ri) => {
      const y = 3 + ri * (h + gap);
      row.forEach((cx) => {
        const red = (n === 5 && ri === 1) || (n === 7 && ri === 0) || (n === 9 && cx === 30);
        out += stick(cx, y, h, red ? '#c62828' : '#2e7d32', n === 8 ? 8 : 10);
      });
    });
    return wrap(out);
  }

  const NUMERALS = '一二三四五六七八九';
  const cjk = (ch, color, size, y) =>
    `<text x="30" y="${y}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${color}" font-family="'Noto Serif CJK SC','Noto Sans CJK SC','MS Mincho','SimSun','Songti SC',serif">${ch}</text>`;

  function character(n) {
    return wrap(cjk(NUMERALS[n - 1], '#1a1a1a', 36, 35) + cjk('萬', '#c62828', 36, 76));
  }

  function bigChar(ch, color, small) {
    return wrap(
      cjk(ch, color, 54, 59) +
      (small ? `<text x="55" y="10" text-anchor="middle" font-size="10" font-weight="700" fill="${color}">${small}</text>` : '')
    );
  }

  const classicFaces = [];
  for (let n = 1; n <= 9; n++) classicFaces.push(() => dots(n));
  for (let n = 1; n <= 9; n++) classicFaces.push(() => bamboo(n));
  for (let n = 1; n <= 9; n++) classicFaces.push(() => character(n));
  ['東', '南', '西', '北'].forEach((c) => classicFaces.push(() => bigChar(c, '#123a6b')));
  classicFaces.push(() => bigChar('中', '#c62828'));
  classicFaces.push(() => bigChar('發', '#2e7d32'));
  classicFaces.push(() =>
    wrap(`<rect x="7" y="8" width="46" height="64" rx="5" fill="none" stroke="#1e5aa8" stroke-width="6"/>` +
      `<rect x="16" y="18" width="28" height="44" rx="3" fill="none" stroke="#1e5aa8" stroke-width="2.5"/>`)
  );
  ['梅', '蘭', '菊', '竹'].forEach((c, i) => classicFaces.push(() => bigChar(c, '#7b1fa2', i + 1)));
  ['春', '夏', '秋', '冬'].forEach((c, i) => classicFaces.push(() => bigChar(c, '#e65100', i + 1)));

  const classicCache = [];
  const classic = {
    id: 'classic',
    name: 'Klasyczny',
    size: classicFaces.length,
    render(i) {
      if (!classicCache[i]) classicCache[i] = classicFaces[i]();
      return classicCache[i];
    },
    preview: [0, 13, 31],
  };

  // ---- Zestawy emoji ----
  function emojiSet(id, name, chars) {
    const arr = Array.from(chars.matchAll(/\S+/g), (m) => m[0]);
    return {
      id,
      name,
      size: arr.length,
      render: (i) => `<span class="emoji">${arr[i]}</span>`,
      preview: [0, 1, 2],
    };
  }

  // Zestaw złożony z funkcji rysujących; każdy obrazek liczony raz.
  function facesSet(id, name, faces, preview) {
    const cache = [];
    return {
      id,
      name,
      size: faces.length,
      render(i) {
        if (!cache[i]) cache[i] = faces[i]();
        return cache[i];
      },
      preview,
    };
  }
  const emoji = (ch) => `<span class="emoji">${ch}</span>`;

  // ---- Muzyka: znaki nutowe (SVG) + instrumenty (emoji) ----
  const head = (cx, cy, color, hollow) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="9" ry="6.5" transform="rotate(-22 ${cx} ${cy})" ` +
    (hollow ? `fill="none" stroke="${color}" stroke-width="3.2"/>` : `fill="${color}"/>`);
  const stem = (x, y1, y2, color) =>
    `<rect x="${x - 1.6}" y="${y1}" width="3.2" height="${y2 - y1}" fill="${color}"/>`;
  const flag = (x, y, color) =>
    `<path d="M${x} ${y} c1 9 15 12 10 27 c0 -10 -5 -14 -10 -15 z" fill="${color}"/>`;
  const MUSIC_SVG = [
    // cała nuta
    (c) => `<ellipse cx="30" cy="40" rx="20" ry="13" fill="${c}"/>` +
      `<ellipse cx="30" cy="40" rx="6.5" ry="10.5" transform="rotate(-40 30 40)" fill="#fffdf4"/>`,
    // półnuta
    (c) => head(23, 60, c, true) + stem(31.5, 12, 58, c),
    // ćwierćnuta
    (c) => head(23, 60, c) + stem(31.5, 12, 58, c),
    // ósemka
    (c) => head(20, 62, c) + stem(28.5, 12, 60, c) + flag(28.5, 12, c),
    // szesnastka
    (c) => head(20, 64, c) + stem(28.5, 10, 62, c) + flag(28.5, 10, c) + flag(28.5, 22, c),
    // dwie ósemki z belką
    (c) => head(14, 64, c) + head(40, 58, c) + stem(22.5, 18, 62, c) + stem(48.5, 12, 56, c) +
      `<path d="M21 16 L50 10 L50 18 L21 24 Z" fill="${c}"/>`,
    // trzy szesnastki z belkami
    (c) => head(11, 64, c) + head(28, 61, c) + head(45, 58, c) +
      stem(19, 18, 62, c) + stem(36, 15, 59, c) + stem(53, 12, 56, c) +
      `<path d="M17.4 16 L54.6 9 L54.6 15 L17.4 22 Z M17.4 26 L54.6 19 L54.6 25 L17.4 32 Z" fill="${c}"/>`,
    // pauza ćwierćnutowa
    (c) => `<path d="M25 8 L39 25 L31 37 L41 51 C33 47 26 50 31 62 C19 56 21 43 32 45 L21 32 L29 21 Z" fill="${c}"/>`,
    // krzyżyk
    (c) => `<g fill="${c}"><rect x="21" y="10" width="4" height="60"/><rect x="35" y="8" width="4" height="60"/>` +
      `<path d="M12 31 L48 23 L48 31 L12 39 Z M12 51 L48 43 L48 51 L12 59 Z"/></g>`,
    // bemol
    (c) => `<rect x="17" y="6" width="4.5" height="66" fill="${c}"/>` +
      `<path d="M19 48 C30 34 46 38 40 52 C36 61 26 66 19 72 L19 64 C26 59 33 55 34 50 C36 43 26 44 19 56 Z" fill="${c}"/>`,
    // kasownik
    (c) => `<g fill="${c}"><rect x="18" y="8" width="4" height="50"/><rect x="38" y="22" width="4" height="50"/>` +
      `<path d="M18 30 L42 24 L42 32 L18 38 Z M18 50 L42 44 L42 52 L18 58 Z"/></g>`,
    // klucz basowy
    (c) => `<path d="M10 32 C10 16 34 12 40 26 C46 42 30 60 10 68 C26 56 34 44 32 30 C30 20 18 20 16 27 Z" fill="${c}"/>` +
      `<circle cx="15" cy="30" r="5.5" fill="${c}"/><circle cx="49" cy="25" r="3.6" fill="${c}"/><circle cx="49" cy="39" r="3.6" fill="${c}"/>`,
  ];
  const MUSIC_COLORS = ['#1e5aa8', '#c62828', '#2e7d32', '#6a1b9a', '#e65100', '#00838f',
    '#ad1457', '#3e2723', '#283593', '#558b2f', '#bf360c', '#37474f'];
  const MUSIC_EMOJI = '🎤 🎧 🎷 🎸 🎹 🎺 🎻 🥁 🪕 🪗 🪘 📯 🔔 📻 🎙️ 💿 📀 🔊 📢 🎚️ 🎛️ 🎼 💃 🕺'.split(' ');
  const musicFaces = [
    ...MUSIC_SVG.map((draw, i) => () => wrap(draw(MUSIC_COLORS[i]))),
    ...MUSIC_EMOJI.map((ch) => () => emoji(ch)),
  ];

  // ---- Kostki w stylu Minecrafta (piksele) ----
  // rows: tablica napisów, każdy znak to piksel ('.' = przezroczysty), pal: znak → kolor
  function pixels(rows, pal) {
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));
    const s = Math.min(52 / w, 70 / h);
    const x0 = (60 - w * s) / 2;
    const y0 = (80 - h * s) / 2;
    let out = '';
    rows.forEach((row, y) => {
      // łączymy sąsiednie piksele w tym samym kolorze w jeden prostokąt
      for (let x = 0; x < row.length; ) {
        const ch = row[x];
        let n = 1;
        while (row[x + n] === ch) n++;
        if (ch !== '.') {
          out += `<rect x="${(x0 + x * s).toFixed(2)}" y="${(y0 + y * s).toFixed(2)}" width="${(n * s + 0.3).toFixed(2)}" height="${(s + 0.3).toFixed(2)}" fill="${pal[ch]}"/>`;
        }
        x += n;
      }
    });
    return `<svg viewBox="0 0 60 80" class="tsvg px" shape-rendering="crispEdges" aria-hidden="true">${out}</svg>`;
  }
  const g = (s) => s.trim().split(/\s+/);

  const STONE = { s: '#8a8a8a', S: '#6c6c6c', l: '#a3a3a3' };
  const ORE = g(`ssSsssls sOOsSsss sOosssss SsssOOss ssssOoss sOssssSs lOOsssss sssSssOs`);
  const ore = (O, o) => () => pixels(ORE, { ...STONE, O, o });
  const WOOD = { p: '#b8945f', P: '#9c7a48', q: '#6f5230' };
  const HANDLE = '#7a5530';

  const PIXEL_SPRITES = [
    // bloki
    [g(`gggggggg gGgggGgg dgGdgdGd ddddDddd dDdddddD dddDdddd Dddddddd dddddDdd`),
      { g: '#5dab3c', G: '#3f8a2a', d: '#8b5a2b', D: '#6b4220' }],
    [g(`ddDddddd dddddDdd dDddlddd ddddDddd ldddddDd dDdddddd ddddDdld DddddddD`),
      { d: '#8b5a2b', D: '#6b4220', l: '#a77443' }],
    [g(`ssSsssls slsssSss sssSssss Sssslsss sssssssS ssSlssss lsssssSs sssSssss`), STONE],
    [g(`pppppppp pPpppPpp qqqqqqqq pppqpppp ppPqppPp qqqqqqqq ppppppqp pPppppqp`), WOOD],
    [g(`BBBBBBBB BppppppB BpPPPPpB BpPppPpB BpPppPpB BpPPPPpB BppppppB BBBBBBBB`),
      { B: '#5e4529', p: '#c29a63', P: '#8a6a3c' }],
    [g(`lLlklLkl kllLlklL LlkllLlk lLlLklll klllLlkL lLkllkLl lklLllLk LllkLlkl`),
      { l: '#3b8a2a', L: '#27621a', k: '#5cb845' }],
    [g(`aaAaaaaa aaaaaAaa Aaaaaaaa aaaAaaaA aaaaaaaa aAaaaAaa aaaaaaaa aaaAaaAa`),
      { a: '#e6d69c', A: '#cdb978' }],
    [g(`wwwwwwww wcccccww wccccwcw wcccwccw wccwcccw wcwccccw wwcccccw wwwwwwww`),
      { w: '#e9f9ff', c: '#a9dcef' }],
    [g(`rrrmrrrm Rrrmrrrm mmmmmmmm rmrrrmrr rmRrrmRr mmmmmmmm rrrmrrrm Rrrmrrrm`),
      { r: '#b04a32', R: '#8a3422', m: '#d3c4b5' }],
    [g(`RrRrRrRr RrRrRrRr wwwwwwww wkwkkwkw wkwkwkkw wwwwwwww RrRrRrRr RrRrRrRr`),
      { R: '#d6322b', r: '#a8231d', w: '#f2f2f2', k: '#222222' }],
    [g(`bbBbbbbb bcccbbBb cbbbcbbb bbBbbccc bbbccbbb ccbbbbBb bbccbbbc Bbbbcccb`),
      { b: '#3f76e4', B: '#2c58b8', c: '#78a4f2' }],
    [g(`oOooyyoo yoooOooy ooyyooOo OooooyyO ooOyyooo yyooOooy oooOooyy oyyooOoo`),
      { o: '#f07d14', O: '#c8400a', y: '#ffc62b' }],
    [g(`kkKkkkvk kKkkkKkk kkkvkkkK Kkkkkkkk kkvKkkKk kkkkkkkk vkKkkvkk kkkkKkkK`),
      { k: '#1b1226', K: '#3a2950', v: '#6a4a96' }],
    [g(`oOooOooO oOooOooO okkOokkO oOooOooO oOkkkkoO okkkkkkO oOooOooO oOooOooO`),
      { o: '#e38a1d', O: '#c46f10', k: '#3a2008' }],
    [g(`kkkkkkkk kppppppk kPPPPPPk kkkyykkk kppyyppk kPPPPPPk kppppppk kkkkkkkk`),
      { k: '#4a3216', p: '#b97f38', P: '#94632a', y: '#d0d0d0' }],
    [g(`pppppppp qqqqqqqq rbgyrbgk rbgyrbgk pppppppp gyrkbrgy gyrkbrgy pppppppp`),
      { ...WOOD, r: '#c0392b', b: '#2e5fb8', g: '#2e8b3a', y: '#e0b52a', k: '#6b3fa0' }],
    // rudy
    ...[['#262626', '#4a4a4a'], ['#d8af93', '#f0d5c2'], ['#f5d33a', '#fff3a0'],
      ['#3fdcd8', '#b8fffd'], ['#e01d1d', '#ff7b7b'], ['#17c544', '#95f2ad']].map(([O, o]) => [null, null, ore(O, o)]),
    // przedmioty
    [g(`.......... ..kkkkkk.. .kwcwccck. kwccccccCk kcccccccCk .kcccccCk. ..kccCCk.. ...kcCk... ....kk.... ..........`),
      { k: '#0e5d5b', w: '#e6ffff', c: '#4fe3e0', C: '#1fa8a5' }],
    [g(`........ww .......wcw ......wcC. .....wcC.. .k..wcC... ..kwcC.... ...kC..... ..hkk..... .h...k.... h.........`),
      { w: '#e6ffff', c: '#4fe3e0', C: '#1f9c99', k: '#2b2b2b', h: HANDLE }],
    [g(`..cccccc.. .cwwwwwcC. cC..hh..Cc c...hh...c ....hh.... ....hh.... ....hh.... ....hh.... ....hh.... ..........`),
      { c: '#c9c9c9', C: '#8f8f8f', w: '#f4f4f4', h: HANDLE }],
    [g(`..yyy.hh.. .yyyywhh.. yyyyyyhh.. .yYYyyhh.. ..YY..hh.. ......hh.. ......hh.. ......hh.. ......hh.. ......hh..`),
      { y: '#f5c518', Y: '#c9970c', w: '#fff3a0', h: HANDLE }],
    [g(`...hhhh... ...h..h... ....hh.... ....hh.... ....hh.... ...ssss... ..sllsss.. ..ssssSs.. ..sssSSs.. ...sSSs...`),
      { ...STONE, h: HANDLE }],
    [g(`....s.g... ....sgg... ..rrsrrr.. .rwrrrrrR. .rwrrrrrR. .rrrrrrrR. .rrrrrrRR. ..rrrrRR.. ...rRRR... ..........`),
      { r: '#d42a2a', R: '#9c1616', w: '#ff9a9a', s: '#5a3a10', g: '#3fa83a' }],
    [g(`.......... .......... ...bbbb... .bblblbbb. bblblblbbB bbbbbbbbBB .BBBBBBBB. .......... .......... ..........`),
      { b: '#c88a3a', B: '#94601f', l: '#ebc27a' }],
    [g(`......g.g. .......gg. ......ooO. .....oOo.. ....ooO... ...oOo.... ..ooO..... .oO....... .o........ ..........`),
      { o: '#f08a1a', O: '#c2620a', g: '#3fa83a' }],
    [g(`.......... ....yy.... ...yYYy... ...yYYy... ....hh.... ....hh.... ....hh.... ....hh.... ....hh.... ..........`),
      { y: '#ffe14a', Y: '#ff8a1a', h: HANDLE }],
    [g(`.......... .kk....kk. .k.kkkk.k. .kbbbbbbk. .kcccccck. ..kcccck.. ..kcccck.. ...kkkk... .......... ..........`),
      { k: '#6f6f6f', c: '#c8c8c8', b: '#3f76e4' }],
    [g(`.......... .rr...rr.. rwrr.rrrR. rwrrrrrrR. rrrrrrrrR. .rrrrrrR.. ..rrrrR... ...rrR.... ....R..... ..........`),
      { r: '#e0242b', R: '#9c1016', w: '#ff9a9a' }],
    [g(`....ww.... ...wwww... ..wwswww.. ..wwwwWw.. .wswwwwW.. .wwwwswW.. .wwwwwWW.. ..wwWWW... ...WWW.... ..........`),
      { w: '#f3e4c2', W: '#c4a473', s: '#b08a4e' }],
    [g(`.......... .......... .wwrwwrww. wwwwwwwwww wrwwwwrwwW bbbbbbbbbB bBbbbBbbbB bbbbbbbbbB .BBBBBBBB. ..........`),
      { w: '#fbfbfb', W: '#d9d9d9', r: '#e0242b', b: '#c88a3a', B: '#94601f' }],
    [g(`.......... .......... .....ff... ..ffffff.F .fkfffffFF .fffffffFF ..ffffff.F ....FF.... .......... ..........`),
      { f: '#6aa0c9', F: '#3f6f95', k: '#1a1a1a' }],
    [g(`.......... ...cccc... ..ckcccc.. .cccccKcc. .ccKccccc. .cccccckc. .ckccKcc.. ..cccccc.. ...cccc... ..........`),
      { c: '#d0954a', k: '#4a2a10', K: '#4a2a10' }],
    [g(`....kk.... ...kgwk... ..kgwggk.. .kggggGGk. .kgggggGk. ..kgggGk.. ...kgGk... ....kk.... .......... ..........`),
      { k: '#0b5a22', g: '#2fd35c', G: '#16a03f', w: '#c4ffd4' }],
    [g(`.......... .......... ...kkkkkk. ..kywwwyYk .kyyyyyyYk kyyyyyyYYk kYYYYYYYk. .kkkkkkk.. .......... ..........`),
      { k: '#8a6a0a', y: '#f5c518', Y: '#c9970c', w: '#fff3a0' }],
    [g(`.......... ...rr..... ..rRrr.... ..rrkr.... ...rr..... ....g..... ....g.gg.. ...ggg.... ....g..... ..........`),
      { r: '#e0242b', R: '#a8141a', k: '#222222', g: '#3fa83a' }],
    [g(`.......... ...rrrr... ..rwrrwr.. .rrrrrrwr. .rwrrrrrr. ...wwww... ...wwWw... ...wwWw... ...wwww... ..........`),
      { r: '#d42a2a', w: '#f7f2e8', W: '#d6cbb5' }],
    [g(`....kk.... ....ww.... ....ww.... ...wppw... ..wppppw.. ..wplppw.. ..wppppw.. ...wwww... .......... ..........`),
      { k: '#7a5530', w: '#d9eef7', p: '#b04ae0', l: '#e3a8ff' }],
  ];
  const pixelFaces = PIXEL_SPRITES.map(([rows, pal, fn]) => fn || (() => pixels(rows, pal)));

  // ---- Kotki: 6 umaszczeń × 6 dodatków ----
  const CAT_FURS = [
    { fur: '#f2a03d', mark: '#c66a12', eye: '#3b8a2a' },                      // rudy pręgowany
    { fur: '#9aa5b1', mark: '#5f6a76', eye: '#e3b31c' },                      // szary pręgowany
    { fur: '#2e2a2b', eye: '#f2d22e', whisk: '#d0d0d0', line: '#d0d0d0' },    // czarny
    { fur: '#ffffff', eye: '#3a8fd8', outline: '#b9aea2' },                   // biały
    { fur: '#f3e3c8', mask: '#6b4a35', eye: '#2f7fd8' },                      // syjamski
    { fur: '#ffffff', patches: ['#f08a24', '#2e2a2b'], eye: '#3b8a2a', outline: '#b9aea2' }, // łaciaty
  ];
  const CAT_EXTRAS = ['bow', 'crown', 'heart', 'sleep', 'fish', 'yarn'];

  function cat(f, extra) {
    const st = f.outline ? ` stroke="${f.outline}" stroke-width="1.6"` : '';
    const earL = f.patches ? f.patches[0] : f.mask || f.fur;
    const earR = f.patches ? f.patches[1] : f.mask || f.fur;
    const inner = f.mask ? '#3e2a1e' : '#f4a6b8';
    const line = f.line || '#3a2a20';
    let s = '';
    // uszy i głowa
    s += `<path d="M10 38 L13 15 L28 28 Z" fill="${earL}"${st}/><path d="M50 38 L47 15 L32 28 Z" fill="${earR}"${st}/>`;
    s += `<path d="M14 32 L15.5 21 L23 28 Z" fill="${inner}"/><path d="M46 32 L44.5 21 L37 28 Z" fill="${inner}"/>`;
    s += `<ellipse cx="30" cy="44" rx="21" ry="18" fill="${f.fur}"${st}/>`;
    if (f.patches) {
      s += `<ellipse cx="19" cy="36" rx="9" ry="8" fill="${f.patches[0]}"/><ellipse cx="42" cy="35" rx="7.5" ry="7" fill="${f.patches[1]}"/>`;
    }
    if (f.mark) {
      s += `<path d="M30 27 v7 M23.5 29 l2.5 5.5 M36.5 29 l-2.5 5.5" stroke="${f.mark}" stroke-width="2.6" stroke-linecap="round"/>` +
        `<path d="M9.5 42 h5 M9.5 47 h4.5 M50.5 42 h-5 M50.5 47 h-4.5" stroke="${f.mark}" stroke-width="2.2" stroke-linecap="round"/>`;
    }
    if (f.mask) s += `<ellipse cx="30" cy="52" rx="10" ry="7.5" fill="${f.mask}"/>`;
    // oczy
    if (extra === 'sleep') {
      s += `<path d="M18 44 q4 4 8 0 M34 44 q4 4 8 0" stroke="${line}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    } else {
      [22, 38].forEach((x) => {
        s += `<ellipse cx="${x}" cy="43" rx="4.4" ry="5.4" fill="${f.eye}"/><ellipse cx="${x}" cy="43.5" rx="1.7" ry="4.3" fill="#111"/>` +
          `<circle cx="${x + 1.5}" cy="40.8" r="1.3" fill="#fff"/>`;
      });
    }
    // nos, pyszczek, wąsy
    s += `<path d="M27 49.5 h6 l-3 3.2 z" fill="${f.mask ? '#2a1a12' : '#e8798f'}"/>`;
    s += `<path d="M30 52.5 q-2.5 4 -6 1.5 M30 52.5 q2.5 4 6 1.5" stroke="${f.mask ? '#e9d7bd' : line}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M17 51 L4 49 M17 54 L4 56.5 M43 51 L56 49 M43 54 L56 56.5" stroke="${f.whisk || '#5a5a5a'}" stroke-width="1.1" stroke-linecap="round"/>`;
    // dodatek
    switch (extra) {
      case 'bow':
        s += `<path d="M13 15 L3 9 L4 22 Z M13 15 L23 9 L22 22 Z" fill="#ff3d9a" stroke="#b0185f" stroke-width="1"/>` +
          `<circle cx="13" cy="15" r="3.2" fill="#ff7cbc" stroke="#b0185f" stroke-width="1"/>`;
        break;
      case 'crown':
        s += `<path d="M18 27 L17 11 L23.5 18 L30 7 L36.5 18 L43 11 L42 27 Z" fill="#f7c31a" stroke="#a87800" stroke-width="1.4" stroke-linejoin="round"/>` +
          `<circle cx="30" cy="21" r="2.4" fill="#e53935"/><circle cx="22.5" cy="23" r="1.7" fill="#1e88e5"/><circle cx="37.5" cy="23" r="1.7" fill="#43a047"/>`;
        break;
      case 'heart':
        s += `<path d="M50 20 C42 14 42 5 47 5 C49 5 50 7 50 8 C50 7 51 5 53 5 C58 5 58 14 50 20 Z" fill="#e53935" stroke="#a31515" stroke-width="1"/>`;
        break;
      case 'sleep':
        s += `<text x="45" y="20" font-size="11" font-weight="800" fill="#3f51b5" font-family="sans-serif">z</text>` +
          `<text x="51" y="11" font-size="14" font-weight="800" fill="#3f51b5" font-family="sans-serif">Z</text>`;
        break;
      case 'fish':
        s += `<ellipse cx="27" cy="71" rx="11" ry="5.5" fill="#2f8fe0" stroke="#145a9c" stroke-width="1"/>` +
          `<path d="M37 71 L46 65 L46 77 Z" fill="#2f8fe0" stroke="#145a9c" stroke-width="1"/><circle cx="21" cy="70" r="1.4" fill="#fff"/>`;
        break;
      case 'yarn':
        s += `<path d="M42 70 C34 76 22 70 14 76" stroke="#8e3fd0" stroke-width="1.6" fill="none"/>` +
          `<circle cx="47" cy="68" r="9" fill="#9c4fd6" stroke="#6a1fa8" stroke-width="1.2"/>` +
          `<path d="M39 64 q8 -3 15 3 M39 70 q9 -2 16 2 M43 76 q2 -9 9 -15" stroke="#d3a6f5" stroke-width="1.4" fill="none"/>`;
        break;
    }
    return wrap(s);
  }
  const catFaces = [];
  CAT_FURS.forEach((f) => CAT_EXTRAS.forEach((e) => catFaces.push(() => cat(f, e))));

  // ---- Góry i wspinaczka (SVG) ----
  const O = 'stroke="#2d2a26" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"';
  const line = (d, c, w) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const MOUNTAIN_SVG = [
    // szczyt z flagą
    () => `<path d="M3 72 L30 22 L57 72 Z" fill="#8795a4" ${O}/>` +
      `<path d="M30 41 L36 72 L57 72 L39.5 39.5 Z" fill="#66737f"/>` +
      `<path d="M30 22 L39.5 39.5 L34 36.5 L30 41 L26 36.5 L20.5 39.5 Z" fill="#fff" ${O}/>` +
      line('M30 22 V5', '#2d2a26', 1.8) + `<path d="M30 5 L46 9.5 L30 14 Z" fill="#e53935" ${O}/>`,
    // ośnieżone szczyty i słońce
    () => `<circle cx="42" cy="20" r="10" fill="#ffc928" ${O}/>` +
      `<path d="M14 72 L38 30 L58 72 Z" fill="#a3b6ca" ${O}/>` +
      `<path d="M38 30 L43.2 41 L40 39 L37 42 L34 39 L31.7 41 Z" fill="#fff" ${O}/>` +
      `<path d="M2 72 L20 36 L42 72 Z" fill="#5f7489" ${O}/>` +
      `<path d="M20 36 L26.7 47 L23 45 L20 48.5 L17 45 L14.5 47 Z" fill="#fff" ${O}/>`,
    // krzyż na szczycie
    () => `<path d="M2 74 C10 60 14 46 22 41 C26 37 34 37 38 41 C46 47 50 60 58 74 Z" fill="#8f949c" ${O}/>` +
      `<path d="M2 74 C8 66 12 62 16 64 C22 60 26 66 32 64 C40 62 46 68 58 74 Z" fill="#7cb342" ${O}/>` +
      `<g fill="#cfd5dc" stroke="#37474f" stroke-width="1.2"><rect x="28" y="9" width="4" height="30"/><rect x="20" y="16" width="20" height="4"/></g>`,
    // schronisko
    () => `<path d="M3 54 L20 26 L33 42 L43 30 L57 54 Z" fill="#b8c7d6" ${O}/>` +
      `<circle cx="42" cy="24" r="3" fill="#e3e8ec"/><circle cx="45" cy="17" r="3.8" fill="#e3e8ec"/>` +
      `<rect x="39" y="30" width="5" height="9" fill="#795548" ${O}/>` +
      `<rect x="13" y="44" width="34" height="28" fill="#b9773a" ${O}/>` +
      `<path d="M8 48 L30 27 L52 48 Z" fill="#5d3a1c" ${O}/>` +
      `<rect x="26" y="56" width="8" height="16" fill="#4a2c12" ${O}/>` +
      `<rect x="16" y="51" width="7" height="7" fill="#ffe082" ${O}/><rect x="37" y="51" width="7" height="7" fill="#ffe082" ${O}/>` +
      line('M5 72 H55', '#2d2a26', 1.6),
    // znak szlaku na drzewie
    () => `<rect x="16" y="3" width="28" height="74" rx="4" fill="#8d6e63" ${O}/>` +
      line('M21 8 V20 M38 6 V16 M23 56 V72 M37 58 V74', '#5d4037', 2) +
      `<rect x="20" y="26" width="20" height="8" fill="#fff" ${O}/><rect x="20" y="34" width="20" height="8" fill="#e53935" ${O}/><rect x="20" y="42" width="20" height="8" fill="#fff" ${O}/>`,
    // drogowskaz
    () => `<rect x="27" y="12" width="6" height="64" fill="#8d6e63" ${O}/>` +
      `<path d="M8 16 H46 L53 23 L46 30 H8 Z" fill="#ffd54f" ${O}/>` +
      `<rect x="11" y="19" width="7" height="8" fill="#e53935"/>` + line('M22 21 H42 M22 25 H36', '#5d4037', 1.6) +
      `<path d="M52 36 H14 L7 43 L14 50 H52 Z" fill="#ffd54f" ${O}/>` +
      `<rect x="42" y="39" width="7" height="8" fill="#1e88e5"/>` + line('M18 41 H38 M18 45 H32', '#5d4037', 1.6) +
      line('M14 76 H46', '#2d2a26', 1.6),
    // kopczyk z kamieni
    () => `<ellipse cx="30" cy="66" rx="19" ry="7" fill="#78838c" ${O}/>` +
      `<ellipse cx="29" cy="54" rx="14" ry="6" fill="#a4adb5" ${O}/>` +
      `<ellipse cx="31" cy="43.5" rx="11" ry="5" fill="#8a949c" ${O}/>` +
      `<ellipse cx="29" cy="34.5" rx="8" ry="4.5" fill="#b8c0c7" ${O}/>` +
      `<ellipse cx="30" cy="26.5" rx="5.5" ry="3.6" fill="#6f7a83" ${O}/>`,
    // górskie jezioro
    () => `<path d="M4 46 L20 18 L30 32 L40 14 L56 46 Z" fill="#7b8f9e" ${O}/>` +
      `<path d="M20 18 L25 27 L22 26 L20 28 L17.5 25.5 L15.6 26 Z M40 14 L45.6 24.5 L42 23 L40 26 L37.5 23 L34.8 23.5 Z" fill="#fff" ${O}/>` +
      `<path d="M4 46 H56 V60 C46 72 14 72 4 60 Z" fill="#3d97d4" ${O}/>` +
      `<path d="M9 46 L20 60 L30 52 L40 64 L51 46 Z" fill="#7fbfe8"/>` +
      line('M12 66 H22 M36 67 H46', '#d6efff', 1.6),
    // kolejka linowa
    () => line('M2 18 L58 40', '#2d2a26', 1.8) +
      `<circle cx="30" cy="29" r="2.6" fill="#555" ${O}/>` + line('M30 29 V38', '#2d2a26', 2) +
      `<path d="M2 78 L16 62 L28 70 L44 54 L58 66 V78 Z" fill="#7cb342" ${O}/>` +
      `<rect x="17" y="37" width="26" height="24" rx="4" fill="#e53935" ${O}/>` +
      `<rect x="20.5" y="41" width="19" height="9" rx="1.5" fill="#bfe6ff" ${O}/>` + line('M30 41 V50', '#2d2a26', 1.2),
    // namiot
    () => line('M30 22 V15', '#2d2a26', 2) +
      line('M30 22 L4 64 M30 22 L56 64', '#9e9e9e', 1) +
      `<path d="M9 66 L30 22 L51 66 Z" fill="#ff8f00" ${O}/>` +
      `<path d="M30 30 L22 66 H38 Z" fill="#6d3500" ${O}/>` +
      line('M3 66 H57', '#2d2a26', 1.8) +
      `<path d="M47 12 l1.4 3 3 .4 -2.2 2.1 .6 3 -2.8 -1.5 -2.8 1.5 .6 -3 -2.2 -2.1 3 -.4 Z" fill="#ffd54f"/>`,
    // ognisko
    () => `<rect x="8" y="60" width="44" height="8" rx="4" fill="#8d5a2b" transform="rotate(-14 30 64)" ${O}/>` +
      `<rect x="8" y="60" width="44" height="8" rx="4" fill="#a86b33" transform="rotate(14 30 64)" ${O}/>` +
      `<path d="M30 10 C40 24 46 34 44 46 C42 56 36 62 30 62 C24 62 18 56 16 46 C15 38 20 32 24 28 C24 36 27 38 29 36 C26 28 27 20 30 10 Z" fill="#ff6d2e" ${O}/>` +
      `<path d="M30 32 C36 40 38 46 36 52 C34 58 26 58 24 52 C23 46 27 42 30 32 Z" fill="#ffd54f"/>`,
    // kozica
    () => line('M25 30 C25 20 24 12 21 8 C19 6 16 8 17 11', '#1d1d1d', 3.6) +
      line('M35 30 C35 20 36 12 39 8 C41 6 44 8 43 11', '#1d1d1d', 3.6) +
      `<ellipse cx="14" cy="36" rx="8" ry="4" transform="rotate(25 14 36)" fill="#b07a45" ${O}/>` +
      `<ellipse cx="46" cy="36" rx="8" ry="4" transform="rotate(-25 46 36)" fill="#b07a45" ${O}/>` +
      `<path d="M30 27 C40 27 44 35 42 48 C40 60 36 70 30 72 C24 70 20 60 18 48 C16 35 20 27 30 27 Z" fill="#f3e6d2" ${O}/>` +
      line('M23 31 C21 40 23 52 27 63 M37 31 C39 40 37 52 33 63', '#4a3324', 4.2) +
      `<circle cx="23.5" cy="44" r="2.4" fill="#111"/><circle cx="36.5" cy="44" r="2.4" fill="#111"/>` +
      `<circle cx="24.3" cy="43.2" r=".8" fill="#fff"/><circle cx="37.3" cy="43.2" r=".8" fill="#fff"/>` +
      `<ellipse cx="30" cy="68" rx="4.5" ry="2.8" fill="#2d2a26"/>`,
    // świstak
    () => `<circle cx="20" cy="22" r="4" fill="#8a6038" ${O}/><circle cx="40" cy="22" r="4" fill="#8a6038" ${O}/>` +
      `<path d="M30 17 C41 17 45 28 44 42 C46 56 45 72 30 72 C15 72 14 56 16 42 C15 28 19 17 30 17 Z" fill="#a97c50" ${O}/>` +
      `<path d="M30 42 C37 42 39 52 38 61 C37 68 34 70 30 70 C26 70 23 68 22 61 C21 52 23 42 30 42 Z" fill="#e2c49b"/>` +
      `<ellipse cx="30" cy="35" rx="7" ry="5" fill="#e2c49b"/>` +
      `<circle cx="24" cy="28" r="2.2" fill="#111"/><circle cx="36" cy="28" r="2.2" fill="#111"/>` +
      `<ellipse cx="30" cy="32.5" rx="2.6" ry="1.8" fill="#2d2a26"/>` +
      `<rect x="28.4" y="36" width="3.2" height="3.4" rx=".6" fill="#fff" stroke="#2d2a26" stroke-width=".6"/>` +
      `<ellipse cx="25" cy="46" rx="3.6" ry="2.6" fill="#7a5532"/><ellipse cx="35" cy="46" rx="3.6" ry="2.6" fill="#7a5532"/>` +
      `<ellipse cx="22" cy="72" rx="5" ry="2.5" fill="#7a5532"/><ellipse cx="38" cy="72" rx="5" ry="2.5" fill="#7a5532"/>`,
    // orzeł
    () => {
      const wing = `<path d="M30 38 C24 28 16 15 2 9 L6 16 L1 19 L8 23 L4 27 L11 29.5 L8 33.5 L16 35 L14 40 C21 42 26 44 30 46 Z" fill="#6d4c2f" ${O}/>`;
      return wing + `<g transform="translate(60 0) scale(-1 1)">${wing}</g>` +
        `<path d="M24 56 H36 L40 72 L30 68 L20 72 Z" fill="#5a3d24" ${O}/>` +
        `<ellipse cx="30" cy="45" rx="8" ry="15" fill="#5a3d24" ${O}/>` +
        `<path d="M25 59 l-2 5 M27 60 l-.5 5 M35 59 l2 5 M33 60 l.5 5" stroke="#ffc107" stroke-width="2" stroke-linecap="round"/>` +
        `<circle cx="30" cy="29" r="7" fill="#c9a46b" ${O}/>` +
        `<path d="M28 32 L34 33.5 L30 38 Z" fill="#ffc107" ${O}/>` +
        `<circle cx="27.4" cy="28" r="1.2" fill="#111"/><circle cx="32.6" cy="28" r="1.2" fill="#111"/>`;
    },
    // szarotka
    () => {
      let s = line('M30 46 C30 58 29 66 30 77', '#5e7d4a', 2.6) +
        `<path d="M30 64 C22 60 17 62 14 66 C20 68 26 67 30 64 Z M30 60 C38 55 43 57 46 61 C40 63 34 63 30 60 Z" fill="#a3b593" ${O}/>`;
      for (let k = 0; k < 8; k++) {
        const L = k % 2 ? 17 : 23;
        s += `<path d="M30 36 C27 ${36 - L * 0.35} 27.5 ${36 - L * 0.75} 30 ${36 - L} C32.5 ${36 - L * 0.75} 33 ${36 - L * 0.35} 30 36 Z" fill="#fbfbf6" stroke="#9aa39a" stroke-width="1" transform="rotate(${k * 45 + 22.5} 30 36)"/>`;
      }
      return s + `<circle cx="30" cy="36" r="5.5" fill="#e3d46a" ${O}/>` +
        `<circle cx="28" cy="34.5" r="1.3" fill="#c7a52a"/><circle cx="32" cy="35" r="1.3" fill="#c7a52a"/><circle cx="30" cy="38.5" r="1.3" fill="#c7a52a"/>`;
    },
    // świerk w śniegu
    () => `<rect x="27" y="62" width="6" height="12" fill="#795548" ${O}/>` +
      `<path d="M30 30 L52 64 H8 Z" fill="#2e7d32" ${O}/>` +
      `<path d="M30 17 L47 44 H13 Z" fill="#388e3c" ${O}/>` +
      `<path d="M30 5 L42 26 H18 Z" fill="#43a047" ${O}/>` +
      `<path d="M30 5 L35.5 14.6 C33 13 31 15 30 14 C29 15 27 13 24.5 14.6 Z" fill="#fff"/>` +
      `<path d="M13 44 C17 40 21 44 24 42 C27 44 33 40 36 43 C40 41 44 44 47 44 Z M8 64 C13 60 18 63 22 61 C26 63 33 60 38 63 C43 60 48 63 52 64 Z" fill="#fff" ${O}/>` +
      line('M4 75 H56', '#2d2a26', 1.6),
    // noc w górach
    () => `<rect x="4" y="6" width="52" height="68" rx="6" fill="#1f3a68" ${O}/>` +
      `<circle cx="40" cy="22" r="8" fill="#ffe082"/><circle cx="44" cy="19" r="7" fill="#1f3a68"/>` +
      `<g fill="#fff"><circle cx="14" cy="16" r="1.3"/><circle cx="24" cy="24" r="1"/><circle cx="20" cy="12" r=".9"/><circle cx="50" cy="36" r="1"/><circle cx="12" cy="32" r=".9"/></g>` +
      `<path d="M5 58 L18 38 L28 50 L39 34 L55 58 V68 Q55 73 50 73 H10 Q5 73 5 68 Z" fill="#46658e" ${O}/>` +
      `<path d="M18 38 L22.5 45 L20 44 L18 46 L16 44 L14 45 Z M39 34 L44 41.5 L41.5 40.5 L39 43 L36.5 40.5 L34 41.5 Z" fill="#e8eef7"/>`,
    // czekan
    () => `<g transform="rotate(14 30 42)">` +
      `<rect x="27.5" y="15" width="5" height="58" rx="2" fill="#1e88e5" ${O}/>` +
      `<rect x="27.5" y="54" width="5" height="17" rx="2" fill="#263238" ${O}/>` +
      `<path d="M27.5 73 L30 79 L32.5 73 Z" fill="#b0bec5" ${O}/>` +
      `<path d="M27 9 H34 C43 10 51 15 55 24 C47 20 40 18 34 17 H27 Z" fill="#b0bec5" ${O}/>` +
      `<path d="M27 9 L21 10 L9 11 L9 17 L21 16.5 L27 17 Z" fill="#90a4ae" ${O}/>` +
      `<rect x="25" y="7" width="11" height="12" rx="2" fill="#78909c" ${O}/></g>`,
    // karabinek zakręcany
    () => {
      const d = 'M23 8 H35 C45 8 49 14 49 24 V55 C49 67 43 73 33 73 H26 C17 73 11 67 11 57 V24 C11 14 14 8 23 8 Z';
      return line(d, '#2d2a26', 8.4) + line(d, '#ff7a2f', 5.4) +
        `<rect x="7.5" y="24" width="7" height="31" rx="3" fill="#cfd8dc" ${O}/>` +
        `<rect x="6.5" y="40" width="9" height="14" rx="2.5" fill="#ffca28" ${O}/>` +
        line('M8 44 H14 M8 47 H14 M8 50 H14', '#a87800', 1);
    },
    // ekspres
    () => {
      const crab = (y, c) => {
        const d = `M24 ${y} H36 C41 ${y} 43 ${y + 4} 43 ${y + 9} V${y + 18} C43 ${y + 24} 40 ${y + 27} 34 ${y + 27} H26 C20 ${y + 27} 17 ${y + 24} 17 ${y + 18} V${y + 9} C17 ${y + 4} 19 ${y} 24 ${y} Z`;
        return line(d, '#2d2a26', 6.2) + line(d, c, 3.6);
      };
      return crab(3, '#1e88e5') + crab(50, '#9e9e9e') +
        `<rect x="22" y="24" width="16" height="32" rx="6" fill="#e53935" ${O}/>` +
        line('M26 31 H34 M26 49 H34', '#ffcdd2', 1.6);
    },
    // lina
    () => {
      const d = 'M30 36 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0 M30 36 m-15 0 a15 15 0 1 0 30 0 a15 15 0 1 0 -30 0 M30 36 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M49 47 C52 58 46 66 54 76';
      return line(d, '#2d2a26', 7.4) + line(d, '#43a047', 4.6) +
        `<path d="${d}" fill="none" stroke="#c8f0b0" stroke-width="1.6" stroke-dasharray="2.5 3.5"/>`;
    },
    // kask
    () => `<path d="M8 48 C8 28 18 17 30 17 C42 17 52 28 52 48 Z" fill="#e53935" ${O}/>` +
      `<path d="M14 36 C16 26 22 22 28 21" fill="none" stroke="#ff8a80" stroke-width="3" stroke-linecap="round"/>` +
      `<g fill="#2d2a26"><ellipse cx="30" cy="24" rx="4" ry="2"/><ellipse cx="20" cy="31" rx="2.2" ry="3.4" transform="rotate(30 20 31)"/><ellipse cx="40" cy="31" rx="2.2" ry="3.4" transform="rotate(-30 40 31)"/></g>` +
      `<rect x="5" y="45" width="50" height="7" rx="3.5" fill="#b71c1c" ${O}/>` +
      line('M15 52 L26 66 M45 52 L34 66', '#424242', 2.4) +
      `<rect x="25" y="63" width="10" height="6" rx="2" fill="#ffca28" ${O}/>`,
    // raki
    () => line('M14 34 C14 18 46 18 46 34', '#ff9800', 4) +
      `<path d="M6 34 H54 V40 H6 Z" fill="#b0bec5" ${O}/>` +
      `<path d="M9 40 L12 54 L15 40 M19 40 L22 54 L25 40 M29 40 L32 54 L35 40 M41 40 L44 54 L47 40" fill="#cfd8dc" ${O}/>` +
      `<path d="M6 34 L1 46 L7 40 Z M6 37 L2 50 L9 40 Z" fill="#cfd8dc" ${O}/>` +
      `<rect x="11" y="30" width="6" height="6" rx="1" fill="#ff9800" ${O}/><rect x="43" y="30" width="6" height="6" rx="1" fill="#ff9800" ${O}/>`,
    // but górski
    () => `<path d="M15 10 H31 L33 38 C42 40 51 44 54 53 V64 H9 V40 C9 28 12 20 15 10 Z" fill="#9a5b28" ${O}/>` +
      `<path d="M15 10 H31 L31.4 16 H14.2 Z" fill="#c62828" ${O}/>` +
      `<path d="M38 40 C46 42 52 46 54 53 V58 H40 Z" fill="#6d3d16"/>` +
      line('M25 20 L33 24 M25 24 L33 20 M25 28 L33 32 M25 32 L33 28', '#ffca28', 1.6) +
      `<path d="M7 64 H57 V69 C57 72 55 74 52 74 H11 C8 74 7 72 7 69 Z" fill="#333" ${O}/>` +
      line('M14 74 V70 M22 74 V70 M30 74 V70 M38 74 V70 M46 74 V70', '#777', 1.5),
    // plecak
    () => `<path d="M24 13 C24 7 36 7 36 13" fill="none" stroke="#2d2a26" stroke-width="2.2"/>` +
      `<rect x="13" y="14" width="34" height="54" rx="10" fill="#1e88e5" ${O}/>` +
      `<path d="M13 28 C13 12 47 12 47 28 V31 H13 Z" fill="#1565c0" ${O}/>` +
      `<rect x="18" y="42" width="24" height="20" rx="5" fill="#1565c0" ${O}/>` +
      `<rect x="20" y="28" width="5" height="9" rx="1" fill="#333"/><rect x="35" y="28" width="5" height="9" rx="1" fill="#333"/>` +
      line('M20 47 H40', '#90caf9', 1.6) +
      `<rect x="9" y="66" width="42" height="10" rx="5" fill="#ffb300" ${O}/>` + line('M14 66 V76', '#a87800', 1.2),
    // czołówka
    () => `<path d="M24 52 L36 52 L50 78 H10 Z" fill="#fff59d" opacity=".75"/>` +
      line('M10 38 C14 12 46 12 50 38', '#2d2a26', 6) + line('M10 38 C14 12 46 12 50 38', '#43a047', 3.6) +
      `<ellipse cx="30" cy="40" rx="22" ry="10" fill="none" stroke="#2d2a26" stroke-width="6"/>` +
      `<ellipse cx="30" cy="40" rx="22" ry="10" fill="none" stroke="#43a047" stroke-width="3.6"/>` +
      `<rect x="20" y="38" width="20" height="15" rx="3.5" fill="#424242" ${O}/>` +
      `<circle cx="30" cy="45.5" r="5.2" fill="#fffde7" ${O}/><circle cx="30" cy="45.5" r="2.5" fill="#fff176"/>`,
    // woreczek na magnezję
    () => `<g fill="#fff"><circle cx="22" cy="18" r="4"/><circle cx="29" cy="14" r="5"/><circle cx="37" cy="18" r="4"/><circle cx="31" cy="21" r="3.5"/></g>` +
      `<path d="M14 30 H46 V64 C46 73 14 73 14 64 Z" fill="#8e24aa" ${O}/>` +
      `<rect x="12" y="44" width="36" height="7" fill="#4a148c" ${O}/>` +
      `<ellipse cx="30" cy="30" rx="16" ry="5" fill="#d7d2c8" ${O}/>` +
      `<ellipse cx="30" cy="30.5" rx="12.5" ry="3.2" fill="#fff"/>` +
      line('M44 34 C50 38 50 44 52 48', '#f9a825', 1.6) + `<rect x="49.5" y="47" width="5" height="6" rx="1.5" fill="#f9a825" ${O}/>`,
    // kompas
    () => `<circle cx="30" cy="12" r="3.5" fill="none" stroke="#2d2a26" stroke-width="1.8"/>` +
      `<circle cx="30" cy="40" r="24" fill="#b0bec5" ${O}/><circle cx="30" cy="40" r="19" fill="#fffdf4" ${O}/>` +
      line('M30 23 V26 M30 54 V57 M13 40 H16 M44 40 H47', '#2d2a26', 1.6) +
      `<path d="M30 24 L35 40 H25 Z" fill="#e53935" ${O}/><path d="M30 56 L35 40 H25 Z" fill="#eceff1" ${O}/>` +
      `<circle cx="30" cy="40" r="2" fill="#2d2a26"/>` +
      `<text x="30" y="34" text-anchor="middle" font-size="6" font-weight="800" fill="#fff" font-family="sans-serif">N</text>`,
    // mapa
    () => `<path d="M5 16 L22 11 L38 16 L55 11 V64 L38 69 L22 64 L5 69 Z" fill="#fff3c4" ${O}/>` +
      `<path d="M22 11 L38 16 V69 L22 64 Z" fill="#f1dfa0"/>` + line('M22 11 V64 M38 16 V69', '#2d2a26', 1.2) +
      line('M10 30 C16 24 24 28 30 24 C36 21 44 26 50 22 M10 40 C18 34 26 38 32 34 C40 30 46 36 50 32', '#8bc34a', 1.4) +
      `<path d="M10 58 C16 52 20 50 26 52 C32 54 36 46 42 42" fill="none" stroke="#e53935" stroke-width="2" stroke-dasharray="3 2.4" stroke-linecap="round"/>` +
      `<path d="M45 36 L49 43 H41 Z" fill="#5d4037"/>`,
    // termos i kubek
    () => `<rect x="9" y="22" width="20" height="52" rx="5" fill="#2e7d32" ${O}/>` +
      `<rect x="7" y="9" width="24" height="14" rx="3" fill="#9e9e9e" ${O}/>` +
      line('M9 32 H29 M9 64 H29', '#a5d6a7', 1.6) +
      line('M42 46 C40 42 44 40 42 36 M48 46 C46 42 50 40 48 36', '#b0bec5', 1.6) +
      `<path d="M36 50 H54 L52 72 H38 Z" fill="#e53935" ${O}/>` +
      `<path d="M53.5 54 C59 54 59 64 52.6 64" fill="none" stroke="#2d2a26" stroke-width="1.8"/>`,
    // kijki trekkingowe
    () => line('M14 8 L46 74 M46 8 L14 74', '#2d2a26', 4.4) + line('M14 8 L46 74 M46 8 L14 74', '#90a4ae', 2.4) +
      line('M14 8 L19.5 19.5 M46 8 L40.5 19.5', '#212121', 6.5) +
      `<ellipse cx="41.5" cy="64.8" rx="5" ry="2" fill="#424242"/><ellipse cx="18.5" cy="64.8" rx="5" ry="2" fill="#424242"/>` +
      `<path d="M14 8 C6 10 6 20 13 19" fill="none" stroke="#e53935" stroke-width="2"/><path d="M46 8 C54 10 54 20 47 19" fill="none" stroke="#e53935" stroke-width="2"/>`,
    // lornetka
    () => `<rect x="11" y="16" width="13" height="14" rx="2" fill="#263238" ${O}/><rect x="36" y="16" width="13" height="14" rx="2" fill="#263238" ${O}/>` +
      `<rect x="23" y="32" width="14" height="10" rx="2" fill="#455a64" ${O}/>` +
      `<rect x="7" y="27" width="20" height="40" rx="7" fill="#37474f" ${O}/><rect x="33" y="27" width="20" height="40" rx="7" fill="#37474f" ${O}/>` +
      `<ellipse cx="17" cy="64" rx="8.5" ry="4.5" fill="#4fc3f7" ${O}/><ellipse cx="43" cy="64" rx="8.5" ry="4.5" fill="#4fc3f7" ${O}/>` +
      line('M12 38 V52 M38 38 V52', '#78909c', 2),
    // śpiwór
    () => `<path d="M30 6 C42 6 49 14 49 25 C49 45 45 62 41 74 H19 C15 62 11 45 11 25 C11 14 18 6 30 6 Z" fill="#f4511e" ${O}/>` +
      line('M14 42 C24 46 36 46 46 42 M15 54 C24 58 36 58 45 54 M17 66 C25 69 35 69 43 66', '#bf360c', 1.6) +
      `<ellipse cx="30" cy="23" rx="11" ry="12" fill="#ffab91" ${O}/>` +
      `<circle cx="30" cy="25" r="8" fill="#ffe0c2"/>` +
      line('M25 25 q2 2 4 0 M31 25 q2 2 4 0', '#5d4037', 1.3) +
      `<text x="45" y="12" font-size="9" font-weight="800" fill="#3f51b5" font-family="sans-serif">z</text>`,
    // chwyty na ściance
    () => `<rect x="5" y="5" width="50" height="70" rx="3" fill="#ddd3c8" ${O}/>` +
      `<g fill="#b8aa9a"><circle cx="12" cy="12" r="1"/><circle cx="48" cy="12" r="1"/><circle cx="30" cy="36" r="1"/><circle cx="12" cy="52" r="1"/><circle cx="48" cy="68" r="1"/><circle cx="38" cy="10" r="1"/></g>` +
      `<path d="M10 18 C12 10 24 10 26 17 C27 23 20 22 17 24 C12 26 9 23 10 18 Z" fill="#e53935" ${O}/>` +
      `<ellipse cx="42" cy="26" rx="9" ry="6.5" fill="#fdd835" ${O}/>` +
      `<path d="M13 42 H31 C32 46 30 48 27 48 H15 C12 48 11 45 13 42 Z" fill="#1e88e5" ${O}/>` +
      `<path d="M38 46 C46 42 52 48 49 56 C46 62 38 60 37 54 C36 50 36 48 38 46 Z" fill="#43a047" ${O}/>` +
      `<path d="M16 60 L26 58 L28 68 L18 70 Z" fill="#8e24aa" ${O}/>` +
      `<g fill="#555"><circle cx="18" cy="17" r="1.3"/><circle cx="42" cy="26" r="1.3"/><circle cx="22" cy="44.5" r="1.3"/><circle cx="43" cy="53" r="1.3"/><circle cx="22" cy="64" r="1.3"/></g>`,
    // wspinacz
    () => `<path d="M2 4 C10 30 6 50 12 78" fill="none" stroke="#ff7a2f" stroke-width="2"/>` +
      `<g fill="#9e9e9e" stroke="#2d2a26" stroke-width="1"><ellipse cx="16" cy="8" rx="4" ry="3"/><ellipse cx="48" cy="26" rx="4" ry="3"/><ellipse cx="18" cy="64" rx="4" ry="3"/><ellipse cx="44" cy="70" rx="4" ry="3"/></g>` +
      line('M27 26 L16 10 M33 28 L46 26', '#ffcc80', 3.4) +
      line('M28 48 L20 62 M32 48 L38 58 L43 68', '#37474f', 4.6) +
      line('M30 25 V46', '#1e88e5', 8) +
      `<rect x="25" y="44" width="10" height="5" rx="1.5" fill="#ffca28" ${O}/>` +
      line('M30 49 C24 56 14 50 12 60', '#ff7a2f', 2) +
      `<circle cx="30" cy="18" r="5.5" fill="#ffcc80" ${O}/>` +
      `<path d="M24 17 C24 9 36 9 36 17 Z" fill="#e53935" ${O}/>`,
    // niedźwiedź
    () => `<circle cx="15" cy="24" r="7.5" fill="#6d4c41" ${O}/><circle cx="45" cy="24" r="7.5" fill="#6d4c41" ${O}/>` +
      `<circle cx="15" cy="24" r="3.8" fill="#bc8f6f"/><circle cx="45" cy="24" r="3.8" fill="#bc8f6f"/>` +
      `<ellipse cx="30" cy="43" rx="21" ry="20" fill="#7b5544" ${O}/>` +
      `<ellipse cx="30" cy="52" rx="10" ry="8" fill="#d9b994" ${O}/>` +
      `<ellipse cx="30" cy="47.5" rx="4.2" ry="3" fill="#222"/>` +
      line('M30 50.5 V54 M26 56 q4 3 8 0', '#222', 1.5) +
      `<circle cx="22" cy="38" r="2.6" fill="#111"/><circle cx="38" cy="38" r="2.6" fill="#111"/>` +
      `<circle cx="22.9" cy="37.1" r=".9" fill="#fff"/><circle cx="38.9" cy="37.1" r=".9" fill="#fff"/>`,
  ];
  const mountainFaces = MOUNTAIN_SVG.map((draw) => () => wrap(draw()));

  const list = [
    classic,
    emojiSet('fruits', 'Owoce i warzywa',
      '🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🌽 🥕 🥔 🍠 🥜 🌰 🍄 🧅 🧄 🥐 🥖 🥨 🧀 🥚'),
    emojiSet('animals', 'Zwierzęta',
      '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🐤 🦆 🦉 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐢 🐍 🐙 🦀 🐠 🐬 🐘 🦒'),
    emojiSet('nature', 'Natura',
      '🌸 🌺 🌻 🌼 🌷 🌹 🥀 💐 🌱 🌲 🌳 🌴 🌵 🌿 ☘️ 🍀 🍁 🍂 🍃 🌾 🌍 🌙 ☀️ ⛅ 🌈 ❄️ 🔥 💧 🌊 ⚡ ☔ 🌋 🗻 🐚 🌕 🌪️'),
    emojiSet('sport', 'Sport i zabawa',
      '⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🎱 🏓 🏸 🥅 🏒 🏏 ⛳ 🏹 🎣 🥊 🥋 ⛸️ 🎿 🛷 🥌 🎯 🎳 🎮 🎲 🧩 🎨 🎭 🎪 🎤 🎧 🎷 🎸 🎺 🎻'),
    emojiSet('vehicles', 'Pojazdy',
      '🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🚚 🚛 🚜 🛴 🚲 🛵 🏍️ 🚨 🚔 🚍 🚖 🚡 🚠 🚃 🚋 🚝 🚄 🚂 ✈️ 🚀 🛸 🚁 ⛵ 🚤 🚢 🛶'),
    emojiSet('sweets', 'Słodycze',
      '🍦 🍧 🍨 🍩 🍪 🎂 🍰 🧁 🥧 🍫 🍬 🍭 🍮 🍯 🍼 🥛 ☕ 🍵 🧃 🥤 🍹 🍿 🥞 🧇 🥯 🍞 🥨 🍡 🍙 🍘 🥠 🥮 🍢 🍣 🍕 🍔'),
    facesSet('music', 'Muzyka', musicFaces, [2, 8, 15]),
    facesSet('minecraft', 'Minecraft (piksele)', pixelFaces, [0, 19, 23]),
    facesSet('cats', 'Kotki', catFaces, [0, 9, 26]),
    facesSet('mountains', 'Góry i wspinaczka', mountainFaces, [0, 19, 12]),
  ];

  return {
    list,
    get(id) {
      return list.find((s) => s.id === id) || list[0];
    },
  };
})();

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
  ];

  return {
    list,
    get(id) {
      return list.find((s) => s.id === id) || list[0];
    },
  };
})();

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
  ];

  return {
    list,
    get(id) {
      return list.find((s) => s.id === id) || list[0];
    },
  };
})();

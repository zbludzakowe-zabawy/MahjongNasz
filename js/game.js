(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const SLOTS = 4;
  const HELPS_PER_LEVEL = 2;
  const INITIAL_STARS = 4;
  const HIDDEN_COUNT = { none: 0, few: 6, many: 14 };
  // Zakryty kafelek odwraca się po kliknięciu (gdy jest wolny). Jeśli nie trafi
  // do pary, wraca rewersem do góry – po tylu odwróceniach zostaje odkryty na stałe.
  const FLIPS_TO_STAY = 4;
  // Tryb „zmienny”: z każdym poziomem przybywa zakrytych kafelków (2, 4, 6…)
  const VARIABLE_HIDDEN_STEP = 2;
  const VARIABLE_HIDDEN_MAX = 30;
  // Kafelek specjalny ×3: po zebraniu pary z takim kafelkiem gra sama zbiera kolejne pary.
  // Średnio jeden na tyle kafelków (co najmniej jeden na planszy).
  const BONUS_EVERY = 25;
  const BONUS_PAIRS = 3;

  // Poziom trudności (1-5) działa niezależnie od pozostałych opcji:
  //  ratio    – ile par przypada na jeden rodzaj obrazka (więcej = łatwiej)
  //  glow     – podświetlanie pasujących kafelków po zaznaczeniu
  //  solvable – gwarancja, że rozdanie da się rozwiązać
  // Przy ratio 1 każdy obrazek występuje (w miarę możliwości) tylko w jednej parze.
  const DIFFICULTY = {
    1: { ratio: 4, glow: true, solvable: true, label: 'Bardzo łatwy' },
    2: { ratio: 3, glow: false, solvable: true, label: 'Łatwy' },
    3: { ratio: 2, glow: false, solvable: true, label: 'Średni' },
    4: { ratio: 1.5, glow: false, solvable: true, label: 'Trudny' },
    5: { ratio: 1, glow: false, solvable: true, label: 'Ekspert' },
  };

  // Domyślny układ dla każdego rodzaju urządzenia
  const DEVICE_LAYOUT = { phone: 'castle', desktop: 'turtle' };
  // Propozycje układów w menu, zanim gracz zacznie wybierać własne
  const DEFAULT_LAYOUTS = {
    phone: ['castle', 'house', 'heart', 'tree', 'butterfly', 'cup', 'littleturtle'],
    desktop: ['turtle', 'pyramid', 'fortress', 'castle', 'butterfly', 'flower', 'heart'],
  };

  function detectDevice() {
    try {
      const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      const small = Math.min(window.screen.width, window.screen.height) < 768;
      return coarse && small ? 'phone' : 'desktop';
    } catch (e) {
      return 'desktop';
    }
  }

  // W menu widać tylko kilka najczęściej wybieranych układów i zestawów obrazków,
  // reszta czeka pod przyciskiem „Więcej…”. Dopóki gracz nic nie wybierał,
  // pokazujemy domyślne propozycje w tej kolejności.
  const FAV_LAYOUTS = 7;
  const FAV_TILESETS = 5;
  const DEFAULT_TILESETS = ['music', 'classic', 'cats', 'minecraft', 'nature'];

  const DEFAULTS = {
    v: 2, layout: null, tileset: 'music', hidden: 'none', stars: false, dim: false, difficulty: 3, device: null,
    mode: 'fixed', bonus: true, goal: 'all',
    layoutUse: {}, tilesetUse: {},
  };
  const settings = loadSettings();
  if (!settings.device) settings.device = detectDevice();
  if (!settings.layout) settings.layout = DEVICE_LAYOUT[settings.device];
  let showAllLayouts = false; // pokaż też rzadziej wybierane układy
  let showAllTilesets = false; // pokaż też rzadziej wybierane obrazki

  let S = null; // stan bieżącej gry
  let tileEls = [];
  let hintTimer = null;
  let geo = null; // wymiary kafelków z ostatniego layoutBoard()
  let mixToken = 0; // trwająca animacja miksowania (0 – brak)
  let flipLock = false; // odwrócony kafelek za chwilę zniknie w parze
  let autoToken = 0; // trwa automatyczne zbieranie par po kafelku ×3 (0 – nie)

  // ---------- narzędzia ----------
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const pick = (a) => a[Math.floor(Math.random() * a.length)];

  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem('mahjongnasz-settings') || '{}');
      // wersja 1 zapisywała domyślny „Klasyczny” – od wersji 2 domyślna jest „Muzyka”
      if (!s.v && s.tileset === 'classic') delete s.tileset;
      // wcześniej kafelki ×3 miały trzy poziomy: brak / rzadko / częściej
      if (typeof s.bonus === 'string') s.bonus = s.bonus !== 'none';
      return { ...DEFAULTS, ...s, v: DEFAULTS.v };
    } catch (e) {
      return { ...DEFAULTS };
    }
  }
  function countUse(key, id) {
    if (id === 'random') return;
    const m = settings[key] && typeof settings[key] === 'object' ? settings[key] : (settings[key] = {});
    m[id] = (m[id] || 0) + 1;
    saveSettings();
  }

  // Wybiera n ulubionych spośród `items` (najczęściej wybierane, potem kolejność
  // z `preferred`, potem kolejność listy). Bieżący wybór zawsze jest wśród nich.
  // Zwraca je w kolejności listy, żeby przyciski nie przeskakiwały.
  function favorites(items, use, preferred, n, current) {
    const rank = (it) => {
      const p = preferred.indexOf(it.id);
      return p < 0 ? preferred.length + items.indexOf(it) : p;
    };
    const sorted = items.slice().sort((a, b) => ((use[b.id] || 0) - (use[a.id] || 0)) || (rank(a) - rank(b)));
    let fav = sorted.slice(0, n);
    const cur = items.find((it) => it.id === current);
    if (cur && !fav.includes(cur)) fav = fav.slice(0, n - 1).concat(cur);
    return items.filter((it) => fav.includes(it));
  }

  function saveSettings() {
    try {
      localStorage.setItem('mahjongnasz-settings', JSON.stringify(settings));
    } catch (e) { /* brak dostępu do pamięci – trudno */ }
  }

  // ---------- zapis bieżącej partii ----------
  // Telefon potrafi zamknąć aplikację w tle, a aktualizacja przeładowuje stronę –
  // partia jest więc zapisywana po każdym ruchu i wraca po ponownym otwarciu.
  const GAME_KEY = 'mahjongnasz-game';

  function saveGame() {
    if (!S) return;
    try {
      if (S.over && !S.tiles.some((t) => t.loc !== 'gone')) {
        localStorage.removeItem(GAME_KEY);
        return;
      }
      localStorage.setItem(GAME_KEY, JSON.stringify({
        v: 1,
        layout: S.layout.id,
        tileset: S.tileset.id,
        difficulty: S.diffKey,
        tiles: S.tiles.map((t) => [t.x, t.y, t.z, t.face, t.star ? 1 : 0, t.faceDown ? 1 : 0, t.loc, t.slot, t.flips, t.bonus ? 1 : 0]),
        tray: S.tray,
        helps: S.helps,
        // cofnąć można najwyżej tyle ruchów, ile zostało cofnięć
        history: S.helps.undo > 0 ? S.history.slice(-S.helps.undo) : [],
        solution: S.solution,
        starPath: S.starPath,
        level: S.level,
        stars: S.stars,
        hiddenN: S.hiddenN,
        starsAge: S.starsAge,
        goal: S.goal,
        elapsed: S.over ? S.elapsed : Date.now() - S.start,
      }));
    } catch (e) { /* brak miejsca lub dostępu – gra działa dalej bez zapisu */ }
  }

  function clearSavedGame() {
    try { localStorage.removeItem(GAME_KEY); } catch (e) { /* trudno */ }
  }

  function restoreGame() {
    let g;
    try {
      g = JSON.parse(localStorage.getItem(GAME_KEY) || 'null');
    } catch (e) {
      return false;
    }
    if (!g || g.v !== 1 || !Array.isArray(g.tiles) || !g.tiles.length) return false;
    const layout = Layouts.list.find((l) => l.id === g.layout);
    const tileset = TileSets.list.find((t) => t.id === g.tileset);
    const diff = DIFFICULTY[g.difficulty];
    if (!layout || !tileset || !diff) return false;
    const tiles = g.tiles.map(([x, y, z, face, star, faceDown, loc, slot, flips, bonus], id) => ({
      id, x, y, z, face, star: !!star, faceDown: !!faceDown, loc, slot, flips: flips || 0, bonus: !!bonus,
    }));
    computeNeighbors(tiles);
    S = {
      tiles, tileset, diff, diffKey: g.difficulty, layout,
      solution: g.solution || null,
      tray: g.tray,
      selected: null,
      helps: g.helps,
      history: g.history || [],
      hint: [],
      newStars: [],
      starPath: Array.isArray(g.starPath) ? g.starPath : [],
      level: g.level || 1,
      stars: typeof g.stars === 'boolean' ? g.stars : settings.stars,
      hiddenN: typeof g.hiddenN === 'number' ? g.hiddenN : tiles.filter((t) => t.faceDown).length,
      starsAge: g.starsAge || 0,
      goal: g.goal === 'kinds' ? 'kinds' : 'all',
      kindsTotal: new Set(tiles.map((t) => t.face)).size,
      start: Date.now() - (g.elapsed || 0),
      elapsed: 0,
      over: false,
    };
    hideModals();
    buildBoard();
    render();
    layoutBoard();
    if (isStuck()) setTimeout(showStuck, 450);
    return true;
  }

  // ---------- geometria planszy ----------
  function computeNeighbors(tiles) {
    for (const t of tiles) {
      t.above = [];
      t.left = [];
      t.right = [];
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
  }

  // "present" – funkcja mówiąca, czy dany kafelek leży na planszy
  function freeWith(t, present) {
    if (t.above.some(present)) return false;
    return !t.left.some(present) || !t.right.some(present);
  }

  const onBoard = (id) => S.tiles[id].loc === 'board';
  const isFree = (t) => t.loc === 'board' && freeWith(t, onBoard);
  // zakryty kafelek widać tylko wtedy, gdy jest właśnie odwrócony (zaznaczony)
  const isRevealed = (t) => !t.faceDown || t.loc !== 'board' || S.selected === t.id;

  // Buduje kolejność zdejmowania par, która gwarantuje rozwiązanie
  // (zdejmujemy pary aktualnie wolnych kafelków aż do opróżnienia).
  function solvableOrder(list, all) {
    for (let attempt = 0; attempt < 80; attempt++) {
      const present = new Uint8Array(all.length);
      list.forEach((t) => (present[t.id] = 1));
      const has = (id) => present[id] === 1;
      const pairs = [];
      let remaining = list.length;
      let ok = true;
      while (remaining > 1) {
        const free = list.filter((t) => present[t.id] && freeWith(t, has));
        if (free.length < 2) { ok = false; break; }
        // preferuj wyżej położone kafelki – mniej ślepych zaułków
        const maxZ = Math.max(...free.map((t) => t.z));
        const high = free.filter((t) => t.z === maxZ);
        const a = Math.random() < 0.6 ? pick(high) : pick(free);
        const b = pick(free.filter((t) => t !== a));
        pairs.push([a, b]);
        present[a.id] = present[b.id] = 0;
        remaining -= 2;
      }
      if (ok) return { pairs, rest: list.filter((t) => present[t.id]) };
    }
    return null;
  }

  // ---------- nowa gra ----------
  const variableHidden = (level) => Math.min(VARIABLE_HIDDEN_MAX, VARIABLE_HIDDEN_STEP * level);

  // variant – gotowe parametry planszy (tryb zmienny, ponowna gra);
  // bez niego plansza powstaje z ustawień z menu
  function newGame(level, variant) {
    clearStarShow();
    stopMix();
    flipLock = false;
    autoToken = 0;
    const v = variant || {
      layout: settings.layout,
      tileset: settings.tileset,
      stars: settings.stars,
      hidden: settings.mode === 'variable' ? variableHidden(level) : (HIDDEN_COUNT[settings.hidden] || 0),
      starsAge: 0,
    };
    if (!variant) {
      countUse('layoutUse', settings.layout);
      countUse('tilesetUse', settings.tileset);
    }
    const layout = Layouts.get(v.layout, settings.device);
    const tileset = TileSets.get(v.tileset);
    const diff = DIFFICULTY[settings.difficulty] || DIFFICULTY[3];

    let pos = layout.build();
    // na ekranie pionowym obracamy szeroki układ, by kafelki były większe
    const spanX = Math.max(...pos.map((p) => p.x)) - Math.min(...pos.map((p) => p.x)) + 2;
    const spanY = (Math.max(...pos.map((p) => p.y)) - Math.min(...pos.map((p) => p.y)) + 2) * 1.3;
    const portrait = boardWrap.clientHeight > boardWrap.clientWidth * 1.15;
    // na telefonie układ ma być najwyżej PHONE_MAX[0] kafelków szeroki
    const tooWide = settings.device === 'phone' && spanX / 2 > Layouts.PHONE_MAX[0] && spanX > spanY / 1.3;
    if (portrait && (spanX > spanY * 1.1 || tooWide)) pos = pos.map((p) => ({ x: p.y, y: p.x, z: p.z }));
    const minX = Math.min(...pos.map((p) => p.x));
    const minY = Math.min(...pos.map((p) => p.y));
    const tiles = pos.map((p, i) => ({
      id: i, x: p.x - minX, y: p.y - minY, z: p.z,
      face: -1, star: false, faceDown: false, flips: 0, loc: 'board', slot: -1, bonus: false,
    }));
    computeNeighbors(tiles);

    // przydział obrazków
    const P = tiles.length / 2;
    const T = Math.max(2, Math.min(tileset.size, Math.ceil(P / diff.ratio)));
    const types = shuffle([...Array(tileset.size).keys()]).slice(0, T);
    const pairFaces = shuffle(Array.from({ length: P }, (_, i) => types[i % T]));
    const order = diff.solvable ? solvableOrder(tiles, tiles) : null;
    if (order) {
      order.pairs.forEach(([a, b], i) => (a.face = b.face = pairFaces[i]));
    } else {
      const sh = shuffle(tiles.slice());
      for (let i = 0; i < P; i++) sh[2 * i].face = sh[2 * i + 1].face = pairFaces[i];
    }

    // kafelki rewersem do góry – tylko te, które są czymś przykryte
    const hiddenN = v.hidden || 0;
    if (hiddenN) {
      shuffle(tiles.filter((t) => t.above.length > 0))
        .slice(0, hiddenN)
        .forEach((t) => (t.faceDown = true));
    }

    // kafelki ×3 – najpierw spośród odkrytych
    if (settings.bonus) {
      const n = Math.max(1, Math.round(tiles.length / BONUS_EVERY));
      const open = shuffle(tiles.filter((t) => !t.faceDown));
      const closed = shuffle(tiles.filter((t) => t.faceDown));
      open.concat(closed).slice(0, n).forEach((t) => (t.bonus = true));
    }

    // gwiazdki
    if (v.stars) {
      shuffle(tiles.filter((t) => !t.faceDown)).slice(0, INITIAL_STARS).forEach((t) => (t.star = true));
    }

    S = {
      tiles, tileset, diff, diffKey: DIFFICULTY[settings.difficulty] ? settings.difficulty : 3, layout,
      solution: order ? order.pairs.map(([a, b]) => [a.id, b.id]) : null,
      tray: Array(SLOTS).fill(null),
      selected: null,
      helps: { hint: HELPS_PER_LEVEL, undo: HELPS_PER_LEVEL, shuffle: HELPS_PER_LEVEL },
      history: [],
      hint: [],
      newStars: [],
      starPath: [],
      level,
      stars: !!v.stars,
      hiddenN,
      starsAge: v.starsAge || 0,
      goal: settings.goal === 'kinds' ? 'kinds' : 'all',
      kindsTotal: new Set(tiles.map((t) => t.face)).size,
      start: Date.now(),
      elapsed: 0,
      over: false,
    };
    hideModals();
    buildBoard();
    render();
    layoutBoard();
    saveGame();
  }

  // ---------- ruchy ----------
  function snapshot() {
    S.history.push({
      tiles: S.tiles.map((t) => [t.loc, t.slot, t.star, t.face, t.faceDown, t.flips]),
      tray: S.tray.slice(),
      starLen: S.starPath.length,
    });
    if (S.history.length > 300) S.history.shift();
  }

  function clickTile(t) {
    if (!S || S.over || mixToken || flipLock || autoToken) return;
    if (t.loc === 'board' && !isFree(t)) {
      nudge(t);
      return;
    }
    clearHint();
    // zakryty kafelek: odwróć go i zaznacz; pasujący zaznaczony kafelek lub kafelek
    // ze schowka od razu tworzy z nim parę (po chwili, żeby było widać obrazek)
    if (t.loc === 'board' && t.faceDown && S.selected !== t.id) {
      t.flips = (t.flips || 0) + 1;
      if (t.flips >= FLIPS_TO_STAY) t.faceDown = false;
      const sel = S.selected !== null ? S.tiles[S.selected] : null;
      const twin = sel && sel.face === t.face ? sel : trayTwin(t);
      S.selected = t.id;
      if (twin) {
        S.hint = [twin.id, t.id];
        flipLock = true;
        render();
        const game = S;
        setTimeout(() => {
          if (S !== game) return;
          flipLock = false;
          if (t.loc === 'board' && twin.loc !== 'gone') removePair(twin, t);
        }, 450);
        return;
      }
      render();
      saveGame();
      return;
    }
    // kafelek ze stosu, do którego pasuje kafelek ze schowka – para od jednego kliknięcia
    if (t.loc === 'board' && S.selected !== t.id) {
      const sel = S.selected !== null ? S.tiles[S.selected] : null;
      const twin = sel && sel.face === t.face ? sel : trayTwin(t);
      if (twin) {
        removePair(twin, t);
        return;
      }
    }
    if (S.selected === null) {
      S.selected = t.id;
    } else if (S.selected === t.id) {
      S.selected = null;
    } else {
      const s = S.tiles[S.selected];
      if (s.face === t.face) {
        removePair(s, t);
        return;
      }
      S.selected = t.id;
    }
    render();
  }

  function trayTwin(t) {
    for (const id of S.tray) {
      if (id !== null && id !== t.id && S.tiles[id].face === t.face) return S.tiles[id];
    }
    return null;
  }

  function clickSlot(i) {
    if (!S || S.over || mixToken || flipLock || autoToken || S.tray[i] !== null || S.selected === null) return;
    const t = S.tiles[S.selected];
    if (t.loc === 'board') moveToTray(t, i);
  }

  function moveToTray(t, slot) {
    if (slot === undefined) slot = S.tray.indexOf(null);
    if (slot < 0) {
      toast('Schowek jest pełny');
      return;
    }
    clearHint();
    snapshot();
    t.loc = 'tray';
    t.slot = slot;
    S.tray[slot] = t.id;
    S.selected = null;
    S.newStars = [];
    // dwa takie same kafelki w schowku od razu tworzą parę
    const twin = S.tray.map((id) => (id === null ? null : S.tiles[id]))
      .find((o) => o && o !== t && o.face === t.face);
    if (twin) {
      S.hint = [twin.id, t.id];
      render();
      setTimeout(() => {
        if (t.loc === 'tray' && twin.loc === 'tray') removePair(twin, t, true);
      }, 220);
      return;
    }
    afterMove();
  }

  // skipSnapshot – ruch był już zapisany (para dopasowana w schowku albo
  // zebrana automatycznie po kafelku ×3 – cofnięcie cofa wtedy całą serię)
  function removePair(a, b, skipSnapshot) {
    clearHint();
    if (!skipSnapshot) snapshot();
    for (const t of [a, b]) {
      if (t.loc === 'tray') S.tray[t.slot] = null;
      t.loc = 'gone';
      t.slot = -1;
    }
    S.selected = null;
    S.newStars = [];

    const starsTaken = (a.star ? 1 : 0) + (b.star ? 1 : 0);
    // zapamiętaj, gdzie na stosie znaleziono gwiazdki – do animacji zwycięstwa
    for (const t of [a, b]) if (t.star) S.starPath.push(t.id);
    if (S.stars && starsTaken > 0) {
      const want = starsTaken * 2; // 1 gwiazdka -> 2 nowe, 2 gwiazdki -> 4 nowe
      const cand = S.tiles.filter((t) => t.loc === 'board' && !t.star);
      const visible = shuffle(cand.filter(isRevealed));
      const hidden = shuffle(cand.filter((t) => !isRevealed(t)));
      const chosen = visible.concat(hidden).slice(0, want);
      chosen.forEach((t) => (t.star = true));
      S.newStars = chosen.map((t) => t.id);
    }
    const bonus = (a.bonus ? 1 : 0) + (b.bonus ? 1 : 0);
    if (bonus) startAuto(bonus * BONUS_PAIRS);
    afterMove();
  }

  // ---------- kafelek ×3: automatyczne zbieranie par ----------
  // Para do zebrania: najpierw z zaplanowanego rozwiązania (zdjęcie jego pary
  // wcześniej nie psuje reszty rozwiązania), potem dowolna dostępna.
  // Kafelki rewersem do góry na stosie są pomijane.
  function autoPair() {
    const ok = (t) => t.loc === 'tray' || (isFree(t) && !t.faceDown);
    if (S.solution) {
      for (const [i, j] of S.solution) {
        const a = S.tiles[i];
        const b = S.tiles[j];
        if (a.loc !== 'gone' && b.loc !== 'gone' && a.face === b.face && ok(a) && ok(b)) return [a, b];
      }
    }
    const byFace = new Map();
    const cand = S.tiles.filter((t) => t.loc !== 'gone' && ok(t))
      .sort((a, b) => (a.loc === 'board' ? 0 : 1) - (b.loc === 'board' ? 0 : 1));
    for (const t of cand) {
      const prev = byFace.get(t.face);
      if (prev) return [prev, t];
      byFace.set(t.face, t);
    }
    return null;
  }

  function startAuto(n) {
    S.autoLeft = (S.autoLeft || 0) + n;
    S.autoWanted = (S.autoWanted || 0) + n;
    if (autoToken) { // już trwa – kolejny kafelek ×3 wydłuża serię
      toast(`✨ Kolejny kafelek ×3! +${n} pary`, 2000);
      return;
    }
    S.autoDone = 0;
    const token = ++autoToken;
    const game = S;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const T = reduce ? { first: 250, show: 250, fly: 0, next: 150 } : { first: 600, show: 450, fly: 400, next: 250 };
    toast(`✨ Kafelek ×3! Zbieram ${n} ${n === 3 ? 'kolejne pary' : 'par'}…`, 2000);
    const alive = () => token === autoToken && S === game && !S.over;
    const finish = () => {
      autoToken = 0;
      S.auto = [];
      const done = S.autoDone;
      const wanted = S.autoWanted;
      S.autoLeft = S.autoWanted = S.autoDone = 0;
      render();
      saveGame();
      if (done < wanted) toast(done ? `Zebrano ${done} z ${wanted} par – więcej nie było dostępnych` : 'Brak dostępnych par do zebrania');
      if (isStuck()) setTimeout(showStuck, 450);
    };
    const step = () => {
      if (!alive()) return;
      const pair = S.autoLeft > 0 ? autoPair() : null;
      if (!pair) return finish();
      S.autoLeft--;
      S.auto = pair.map((t) => t.id);
      render();
      setTimeout(() => {
        if (!alive()) return;
        const anims = reduce ? [] : flyTogether(pair, T.fly);
        setTimeout(() => {
          if (!alive()) return;
          S.auto = [];
          S.autoDone++;
          removePair(pair[0], pair[1], true);
          setTimeout(() => anims.forEach((an) => an.cancel()), 350);
          if (!S.over) setTimeout(step, T.next);
        }, T.fly);
      }, T.show);
    };
    setTimeout(step, T.first);
  }

  // kafelki pary zlatują się do siebie, rosną i znikają w wirze
  function flyTogether(pair, ms) {
    const onBoard = pair.filter((t) => t.loc === 'board');
    if (!geo || !onBoard.length) return [];
    const cs = onBoard.map(tileCenter);
    const mx = cs.reduce((s, c) => s + c.x, 0) / cs.length;
    const my = cs.reduce((s, c) => s + c.y, 0) / cs.length;
    return onBoard.map((t, i) => {
      const dx = (mx - cs[i].x).toFixed(1);
      const dy = (my - cs[i].y - geo.th * 0.3).toFixed(1);
      const el = tileEls[t.id];
      el.style.zIndex = '150000';
      return el.animate([
        { transform: 'none', opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) scale(1.25) rotate(${i ? 12 : -12}deg)`, opacity: 1, offset: 0.65 },
        { transform: `translate(${dx}px,${dy}px) scale(.15) rotate(${i ? 200 : -200}deg)`, opacity: 0 },
      ], { duration: ms, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
    });
  }

  // cel „Każdy rodzaj”: rodzaje obrazków, z których zebrano już parę
  function doneKinds() {
    return new Set(S.tiles.filter((t) => t.loc === 'gone').map((t) => t.face));
  }

  function afterMove() {
    render();
    saveGame();
    const left = S.tiles.filter((t) => t.loc !== 'gone');
    if (left.length === 0) return win('clear');
    if (S.goal === 'kinds' && doneKinds().size >= S.kindsTotal) return win('kinds');
    // gwiazdki liczą się tylko na stosie – kafelki w schowku są pomijane
    const onStack = left.filter((t) => t.loc === 'board');
    if (S.stars && onStack.length && onStack.every((t) => t.star)) return win('stars');
    if (!autoToken && isStuck()) setTimeout(showStuck, 450);
  }

  function findPair() {
    const cand = S.tiles.filter((t) => t.loc === 'tray' || isFree(t));
    const byFace = new Map();
    // najpierw kafelki z planszy, potem ze schowka
    cand.sort((a, b) => (a.loc === 'board' ? 0 : 1) - (b.loc === 'board' ? 0 : 1));
    for (const t of cand) {
      const prev = byFace.get(t.face);
      if (prev) return [prev, t];
      byFace.set(t.face, t);
    }
    return null;
  }

  function isStuck() {
    if (findPair()) return false;
    const freeOnBoard = S.tiles.some(isFree);
    return !(freeOnBoard && S.tray.includes(null));
  }

  // ---------- pomoce ----------
  function useHint() {
    if (!S || S.over || mixToken || flipLock || autoToken) return;
    if (S.helps.hint <= 0) return toast('Lupa już wykorzystana');
    const pair = findPair();
    if (!pair) {
      if (S.tray.includes(null) && S.tiles.some(isFree)) {
        return toast('Brak gotowej pary – odłóż kafelek do schowka lub zmiksuj');
      }
      return toast('Brak dostępnych par – spróbuj miksowania');
    }
    S.helps.hint--;
    S.hint = pair.map((t) => t.id);
    render();
    clearTimeout(hintTimer);
    hintTimer = setTimeout(clearHint, 3500);
  }

  function clearHint() {
    if (S && S.hint.length) {
      S.hint = [];
      clearTimeout(hintTimer);
      render();
    }
  }

  function useUndo() {
    if (!S || mixToken || flipLock || autoToken) return;
    if (S.helps.undo <= 0) return toast('Cofanie już wykorzystane');
    const h = S.history.pop();
    if (!h) return toast('Nie ma czego cofnąć');
    S.helps.undo--;
    h.tiles.forEach(([loc, slot, star, face, faceDown, flips], i) => {
      Object.assign(S.tiles[i], { loc, slot, star, face });
      if (typeof faceDown === 'boolean') Object.assign(S.tiles[i], { faceDown, flips });
    });
    S.tray = h.tray;
    if (typeof h.starLen === 'number') S.starPath.length = Math.min(S.starPath.length, h.starLen);
    clearStarShow();
    S.selected = null;
    S.hint = [];
    S.newStars = [];
    S.over = false;
    hideModals();
    render();
    saveGame();
  }

  function useShuffle() {
    if (!S || mixToken || flipLock || autoToken) return;
    if (S.helps.shuffle <= 0) return toast('Miksowanie już wykorzystane');
    const board = S.tiles.filter((t) => t.loc === 'board');
    if (board.length < 2) return toast('Za mało kafelków do miksowania');
    S.helps.shuffle--;
    S.selected = null;
    S.hint = [];
    S.newStars = [];
    S.over = false;
    hideModals();
    render();

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !geo) {
      mixFaces(board);
      afterMove();
      return;
    }

    // 1) kafelki zjeżdżają wirując do środka stosu, 2) tam się mieszają,
    // 3) rozlatują się z powrotem na swoje miejsca – już z nowymi obrazkami
    const token = ++mixToken;
    const W = parseFloat(boardEl.style.width) || 0;
    const H = parseFloat(boardEl.style.height) || 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const moves = board.map((t) => {
      const c = tileCenter(t);
      const ang = rnd(0, Math.PI * 2);
      const r = rnd(0, Math.min(W, H) * 0.12);
      const gx = W / 2 + Math.cos(ang) * r - c.x;
      const gy = H / 2 + Math.sin(ang) * r - c.y;
      const spin = rnd(180, 540) * (Math.random() < 0.5 ? -1 : 1);
      // punkt pośredni – kafelek zatacza łuk zamiast lecieć po prostej
      const side = rnd(0.25, 0.5) * (Math.random() < 0.5 ? -1 : 1);
      const mid = `translate(${(gx * 0.5 - gy * side).toFixed(1)}px,${(gy * 0.5 + gx * side).toFixed(1)}px) rotate(${(spin * 0.45).toFixed(0)}deg) scale(.85)`;
      const gathered = `translate(${gx.toFixed(1)}px,${gy.toFixed(1)}px) rotate(${spin.toFixed(0)}deg) scale(.55)`;
      const wobble = `translate(${(gx + rnd(-1, 1) * geo.tw * 0.6).toFixed(1)}px,${(gy + rnd(-1, 1) * geo.tw * 0.6).toFixed(1)}px) rotate(${(spin + rnd(-120, 120)).toFixed(0)}deg) scale(.6)`;
      return { el: tileEls[t.id], mid, gathered, wobble, delay: rnd(0, 140) };
    });
    boardEl.classList.add('mixing');

    const IN = 520;
    const SWIRL = 380;
    const OUT = 620;
    moves.forEach((m) => {
      m.anim = m.el.animate(
        [{ transform: 'none' }, { transform: m.mid, offset: 0.55 }, { transform: m.gathered }],
        { duration: IN, delay: m.delay, easing: 'cubic-bezier(.5,0,.75,.4)', fill: 'forwards' }
      );
    });
    setTimeout(() => {
      if (token !== mixToken) return;
      moves.forEach((m) => {
        m.anim.cancel();
        m.anim = m.el.animate(
          [{ transform: m.gathered }, { transform: m.wobble }, { transform: m.gathered }],
          { duration: SWIRL, easing: 'ease-in-out', fill: 'forwards' }
        );
      });
      // obrazki zmieniają się, gdy kafelki są zbite w kupkę
      setTimeout(() => {
        if (token !== mixToken) return;
        mixFaces(board);
        moves.forEach((m) => {
          m.anim.cancel();
          m.anim = m.el.animate(
            [{ transform: m.gathered }, { transform: m.mid, offset: 0.45 }, { transform: 'none' }],
            { duration: OUT, delay: m.delay, easing: 'cubic-bezier(.25,.6,.35,1)' }
          );
        });
        setTimeout(() => {
          if (token !== mixToken) return;
          stopMix();
          afterMove();
        }, OUT + 160);
      }, SWIRL);
    }, IN + 160);
  }

  function stopMix() {
    if (!mixToken) return;
    mixToken = 0;
    boardEl.classList.remove('mixing');
    tileEls.forEach((el) => el.getAnimations && el.getAnimations().forEach((a) => a.cancel()));
  }

  // nowy przydział obrazków dla kafelków na stosie – tak, by dało się grać dalej
  function mixFaces(board) {
    const items = board.map((t) => ({ face: t.face, star: t.star, bonus: t.bonus }));
    const groups = new Map();
    items.forEach((it) => {
      if (!groups.has(it.face)) groups.set(it.face, []);
      groups.get(it.face).push(it);
    });
    const pairItems = [];
    const singles = [];
    for (const g of groups.values()) {
      while (g.length >= 2) pairItems.push([g.pop(), g.pop()]);
      if (g.length) singles.push(g.pop());
    }
    shuffle(pairItems);

    const order = solvableOrder(board, S.tiles);
    const assign = (t, it) => { t.face = it.face; t.star = it.star; t.bonus = it.bonus; };
    if (order) {
      let i = 0;
      for (; i < pairItems.length && i < order.pairs.length; i++) {
        assign(order.pairs[i][0], pairItems[i][0]);
        assign(order.pairs[i][1], pairItems[i][1]);
      }
      const restPos = order.pairs.slice(i).flat().concat(order.rest);
      const restItems = shuffle(pairItems.slice(i).flat().concat(singles));
      restPos.forEach((t, k) => assign(t, restItems[k]));
    } else {
      const sh = shuffle(items);
      board.forEach((t, k) => assign(t, sh[k]));
    }
    S.history = []; // po miksowaniu nie cofamy wcześniejszych ruchów
    render();
  }

  // ---------- tryb zmienny ----------
  function currentVariant() {
    return { layout: S.layout.id, tileset: S.tileset.id, stars: S.stars, hidden: S.hiddenN, starsAge: S.starsAge };
  }

  // następna plansza: inny układ, inne obrazki, więcej zakrytych kafelków,
  // a co jakiś czas zmiana gry z gwiazdkami na bez gwiazdek (i odwrotnie)
  function nextVariant(level) {
    const others = (list, id) => {
      const rest = list.filter((x) => x.id !== id);
      return pick(rest.length ? rest : list).id;
    };
    const age = (S.starsAge || 0) + 1;
    const flip = age >= 2 && (age >= 4 || Math.random() < 0.35);
    return {
      layout: others(Layouts.forDevice(settings.device), S.layout.id),
      tileset: others(TileSets.list, S.tileset.id),
      stars: flip ? !S.stars : S.stars,
      hidden: variableHidden(level),
      starsAge: flip ? 0 : age,
    };
  }

  function nextLevel() {
    const level = S.level + 1;
    if (settings.mode !== 'variable') return newGame(level);
    const prevStars = S.stars;
    newGame(level, nextVariant(level));
    const hid = S.tiles.filter((t) => t.faceDown).length;
    let msg = `Poziom ${level}: ${S.layout.name} · ${S.tileset.name}` + (hid ? ` · ${hid} zakrytych` : '');
    if (S.stars !== prevStars) msg = (S.stars ? '⭐ Teraz gra z gwiazdkami! ' : 'Teraz gra bez gwiazdek. ') + msg;
    toast(msg, 4000);
  }

  function replayLevel() {
    newGame(S.level, settings.mode === 'variable' ? currentVariant() : null);
  }

  // ---------- koniec gry ----------
  function win(kind) {
    S.over = true;
    autoToken = 0;
    S.auto = [];
    S.autoLeft = S.autoWanted = S.autoDone = 0;
    S.elapsed = Date.now() - S.start;
    clearSavedGame();
    if (kind === 'stars') {
      playStarShow(() => showWinModal(kind));
      return;
    }
    showWinModal(kind);
    confetti();
  }

  function showWinModal(kind) {
    if (!S || !S.over) return;
    const title = kind === 'stars' ? '⭐ Gwiezdne zwycięstwo! ⭐'
      : kind === 'kinds' ? 'Brawo! Masz każdy rodzaj!' : 'Brawo! Plansza oczyszczona!';
    const msg = kind === 'stars' ? 'Wszystkie pozostałe kafelki mają gwiazdki.'
      : kind === 'kinds' ? `Zebrano parę każdego z ${S.kindsTotal} rodzajów obrazków.` : 'Zebrano wszystkie kafelki.';
    showModal('#endModal', {
      title,
      body: `<p>${msg}</p>${kind === 'stars' ? starLegend() : ''}<p>Poziom ${S.level} · czas ${fmtTime(S.elapsed)}</p>`
        + (settings.mode === 'variable' ? '<p>Tryb zmienny: następna plansza będzie zupełnie inna.</p>' : ''),
      buttons: [
        { label: 'Następny poziom ▶', primary: true, action: nextLevel },
        { label: 'Ustawienia', action: openMenu },
      ],
    });
  }

  function showStuck() {
    if (!S || S.over || autoToken || !isStuck()) return;
    const buttons = [];
    if (S.helps.undo > 0 && S.history.length) {
      buttons.push({ label: `↶ Cofnij (${S.helps.undo})`, primary: true, action: useUndo });
    }
    if (S.helps.shuffle > 0) {
      buttons.push({ label: `🔀 Miksuj (${S.helps.shuffle})`, primary: !buttons.length, action: useShuffle });
    }
    const canHelp = buttons.length > 0;
    if (!canHelp) S.over = true;
    buttons.push({ label: 'Zagraj ponownie', action: replayLevel });
    buttons.push({ label: 'Ustawienia', action: openMenu });
    showModal('#endModal', {
      title: 'Brak ruchów',
      body: canHelp
        ? '<p>Nie ma już par do zebrania ani miejsca w schowku. Skorzystaj z pomocy!</p>'
        : '<p>Nie ma już par do zebrania, a pomoce się skończyły.</p>',
      buttons,
    });
  }

  // ---------- animacja gwiezdnego zwycięstwa ----------
  // Każde piętro stosu ma własną gwiazdkę: inny kolor i liczbę ramion.
  const STAR_LEVELS = [
    { name: 'parter', points: 5, fill: '#ffd23f', glow: '#ffb000' },
    { name: '1. piętro', points: 6, fill: '#bfe6ff', glow: '#4fb3ff' },
    { name: '2. piętro', points: 7, fill: '#ffb3e1', glow: '#ff4fb5' },
    { name: '3. piętro', points: 8, fill: '#c9b3ff', glow: '#8a5cff' },
    { name: '4. piętro i wyżej', points: 4, fill: '#ffffff', glow: '#7ff7e8' },
  ];
  const starLevel = (z) => STAR_LEVELS[Math.min(z, STAR_LEVELS.length - 1)];
  const SVGNS = 'http://www.w3.org/2000/svg';

  function starPoints(cx, cy, r, n) {
    const pts = [];
    const inner = n === 4 ? 0.32 : 0.45;
    for (let i = 0; i < n * 2; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / n;
      const rr = i % 2 ? r * inner : r;
      pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  function miniStarSvg(z, size = 22) {
    const L = starLevel(z);
    return `<svg class="legend-star" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">`
      + `<polygon points="${starPoints(12, 12, 11, L.points)}" fill="${L.fill}" stroke="${L.glow}" stroke-width="1.2"/></svg>`;
  }

  function starLegend() {
    const counts = new Map();
    S.starPath.forEach((id) => {
      const lv = Math.min(S.tiles[id].z, STAR_LEVELS.length - 1);
      counts.set(lv, (counts.get(lv) || 0) + 1);
    });
    if (!counts.size) return '';
    const items = [...counts.keys()].sort((a, b) => a - b)
      .map((lv) => `<span class="legend-item">${miniStarSvg(lv)}${STAR_LEVELS[lv].name} × ${counts.get(lv)}</span>`);
    return `<p class="star-legend">Zebrane gwiazdki: ${items.join('')}</p>`;
  }

  function tileCenter(t) {
    return {
      x: (t.x / 2) * geo.tw + (geo.maxZ - t.z) * geo.d + geo.tw / 2,
      y: (t.y / 2) * geo.th + (geo.maxZ - t.z) * geo.d + geo.th / 2,
    };
  }

  // gładka krzywa przez punkty (Catmull-Rom → Bézier)
  function smoothPath(p) {
    if (p.length === 1) return `M${p[0].x},${p[0].y}`;
    let d = `M${p[0].x.toFixed(1)},${p[0].y.toFixed(1)}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[i + 2] || p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return d;
  }

  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  function clearStarShow() {
    stopConfetti();
    document.querySelectorAll('.star-show, .star-rain').forEach((el) => el.remove());
    document.removeEventListener('pointerdown', skipStarShow, true);
    clearTimeout(starShowTimer);
    starShowDone = null;
  }

  let starShowTimer = null;
  let starShowDone = null;
  function skipStarShow(e) {
    if (!starShowDone) return;
    e.preventDefault();
    e.stopPropagation();
    finishStarShow();
  }
  function finishStarShow() {
    const done = starShowDone;
    starShowDone = null;
    clearTimeout(starShowTimer);
    document.removeEventListener('pointerdown', skipStarShow, true);
    const show = document.querySelector('.star-show');
    if (show) show.classList.add('finished');
    if (done) done();
  }

  function playStarShow(done) {
    clearStarShow();
    if (!geo) return done();
    S.selected = null;
    render();
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const found = S.starPath.map((id) => S.tiles[id]);
    const remaining = S.tiles.filter((t) => t.loc === 'board' && t.star);
    const pts = found.map(tileCenter);
    const rBase = Math.max(9, geo.tw * 0.36);
    const r = rBase;

    const svg = svgEl('svg', {
      class: 'star-show',
      width: boardEl.style.width.replace('px', ''),
      height: boardEl.style.height.replace('px', ''),
      'aria-hidden': 'true',
    });
    const defs = svgEl('defs', {});
    defs.innerHTML = `
      <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff6c2"/><stop offset=".5" stop-color="#ffcf3f"/><stop offset="1" stop-color="#ff7ad1"/>
      </linearGradient>
      <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="${(r / 5).toFixed(1)}" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>`;
    svg.appendChild(defs);

    // długości odcinków – gwiazdka zapala się, gdy dotrze do niej ścieżka
    const segLen = [0];
    for (let i = 1; i < pts.length; i++) {
      segLen.push(segLen[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    }
    const total = segLen[segLen.length - 1] || 1;
    const drawMs = reduce ? 0 : Math.max(1400, Math.min(4200, pts.length * 320));

    if (pts.length > 1) {
      const d = smoothPath(pts);
      const glow = svgEl('path', { d, class: 'trail-glow', 'stroke-width': (r * 0.55).toFixed(1) });
      const line = svgEl('path', { d, class: 'trail', 'stroke-width': (r * 0.18).toFixed(1) });
      svg.append(glow, line);
      for (const p of [glow, line]) {
        const len = p.getTotalLength ? p.getTotalLength() : total;
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
        p.style.animationDuration = `${drawMs}ms`;
      }
    }

    const addStar = (t, p, delay, cls, scale = 1) => {
      const L = starLevel(t.z);
      const r = rBase * scale;
      const g = svgEl('g', { class: `show-star ${cls}`, style: `--delay:${delay}ms;transform-origin:${p.x}px ${p.y}px` });
      g.appendChild(svgEl('polygon', {
        points: starPoints(p.x, p.y, r, L.points), fill: L.fill, stroke: L.glow,
        'stroke-width': (r * 0.12).toFixed(1), filter: 'url(#starGlow)',
      }));
      // drobne iskierki wokół gwiazdki
      for (let k = 0; k < 3; k++) {
        const a = Math.random() * Math.PI * 2;
        const dist = r * (1.1 + Math.random() * 0.6);
        const sx = p.x + Math.cos(a) * dist;
        const sy = p.y + Math.sin(a) * dist;
        g.appendChild(svgEl('polygon', {
          class: 'spark', points: starPoints(sx, sy, r * 0.32, 4), fill: '#fff',
          style: `--sd:${Math.round(delay + 200 + Math.random() * 900)}ms;transform-origin:${sx}px ${sy}px`,
        }));
      }
      svg.appendChild(g);
    };
    found.forEach((t, i) => addStar(t, pts[i], Math.round((segLen[i] / total) * drawMs), 'found'));
    const endDelay = drawMs + 150;
    remaining.forEach((t, i) => addStar(t, tileCenter(t), endDelay + i * 40, 'final', 0.55));

    boardEl.appendChild(svg);
    if (!reduce) starRain(endDelay);

    starShowDone = done;
    document.addEventListener('pointerdown', skipStarShow, true);
    starShowTimer = setTimeout(finishStarShow, reduce ? 600 : endDelay + 1800);
  }

  // ---------- konfetti po oczyszczeniu planszy ----------
  let confettiRaf = 0;
  function stopConfetti() {
    cancelAnimationFrame(confettiRaf);
    confettiRaf = 0;
    document.querySelectorAll('.confetti').forEach((el) => el.remove());
  }

  function confetti() {
    stopConfetti();
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const cv = document.createElement('canvas');
    cv.className = 'confetti';
    cv.setAttribute('aria-hidden', 'true');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);

    const COLORS = ['#ff4f6d', '#ffc400', '#3ddc84', '#4fb3ff', '#b76bff', '#ff8a3d', '#ffffff', '#ff7ad1'];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const scale = Math.max(0.7, Math.min(1.4, Math.min(W, H) / 600));
    const parts = [];
    const add = (x, y, angle, spread, speed, n, delay) => {
      for (let i = 0; i < n; i++) {
        const a = angle + rnd(-spread, spread);
        const v = rnd(0.55, 1) * speed * scale;
        parts.push({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          w: rnd(6, 11) * scale, h: rnd(9, 16) * scale,
          rot: rnd(0, Math.PI * 2), vr: rnd(-0.25, 0.25),
          flip: rnd(0, Math.PI * 2), vf: rnd(0.08, 0.2),
          color: COLORS[i % COLORS.length], round: Math.random() < 0.25,
          delay,
        });
      }
    };
    // dwie salwy z dolnych rogów i jedna ze środka u góry, potem deszcz z góry
    add(0, H, -Math.PI / 3, 0.35, 21, 70, 0);
    add(W, H, -Math.PI * 2 / 3, 0.35, 21, 70, 0);
    add(W / 2, H * 0.35, -Math.PI / 2, Math.PI, 13, 60, 350);
    for (let i = 0; i < 70; i++) {
      add(rnd(0, W), rnd(-60, -10), Math.PI / 2, 0.3, 2, 1, 700 + rnd(0, 1600));
    }

    const t0 = performance.now();
    let last = t0;
    const DURATION = 6000;
    const frame = (now) => {
      const dt = Math.min(2.5, (now - last) / 16.7);
      last = now;
      const el = now - t0;
      ctx.clearRect(0, 0, W, H);
      const fade = el > DURATION - 1000 ? Math.max(0, (DURATION - el) / 1000) : 1;
      let alive = 0;
      for (const p of parts) {
        if (el < p.delay) { alive++; continue; }
        p.vy += 0.32 * dt * scale;
        p.vx *= Math.pow(0.985, dt);
        p.vy *= Math.pow(0.985, dt);
        // papierki opadają powoli i kołyszą się na boki
        if (p.vy > 3.2 * scale) p.vy = 3.2 * scale;
        p.x += (p.vx + Math.sin(p.flip) * 0.8) * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        if (p.y > H + 30) continue;
        alive++;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.flip));
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
      if (el < DURATION && alive) confettiRaf = requestAnimationFrame(frame);
      else stopConfetti();
    };
    confettiRaf = requestAnimationFrame(frame);
  }

  // deszcz migoczących gwiazdek na całym ekranie
  function starRain(delay) {
    const box = document.createElement('div');
    box.className = 'star-rain';
    box.setAttribute('aria-hidden', 'true');
    const n = 36;
    let html = '';
    for (let i = 0; i < n; i++) {
      const lv = STAR_LEVELS[i % STAR_LEVELS.length];
      const size = 10 + Math.random() * 18;
      html += `<span style="left:${(Math.random() * 100).toFixed(1)}%;--fall:${(2.2 + Math.random() * 2).toFixed(2)}s;`
        + `--rd:${Math.round(delay + Math.random() * 1600)}ms;width:${size.toFixed(0)}px;height:${size.toFixed(0)}px">`
        + `<svg viewBox="0 0 24 24"><polygon points="${starPoints(12, 12, 11, lv.points)}" fill="${lv.fill}" stroke="${lv.glow}" stroke-width="1"/></svg></span>`;
    }
    box.innerHTML = html;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), delay + 6000);
  }

  // ---------- rysowanie ----------
  const boardEl = $('#board');
  const boardWrap = $('#boardWrap');
  const trayEl = $('#tray');

  function starSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.1 5.9 20.6l1.5-6.8L2.2 9.2l6.9-.7z"/></svg>';
  }

  function makeTileEl(t) {
    const el = document.createElement('div');
    el.className = 'tile';
    el.innerHTML = `<div class="face">${S.tileset.render(t.face)}</div><div class="back"></div><div class="star">${starSvg()}</div><div class="bonus">×3</div>`;
    el.dataset.face = String(t.face);
    return el;
  }

  // odśwież obrazek kafelka, jeśli zmienił się jego wzór (np. po miksowaniu lub cofnięciu)
  function syncFace(el, t) {
    if (el.dataset.face === String(t.face)) return;
    el.querySelector('.face').innerHTML = S.tileset.render(t.face);
    el.dataset.face = String(t.face);
  }

  function buildBoard() {
    boardEl.innerHTML = '';
    boardEl.dataset.set = S.tileset.id;
    tileEls = S.tiles.map((t) => {
      const el = makeTileEl(t);
      el.addEventListener('click', () => clickTile(t));
      el.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (t.loc === 'board' && isFree(t) && S.tray.includes(null)) moveToTray(t);
      });
      boardEl.appendChild(el);
      return el;
    });
    layoutBoard();
  }

  function layoutBoard() {
    if (!S) return;
    const maxX = Math.max(...S.tiles.map((t) => t.x)) + 2;
    const maxY = Math.max(...S.tiles.map((t) => t.y)) + 2;
    const maxZ = Math.max(...S.tiles.map((t) => t.z));
    const cols = maxX / 2;
    const rows = maxY / 2;
    const ratio = 1.3;
    const depthK = 0.11;
    const availW = boardWrap.clientWidth - 16;
    const availH = boardWrap.clientHeight - 16;
    const tw = Math.max(18, Math.min(
      availW / (cols + (maxZ + 1) * depthK),
      availH / (rows * ratio + (maxZ + 1) * depthK),
      90
    ));
    const th = tw * ratio;
    const d = tw * depthK;
    geo = { tw, th, d, maxZ };
    const w = cols * tw + (maxZ + 1) * d;
    const h = rows * th + (maxZ + 1) * d;
    boardEl.style.width = `${w}px`;
    boardEl.style.height = `${h}px`;
    boardEl.style.setProperty('--tw', `${tw}px`);
    boardEl.style.setProperty('--th', `${th}px`);
    boardEl.style.setProperty('--d', `${d}px`);
    S.tiles.forEach((t, i) => {
      const el = tileEls[i];
      el.style.left = `${(t.x / 2) * tw + (maxZ - t.z) * d}px`;
      el.style.top = `${(t.y / 2) * th + (maxZ - t.z) * d}px`;
      el.style.zIndex = String(t.z * 10000 + t.y * 100 + t.x + 10);
      el.style.setProperty('--shade', String(Math.min(0.2, (maxZ - t.z) * 0.045)));
    });
  }

  function render() {
    if (!S) return;
    const sel = S.selected !== null ? S.tiles[S.selected] : null;
    const auto = S.auto || [];
    S.tiles.forEach((t, i) => {
      const el = tileEls[i];
      const free = isFree(t);
      const c = el.classList;
      syncFace(el, t);
      c.toggle('gone', t.loc !== 'board');
      c.toggle('blocked', settings.dim && t.loc === 'board' && !free);
      c.toggle('hidden', t.loc === 'board' && !isRevealed(t));
      c.toggle('selected', S.selected === t.id);
      c.toggle('hint', S.hint.includes(t.id));
      c.toggle('starred', t.star);
      c.toggle('newstar', S.newStars.includes(t.id));
      c.toggle('bonused', !!t.bonus);
      c.toggle('autopick', auto.includes(t.id));
      if (!auto.includes(t.id) && el.style.zIndex === '150000') el.style.zIndex = String(t.z * 10000 + t.y * 100 + t.x + 10);
      c.toggle('glow', !!(S.diff.glow && sel && free && isRevealed(t) && t.id !== sel.id && t.face === sel.face));
    });
    renderTray(sel);
    renderHud();
  }

  function renderTray(sel) {
    trayEl.innerHTML = '';
    trayEl.dataset.set = S.tileset.id;
    const canDrop = sel && sel.loc === 'board';
    S.tray.forEach((id, i) => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      if (id === null) {
        slot.classList.toggle('ready', !!canDrop);
        slot.innerHTML = '<span class="slot-label">' + (canDrop ? 'Odłóż tutaj' : `Miejsce ${i + 1}`) + '</span>';
        slot.addEventListener('click', () => clickSlot(i));
      } else {
        const t = S.tiles[id];
        const el = makeTileEl(t);
        el.classList.add('intray');
        el.classList.toggle('selected', S.selected === id);
        el.classList.toggle('hint', S.hint.includes(id));
        el.classList.toggle('starred', t.star);
        el.classList.toggle('bonused', !!t.bonus);
        el.classList.toggle('autopick', (S.auto || []).includes(id));
        el.classList.toggle('glow', !!(S.diff.glow && sel && id !== sel.id && t.face === sel.face));
        el.addEventListener('click', () => clickTile(t));
        slot.appendChild(el);
      }
      trayEl.appendChild(slot);
    });
  }

  function renderHud() {
    const left = S.tiles.filter((t) => t.loc !== 'gone').length;
    $('#statLevel').textContent = S.level;
    $('#statLeft').textContent = left;
    $('#statDiff').textContent = S.diffKey;
    const kindStat = $('#statKindsBox');
    kindStat.hidden = S.goal !== 'kinds';
    if (S.goal === 'kinds') $('#statKinds').textContent = `${doneKinds().size}/${S.kindsTotal}`;
    const starStat = $('#statStarsBox');
    starStat.hidden = !S.stars;
    if (S.stars) {
      const stack = S.tiles.filter((t) => t.loc === 'board');
      $('#statStars').textContent = `${stack.filter((t) => t.star).length}/${stack.length}`;
    }
    for (const k of ['hint', 'undo', 'shuffle']) {
      $(`#cnt-${k}`).textContent = S.helps[k];
      $(`#btn-${k}`).disabled = S.helps[k] <= 0;
    }
  }

  function nudge(t) {
    const el = tileEls[t.id];
    el.classList.remove('nudge');
    void el.offsetWidth;
    el.classList.add('nudge');
  }

  function fmtTime(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  setInterval(() => {
    if (S && !S.over) $('#statTime').textContent = fmtTime(Date.now() - S.start);
  }, 500);

  let toastTimer = null;
  function toast(msg, ms = 2400) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }

  // ---------- okna ----------
  function hideModals() {
    document.querySelectorAll('.modal').forEach((m) => (m.hidden = true));
  }

  function showModal(sel, { title, body, buttons }) {
    hideModals();
    const m = $(sel);
    m.querySelector('.modal-title').textContent = title;
    m.querySelector('.modal-body').innerHTML = body;
    const bar = m.querySelector('.modal-buttons');
    bar.innerHTML = '';
    buttons.forEach((b) => {
      const btn = document.createElement('button');
      btn.className = 'btn' + (b.primary ? ' primary' : '');
      btn.textContent = b.label;
      btn.addEventListener('click', b.action);
      bar.appendChild(btn);
    });
    m.hidden = false;
  }

  function layoutOpt(l) {
    return { v: l.id, label: l.name, sub: `${l.count} kafelków · ${l.cols}×${l.rows}` };
  }

  function moreButton(shown, toggle, moreLabel, sub) {
    return {
      action: () => { toggle(); buildMenu(); },
      label: shown ? 'Mniej ▴' : `${moreLabel} ▾`,
      sub: shown ? 'tylko ulubione' : sub,
    };
  }

  function layoutOptions() {
    const phone = settings.device === 'phone';
    const pool = Layouts.forDevice(settings.device);
    const fav = favorites(pool, settings.layoutUse || {}, DEFAULT_LAYOUTS[settings.device], FAV_LAYOUTS, settings.layout);
    const opts = fav.map(layoutOpt);
    opts.push({ v: 'random', label: 'Losowy', sub: phone ? 'z układów na telefon' : 'za każdym razem inny' });
    const rest = pool.filter((l) => !fav.includes(l));
    const big = phone ? Layouts.list.filter((l) => !l.phone) : [];
    if (showAllLayouts) {
      if (rest.length) {
        opts.push({ sep: 'Pozostałe układy' });
        opts.push(...rest.map(layoutOpt));
      }
      if (big.length) {
        opts.push({ sep: 'Większe układy (domyślnie na komputer)' });
        opts.push(...big.map(layoutOpt));
      }
    }
    const more = rest.length + big.length;
    if (more) {
      opts.push(moreButton(showAllLayouts, () => (showAllLayouts = !showAllLayouts), 'Więcej układów', `+${more}`));
    }
    return opts;
  }

  function tilesetOpt(s) {
    return {
      v: s.id, label: s.name,
      html: `<span class="mini-tiles" data-set="${s.id}">${s.preview.map((i) => `<span class="mini">${s.render(i)}</span>`).join('')}</span>`,
    };
  }

  function tilesetOptions() {
    const all = TileSets.list;
    const fav = favorites(all, settings.tilesetUse || {}, DEFAULT_TILESETS, FAV_TILESETS, settings.tileset);
    const opts = fav.map(tilesetOpt);
    const rest = all.filter((s) => !fav.includes(s));
    if (showAllTilesets && rest.length) {
      opts.push({ sep: 'Pozostałe obrazki' });
      opts.push(...rest.map(tilesetOpt));
    }
    if (rest.length) {
      opts.push(moreButton(showAllTilesets, () => (showAllTilesets = !showAllTilesets), 'Więcej obrazków', `+${rest.length}`));
    }
    return opts;
  }

  function buildMenu() {
    const [pw, ph] = Layouts.PHONE_MAX;
    const groups = {
      device: [
        { v: 'phone', label: '📱 Telefon', sub: `układy do ${pw}×${ph} kafelków` },
        { v: 'desktop', label: '🖥️ Komputer', sub: 'wszystkie układy' },
      ],
      layout: layoutOptions(),
      tileset: tilesetOptions(),
      hidden: [
        { v: 'none', label: 'Brak' },
        { v: 'few', label: 'Kilka', sub: `${HIDDEN_COUNT.few} kafelków` },
        { v: 'many', label: 'Kilkanaście', sub: `${HIDDEN_COUNT.many} kafelków` },
      ],
      stars: [
        { v: false, label: 'Wyłączone' },
        { v: true, label: 'Włączone', sub: `start: ${INITIAL_STARS} gwiazdki` },
      ],
      dim: [
        { v: false, label: 'Wyłączone' },
        { v: true, label: 'Włączone' },
      ],
      bonus: [
        { v: false, label: 'Wyłączone' },
        { v: true, label: 'Włączone', sub: `ok. 1 na ${BONUS_EVERY} kafelków` },
      ],
      goal: [
        { v: 'all', label: 'Wszystkie kafelki', sub: 'oczyść całą planszę' },
        { v: 'kinds', label: 'Każdy rodzaj', sub: 'wystarczy po 1 parze każdego obrazka' },
      ],
      mode: [
        { v: 'fixed', label: 'Stały', sub: 'wszystkie poziomy według twoich ustawień' },
        { v: 'variable', label: 'Zmienny', sub: 'losuję nowe ustawienia na kolejnych poziomach' },
      ],
      difficulty: [1, 2, 3, 4, 5].map((n) => ({ v: n, label: String(n), sub: DIFFICULTY[n].label })),
    };
    for (const [key, opts] of Object.entries(groups)) {
      const box = document.querySelector(`[data-setting="${key}"]`);
      box.innerHTML = '';
      opts.forEach((o) => {
        if (o.sep) {
          const h = document.createElement('div');
          h.className = 'opts-sep';
          h.textContent = o.sep;
          box.appendChild(h);
          return;
        }
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt' + (o.action ? ' opt-more' : '');
        b.innerHTML = (o.html || '') + `<span class="opt-label">${o.label}</span>` + (o.sub ? `<span class="opt-sub">${o.sub}</span>` : '');
        if (o.action) {
          b.addEventListener('click', o.action);
          box.appendChild(b);
          return;
        }
        b.setAttribute('aria-pressed', String(settings[key] === o.v));
        b.addEventListener('click', () => {
          settings[key] = o.v;
          if (key === 'device') {
            // przy zmianie urządzenia wybierz pasujący układ, jeśli obecny jest za duży
            const cur = Layouts.list.find((l) => l.id === settings.layout);
            if (o.v === 'phone' && cur && !cur.phone) settings.layout = DEVICE_LAYOUT.phone;
          }
          saveSettings();
          if (key === 'device') return buildMenu();
          box.querySelectorAll('.opt').forEach((x) => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
        });
        box.appendChild(b);
      });
    }
  }

  function openMenu() {
    showAllLayouts = false;
    showAllTilesets = false;
    buildMenu();
    hideModals();
    $('#menuModal').hidden = false;
    $('#menuClose').hidden = !S || S.over;
  }

  // ---------- zdarzenia ----------
  $('#btn-hint').addEventListener('click', useHint);
  $('#btn-undo').addEventListener('click', useUndo);
  $('#btn-shuffle').addEventListener('click', useShuffle);
  $('#btn-menu').addEventListener('click', openMenu);
  $('#btn-help').addEventListener('click', () => {
    hideModals();
    $('#helpModal').hidden = false;
  });
  $('#helpClose').addEventListener('click', () => (S ? hideModals() : openMenu()));
  $('#menuStart').addEventListener('click', () => newGame(1));
  $('#menuClose').addEventListener('click', hideModals);
  boardWrap.addEventListener('click', (e) => {
    if (e.target === boardWrap || e.target === boardEl) {
      if (S && S.selected !== null) {
        S.selected = null;
        render();
      }
    }
  });
  window.addEventListener('resize', layoutBoard);
  // rozmiar planszy zależy od wysokości schowka i paska – przeliczaj przy każdej zmianie
  if (window.ResizeObserver) new ResizeObserver(() => layoutBoard()).observe(boardWrap);
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key === 'h' || e.key === 'l') useHint();
    else if (e.key === 'u' || (e.key === 'z' && (e.ctrlKey || e.metaKey))) useUndo();
    else if (e.key === 'm') useShuffle();
    else if (e.key === 'Escape' && S && !S.over) hideModals();
  });

  // uchwyt do testów automatycznych
  window.__mahjong = { get state() { return S; }, settings, newGame, clickTile, clickSlot, findPair, isFree };

  // zapisz czas gry, gdy aplikacja schodzi do tła
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && S && !S.over) saveGame();
  });
  window.addEventListener('pagehide', () => { if (S && !S.over) saveGame(); });

  if (!restoreGame()) openMenu();
})();

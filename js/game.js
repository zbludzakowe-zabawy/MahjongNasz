(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const SLOTS = 4;
  const HELPS_PER_LEVEL = 2;
  const INITIAL_STARS = 4;
  const HIDDEN_COUNT = { none: 0, few: 6, many: 14 };

  // Poziom trudności (1-5) działa niezależnie od pozostałych opcji:
  //  ratio    – ile par przypada na jeden rodzaj obrazka (więcej = łatwiej)
  //  dim      – przyciemnianie zablokowanych kafelków
  //  glow     – podświetlanie pasujących kafelków po zaznaczeniu
  //  solvable – gwarancja, że rozdanie da się rozwiązać
  // Przy ratio 1 każdy obrazek występuje (w miarę możliwości) tylko w jednej parze.
  const DIFFICULTY = {
    1: { ratio: 4, dim: true, glow: true, solvable: true, label: 'Bardzo łatwy' },
    2: { ratio: 3, dim: true, glow: false, solvable: true, label: 'Łatwy' },
    3: { ratio: 2, dim: false, glow: false, solvable: true, label: 'Średni' },
    4: { ratio: 1.5, dim: false, glow: false, solvable: true, label: 'Trudny' },
    5: { ratio: 1, dim: false, glow: false, solvable: true, label: 'Ekspert' },
  };

  const DEFAULTS = { layout: 'turtle', tileset: 'classic', hidden: 'none', stars: false, difficulty: 3 };
  const settings = loadSettings();

  let S = null; // stan bieżącej gry
  let tileEls = [];
  let hintTimer = null;

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
      return { ...DEFAULTS, ...s };
    } catch (e) {
      return { ...DEFAULTS };
    }
  }
  function saveSettings() {
    try {
      localStorage.setItem('mahjongnasz-settings', JSON.stringify(settings));
    } catch (e) { /* brak dostępu do pamięci – trudno */ }
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
  const isCovered = (t) => t.above.some(onBoard);
  const isFree = (t) => t.loc === 'board' && freeWith(t, onBoard);
  const isRevealed = (t) => !t.faceDown || !isCovered(t);

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
  function newGame(level) {
    const layout = Layouts.get(settings.layout);
    const tileset = TileSets.get(settings.tileset);
    const diff = DIFFICULTY[settings.difficulty] || DIFFICULTY[3];

    let pos = layout.build();
    // na ekranie pionowym obracamy szeroki układ, by kafelki były większe
    const spanX = Math.max(...pos.map((p) => p.x)) - Math.min(...pos.map((p) => p.x)) + 2;
    const spanY = (Math.max(...pos.map((p) => p.y)) - Math.min(...pos.map((p) => p.y)) + 2) * 1.3;
    const portrait = boardWrap.clientHeight > boardWrap.clientWidth * 1.15;
    if (portrait && spanX > spanY * 1.1) pos = pos.map((p) => ({ x: p.y, y: p.x, z: p.z }));
    const minX = Math.min(...pos.map((p) => p.x));
    const minY = Math.min(...pos.map((p) => p.y));
    const tiles = pos.map((p, i) => ({
      id: i, x: p.x - minX, y: p.y - minY, z: p.z,
      face: -1, star: false, faceDown: false, loc: 'board', slot: -1,
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
    const hiddenN = HIDDEN_COUNT[settings.hidden] || 0;
    if (hiddenN) {
      shuffle(tiles.filter((t) => t.above.length > 0))
        .slice(0, hiddenN)
        .forEach((t) => (t.faceDown = true));
    }

    // gwiazdki
    if (settings.stars) {
      shuffle(tiles.filter((t) => !t.faceDown)).slice(0, INITIAL_STARS).forEach((t) => (t.star = true));
    }

    S = {
      tiles, tileset, diff, layout,
      solution: order ? order.pairs.map(([a, b]) => [a.id, b.id]) : null,
      tray: Array(SLOTS).fill(null),
      selected: null,
      helps: { hint: HELPS_PER_LEVEL, undo: HELPS_PER_LEVEL, shuffle: HELPS_PER_LEVEL },
      history: [],
      hint: [],
      newStars: [],
      level,
      start: Date.now(),
      elapsed: 0,
      over: false,
    };
    hideModals();
    buildBoard();
    render();
  }

  // ---------- ruchy ----------
  function snapshot() {
    S.history.push({
      tiles: S.tiles.map((t) => [t.loc, t.slot, t.star, t.face]),
      tray: S.tray.slice(),
    });
    if (S.history.length > 300) S.history.shift();
  }

  function clickTile(t) {
    if (!S || S.over) return;
    if (t.loc === 'board' && !isFree(t)) {
      nudge(t);
      return;
    }
    clearHint();
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

  function clickSlot(i) {
    if (!S || S.over || S.tray[i] !== null || S.selected === null) return;
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
    afterMove();
  }

  function removePair(a, b) {
    clearHint();
    snapshot();
    for (const t of [a, b]) {
      if (t.loc === 'tray') S.tray[t.slot] = null;
      t.loc = 'gone';
      t.slot = -1;
    }
    S.selected = null;
    S.newStars = [];

    const starsTaken = (a.star ? 1 : 0) + (b.star ? 1 : 0);
    if (settings.stars && starsTaken > 0) {
      const want = starsTaken * 2; // 1 gwiazdka -> 2 nowe, 2 gwiazdki -> 4 nowe
      const cand = S.tiles.filter((t) => t.loc === 'board' && !t.star);
      const visible = shuffle(cand.filter(isRevealed));
      const hidden = shuffle(cand.filter((t) => !isRevealed(t)));
      const chosen = visible.concat(hidden).slice(0, want);
      chosen.forEach((t) => (t.star = true));
      S.newStars = chosen.map((t) => t.id);
      if (chosen.length) toast(`+${chosen.length} ⭐ na stosie`);
    }
    afterMove();
  }

  function afterMove() {
    render();
    const left = S.tiles.filter((t) => t.loc !== 'gone');
    if (left.length === 0) return win('clear');
    if (settings.stars && left.every((t) => t.star)) return win('stars');
    if (isStuck()) setTimeout(showStuck, 450);
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
    if (!S || S.over) return;
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
    if (!S) return;
    if (S.helps.undo <= 0) return toast('Cofanie już wykorzystane');
    const h = S.history.pop();
    if (!h) return toast('Nie ma czego cofnąć');
    S.helps.undo--;
    h.tiles.forEach(([loc, slot, star, face], i) => {
      Object.assign(S.tiles[i], { loc, slot, star, face });
    });
    S.tray = h.tray;
    S.selected = null;
    S.hint = [];
    S.newStars = [];
    S.over = false;
    hideModals();
    render();
  }

  function useShuffle() {
    if (!S) return;
    if (S.helps.shuffle <= 0) return toast('Miksowanie już wykorzystane');
    const board = S.tiles.filter((t) => t.loc === 'board');
    if (board.length < 2) return toast('Za mało kafelków do miksowania');
    S.helps.shuffle--;

    const items = board.map((t) => ({ face: t.face, star: t.star }));
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
    const assign = (t, it) => { t.face = it.face; t.star = it.star; };
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
    S.selected = null;
    S.hint = [];
    S.newStars = [];
    S.over = false;
    hideModals();
    boardEl.classList.remove('mixing');
    void boardEl.offsetWidth;
    boardEl.classList.add('mixing');
    afterMove();
  }

  // ---------- koniec gry ----------
  function win(kind) {
    S.over = true;
    S.elapsed = Date.now() - S.start;
    const title = kind === 'stars' ? '⭐ Gwiezdne zwycięstwo! ⭐' : 'Brawo! Plansza oczyszczona!';
    const msg = kind === 'stars'
      ? 'Wszystkie pozostałe kafelki mają gwiazdki.'
      : 'Zebrano wszystkie kafelki.';
    showModal('#endModal', {
      title,
      body: `<p>${msg}</p><p>Poziom ${S.level} · czas ${fmtTime(S.elapsed)}</p>`,
      buttons: [
        { label: 'Następny poziom ▶', primary: true, action: () => newGame(S.level + 1) },
        { label: 'Ustawienia', action: openMenu },
      ],
    });
  }

  function showStuck() {
    if (!S || S.over || !isStuck()) return;
    const buttons = [];
    if (S.helps.undo > 0 && S.history.length) {
      buttons.push({ label: `↶ Cofnij (${S.helps.undo})`, primary: true, action: useUndo });
    }
    if (S.helps.shuffle > 0) {
      buttons.push({ label: `🔀 Miksuj (${S.helps.shuffle})`, primary: !buttons.length, action: useShuffle });
    }
    const canHelp = buttons.length > 0;
    if (!canHelp) S.over = true;
    buttons.push({ label: 'Zagraj ponownie', action: () => newGame(S.level) });
    buttons.push({ label: 'Ustawienia', action: openMenu });
    showModal('#endModal', {
      title: 'Brak ruchów',
      body: canHelp
        ? '<p>Nie ma już par do zebrania ani miejsca w schowku. Skorzystaj z pomocy!</p>'
        : '<p>Nie ma już par do zebrania, a pomoce się skończyły.</p>',
      buttons,
    });
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
    el.innerHTML = `<div class="face">${S.tileset.render(t.face)}</div><div class="back"></div><div class="star">${starSvg()}</div>`;
    return el;
  }

  function buildBoard() {
    boardEl.innerHTML = '';
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
    });
  }

  function render() {
    if (!S) return;
    const sel = S.selected !== null ? S.tiles[S.selected] : null;
    S.tiles.forEach((t, i) => {
      const el = tileEls[i];
      const free = isFree(t);
      const c = el.classList;
      c.toggle('gone', t.loc !== 'board');
      c.toggle('blocked', S.diff.dim && t.loc === 'board' && !free);
      c.toggle('hidden', t.loc === 'board' && !isRevealed(t));
      c.toggle('selected', S.selected === t.id);
      c.toggle('hint', S.hint.includes(t.id));
      c.toggle('starred', t.star);
      c.toggle('newstar', S.newStars.includes(t.id));
      c.toggle('glow', !!(S.diff.glow && sel && free && t.id !== sel.id && t.face === sel.face));
    });
    renderTray(sel);
    renderHud();
  }

  function renderTray(sel) {
    trayEl.innerHTML = '';
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
    $('#statDiff').textContent = settings.difficulty;
    const starStat = $('#statStarsBox');
    starStat.hidden = !settings.stars;
    if (settings.stars) {
      const st = S.tiles.filter((t) => t.loc !== 'gone' && t.star).length;
      $('#statStars').textContent = `${st}/${left}`;
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
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
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

  function buildMenu() {
    const groups = {
      layout: [...Layouts.list.map((l) => ({ v: l.id, label: l.name, sub: `${l.build().length} kafelków` })),
        { v: 'random', label: 'Losowy', sub: 'za każdym razem inny' }],
      tileset: TileSets.list.map((s) => ({
        v: s.id, label: s.name,
        html: `<span class="mini-tiles">${s.preview.map((i) => `<span class="mini">${s.render(i)}</span>`).join('')}</span>`,
      })),
      hidden: [
        { v: 'none', label: 'Brak' },
        { v: 'few', label: 'Kilka', sub: `${HIDDEN_COUNT.few} kafelków` },
        { v: 'many', label: 'Kilkanaście', sub: `${HIDDEN_COUNT.many} kafelków` },
      ],
      stars: [
        { v: false, label: 'Wyłączone' },
        { v: true, label: 'Włączone', sub: `start: ${INITIAL_STARS} gwiazdki` },
      ],
      difficulty: [1, 2, 3, 4, 5].map((n) => ({ v: n, label: String(n), sub: DIFFICULTY[n].label })),
    };
    for (const [key, opts] of Object.entries(groups)) {
      const box = document.querySelector(`[data-setting="${key}"]`);
      box.innerHTML = '';
      opts.forEach((o) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'opt';
        b.innerHTML = (o.html || '') + `<span class="opt-label">${o.label}</span>` + (o.sub ? `<span class="opt-sub">${o.sub}</span>` : '');
        b.setAttribute('aria-pressed', String(settings[key] === o.v));
        b.addEventListener('click', () => {
          settings[key] = o.v;
          saveSettings();
          box.querySelectorAll('.opt').forEach((x) => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
        });
        box.appendChild(b);
      });
    }
  }

  function openMenu() {
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
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key === 'h' || e.key === 'l') useHint();
    else if (e.key === 'u' || (e.key === 'z' && (e.ctrlKey || e.metaKey))) useUndo();
    else if (e.key === 'm') useShuffle();
    else if (e.key === 'Escape' && S && !S.over) hideModals();
  });

  // uchwyt do testów automatycznych
  window.__mahjong = { get state() { return S; }, settings, newGame, clickTile, clickSlot, findPair, isFree };

  openMenu();
})();

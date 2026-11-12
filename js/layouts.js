// Układy stosów kafelków.
// Współrzędne podawane są w jednostkach kafelka (dopuszczalne połówki),
// wewnętrznie przechowywane w półjednostkach (x*2, y*2), z = warstwa.
const Layouts = (() => {
  function R(L, z, x, y, w, h) {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        L.push({ x: Math.round((x + i) * 2), y: Math.round((y + j) * 2), z });
      }
    }
    return L;
  }
  const T = (L, z, x, y) => R(L, z, x, y, 1, 1);

  // Stos z rysunku podstawy ('#' – kafelek, 'o' – dziura, '.' – puste).
  // Każde piętro wyżej leży przesunięte o pół kafelka: kafelek kładziemy tam,
  // gdzie pod spodem są cztery pola (dziura też się liczy – kafelek nad nią
  // opiera się na trzech). Tak przykryte są końce rzędów niżej, więc naraz
  // wolnych jest niewiele kafelków.
  function pile(art, levels = 9) {
    const L = [];
    const holes = new Set();
    let cur = [];
    art.forEach((row, y) => [...row].forEach((c, x) => {
      if (c === '#' || c === 'o') cur.push([2 * x, 2 * y]);
      if (c === 'o') holes.add(`${2 * x},${2 * y}`);
    }));
    for (let z = 0; z < levels && cur.length; z++) {
      cur.forEach(([x, y]) => { if (z > 0 || !holes.has(`${x},${y}`)) L.push({ x, y, z }); });
      const has = new Set(cur.map(([x, y]) => `${x},${y}`));
      cur = cur
        .filter(([x, y]) => has.has(`${x + 2},${y}`) && has.has(`${x},${y + 2}`) && has.has(`${x + 2},${y + 2}`))
        .map(([x, y]) => [x + 1, y + 1]);
    }
    return L;
  }

  const list = [
    {
      id: 'turtle',
      name: 'Żółw',
      build() {
        // skorupa z pięter przesuniętych o pół kafelka, z głową i ogonem
        const L = pile([
          '.##########.',
          '..########..',
          '############',
          '############',
          '..########..',
          '.##########.',
        ]);
        T(L, 0, -1, 2.5);
        T(L, 0, 12, 2.5);
        T(L, 0, 13, 2.5);
        return L;
      },
    },
    {
      id: 'pyramid',
      name: 'Piramida',
      build() {
        // pięć pięter, każde przesunięte o pół kafelka; na szczycie jeden rząd
        return pile([
          '##########',
          '##########',
          '##########',
          '##########',
          '##########',
        ]);
      },
    },
    {
      id: 'fortress',
      name: 'Forteca',
      build() {
        const L = [];
        R(L, 0, 0, 0, 10, 6);
        R(L, 1, 0, 0, 2, 2);
        R(L, 1, 8, 0, 2, 2);
        R(L, 1, 0, 4, 2, 2);
        R(L, 1, 8, 4, 2, 2);
        R(L, 1, 4, 2, 2, 2);
        T(L, 2, 0.5, 0.5);
        T(L, 2, 8.5, 0.5);
        T(L, 2, 0.5, 4.5);
        T(L, 2, 8.5, 4.5);
        return L; // 84
      },
    },
    {
      id: 'cross',
      name: 'Krzyż',
      build() {
        return pile([
          '....###....',
          '....###....',
          '....###....',
          '###########',
          '###########',
          '###########',
          '....###....',
          '....###....',
          '....###....',
        ]);
      },
    },
    {
      id: 'stairs',
      name: 'Schody',
      build() {
        // każdy stopień przesunięty o pół kafelka w bok i w dół – przykrywa
        // końce rzędów stopnia niżej
        const L = [];
        for (let k = 0; k < 4; k++) R(L, k, 2.5 * k, 0.5 * k, 10 - 2 * k, 4 - k);
        return L;
      },
    },
    {
      id: 'flower',
      name: 'Kwiat',
      build() {
        // cztery płatki wokół dziury w środku
        return pile([
          '..####..',
          '..####..',
          '########',
          '###..###',
          '###..###',
          '########',
          '..####..',
          '..####..',
        ]);
      },
    },
    {
      id: 'small',
      name: 'Mały kwadrat',
      build() {
        // każde piętro przesunięte o pół kafelka i węższe – wolne są tylko
        // brzegi najwyższego; w środku studnia (dziura przez dwa piętra)
        const L = [];
        R(L, 0, 0, 0, 6, 2);
        R(L, 0, 0, 4, 6, 2);
        R(L, 0, 0, 2, 2, 2);
        R(L, 0, 4, 2, 2, 2);
        R(L, 1, 0.5, 0.5, 5, 2);
        R(L, 1, 0.5, 3.5, 5, 2);
        R(L, 1, 0.5, 2.5, 2, 1);
        R(L, 1, 3.5, 2.5, 2, 1);
        R(L, 2, 1, 1, 4, 1);
        R(L, 2, 1, 4, 4, 1);
        R(L, 2, 1, 2, 1, 2);
        R(L, 2, 4, 2, 1, 2);
        return L; // 68
      },
    },
    {
      id: 'house',
      name: 'Domek',
      build() {
        // dach z kominem, w ścianie drzwi (dziury)
        return pile([
          '..##.#',
          '.#####',
          '######',
          '######',
          '##oo##',
        ]);
      },
    },
    {
      id: 'snake',
      name: 'Wąż',
      build() {
        // wijący się wąż
        return pile([
          '####...',
          '#####..',
          '..###..',
          '..####.',
          '...###.',
          '..####.',
          '.####..',
        ]);
      },
    },
    {
      id: 'diamond',
      name: 'Diament',
      build() {
        // romb, każde piętro przesunięte o pół
        return pile([
          '..##..',
          '.####.',
          '######',
          '######',
          '.####.',
          '..##..',
        ]); // 42
      },
    },
    {
      id: 'hourglass',
      name: 'Klepsydra',
      build() {
        // dwa trójkąty stykające się wierzchołkami
        return pile([
          '######',
          '######',
          '.####.',
          '..##..',
          '.####.',
          '######',
          '######',
        ]); // 56
      },
    },
    {
      id: 'bridge',
      name: 'Most',
      build() {
        const L = [];
        R(L, 0, 0, 0, 10, 1);
        R(L, 0, 0, 1, 2, 3);
        R(L, 0, 8, 1, 2, 3);
        R(L, 1, 0, 0, 2, 4);
        R(L, 1, 8, 0, 2, 4);
        T(L, 2, 0.5, 1.5);
        T(L, 2, 8.5, 1.5);
        return L; // 40
      },
    },
    {
      id: 'minipyramid',
      name: 'Mała piramida',
      build() {
        const L = [];
        R(L, 0, 0, 0, 5, 4);
        R(L, 1, 0.5, 0.5, 4, 3);
        R(L, 2, 1, 1, 3, 2);
        R(L, 3, 1.5, 1.5, 2, 1);
        return L; // 40
      },
    },
    {
      id: 'heart',
      name: 'Serce',
      build() {
        // pod środkiem serca dziura
        return pile([
          '.##.##.',
          '#######',
          '###o###',
          '#######',
          '.#####.',
          '..###..',
          '...#...',
        ]); // 64
      },
    },
    {
      id: 'tree',
      name: 'Choinka',
      build() {
        // trzy piętra gałęzi i pień; dziura w środku
        return pile([
          '..###..',
          '.#####.',
          '#######',
          '.##o##.',
          '#######',
          '#######',
          '..###..',
          '..###..',
        ]);
      },
    },
    {
      id: 'butterfly',
      name: 'Motyl',
      build() {
        // skrzydła z „oczkami” – dziurami pod wyższymi piętrami
        return pile([
          '###.###',
          '#o#####',
          '#####o#',
          '..###..',
          '#o#####',
          '#####o#',
          '###.###',
        ]); // 70
      },
    },
    {
      id: 'castle',
      name: 'Zamek',
      build() {
        // cztery baszty i mury wokół pustego dziedzińca
        return pile([
          '###.###',
          '#######',
          '###.###',
          '##...##',
          '###.###',
          '#######',
          '###.###',
        ]);
      },
    },
    {
      id: 'tower',
      name: 'Wieża',
      build() {
        // smukła wieża: każde piętro przesunięte o pół kafelka i węższe
        const L = [];
        R(L, 0, 0, 0, 4, 9);
        R(L, 1, 0.5, 0.5, 3, 8);
        R(L, 2, 1, 1, 2, 7);
        R(L, 3, 1.5, 1.5, 1, 6);
        return L; // 80
      },
    },
    {
      id: 'cup',
      name: 'Puchar',
      build() {
        // czasza, nóżka i podstawa
        return pile([
          '#######',
          '#######',
          '#######',
          '.#####.',
          '..###..',
          '..###..',
          '.#####.',
          '#######',
        ]);
      },
    },
    {
      id: 'littleturtle',
      name: 'Żółwik',
      build() {
        // skorupa z pięter przesuniętych o pół kafelka; na górze pierścień
        // z dziurą, więc środek odsłania się dopiero po zdjęciu brzegów
        const L = [];
        R(L, 0, 1, 1, 5, 1);
        R(L, 0, 0, 2, 7, 5);
        R(L, 0, 1, 7, 5, 1);
        T(L, 0, 3, 0);
        T(L, 1, 3, 0);
        T(L, 0, 3, 8);
        R(L, 1, 1.5, 1.5, 4, 1);
        R(L, 1, 0.5, 2.5, 6, 4);
        R(L, 1, 1.5, 6.5, 4, 1);
        R(L, 2, 1, 2, 5, 1);
        R(L, 2, 1, 6, 5, 1);
        R(L, 2, 1, 3, 1, 3);
        R(L, 2, 5, 3, 1, 3);
        return L; // 96
      },
    },
    // ---- układy z kafelkami przesuniętymi o pół pola i dziurami ----
    {
      id: 'pyramids',
      name: 'Piramidki',
      build() {
        // pięć piramidek 4+1 na wspólnej, schodkowej podstawie: każdy szczyt
        // przykrywa po kawałku czterech kafelków niżej, a te – kolejne cztery
        const L = [];
        R(L, 0, 0, 0, 5, 5);
        R(L, 1, 0.5, 0.5, 4, 4);
        for (const [x, y] of [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]]) T(L, 2, x, y);
        return L; // 46
      },
    },
    {
      id: 'donut',
      name: 'Pączek',
      build() {
        // pierścień z dziurą w środku, wyżej pierścień przesunięty o pół kafelka
        const L = [];
        R(L, 0, 0, 0, 7, 2);
        R(L, 0, 0, 5, 7, 2);
        R(L, 0, 0, 2, 2, 3);
        R(L, 0, 5, 2, 2, 3);
        R(L, 1, 0.5, 0.5, 6, 1);
        R(L, 1, 0.5, 5.5, 6, 1);
        R(L, 1, 0.5, 1.5, 1, 4);
        R(L, 1, 5.5, 1.5, 1, 4);
        T(L, 2, 1, 1);
        T(L, 2, 5, 1);
        T(L, 2, 1, 5);
        T(L, 2, 5, 5);
        return L; // 64
      },
    },
    {
      id: 'roofs',
      name: 'Dachy',
      build() {
        // trzy długie dachy: kafelki wyżej przesunięte o pół, pod kalenicą dziura;
        // wolne są tylko końce najwyższych rzędów
        const L = [];
        for (const y of [0, 2.5, 5]) {
          R(L, 0, 0, y, 3, 2);
          R(L, 0, 4, y, 3, 2);
          R(L, 1, 0.5, y + 0.5, 6, 1);
          R(L, 2, 1, y + 0.5, 5, 1);
        }
        T(L, 3, 3, 3);
        return L; // 70
      },
    },
    {
      id: 'blossom',
      name: 'Kwiatek',
      build() {
        // cztery płatki-piramidki wokół wyższego środka
        const L = [];
        for (const [x, y] of [[2.5, 0], [0, 3], [5, 3], [2.5, 6]]) {
          R(L, 0, x, y, 2, 2);
          T(L, 1, x + 0.5, y + 0.5);
        }
        R(L, 0, 2, 2.5, 3, 3);
        R(L, 1, 2.5, 3, 2, 2);
        T(L, 2, 3, 3.5);
        return L; // 34
      },
    },
    {
      id: 'wall',
      name: 'Mur',
      build() {
        // rzędy jak cegły (co drugi przesunięty o pół), a każde piętro wyżej
        // przesunięte o pół kafelka – przykrywa końce rzędów pod spodem
        const L = [];
        const bricks = (z, x, y, rows, wide) => {
          for (let k = 0; k < rows; k++) R(L, z, x + (k % 2) * 0.5, y + k, wide - (k % 2), 1);
        };
        bricks(0, 0, 0, 6, 6);
        bricks(1, 0.5, 0.5, 5, 5);
        bricks(2, 1, 1, 4, 4);
        R(L, 3, 1.5, 1.5, 3, 3);
        T(L, 4, 2.5, 2.5);
        return L; // 80
      },
    },
    {
      id: 'windows',
      name: 'Okienka',
      build() {
        // cztery kwadraty, każdy z okienkiem (dziurą) pod daszkiem
        return pile([
          '###.###',
          '#o#.#o#',
          '###.###',
          '.......',
          '###.###',
          '#o#.#o#',
          '###.###',
        ]);
      },
    },
  ];

  // Telefon: układy najwyżej 7 kafelków szerokie i 9 wysokie (w dowolnej
  // orientacji – na pionowym ekranie zbyt szerokie układy są obracane).
  const PHONE_MAX = [7, 9];

  list.forEach((l) => {
    const pos = l.build();
    l.count = pos.length;
    const xs = pos.map((p) => p.x);
    const ys = pos.map((p) => p.y);
    l.cols = Math.ceil((Math.max(...xs) - Math.min(...xs) + 2) / 2);
    l.rows = Math.ceil((Math.max(...ys) - Math.min(...ys) + 2) / 2);
    l.phone = Math.min(l.cols, l.rows) <= PHONE_MAX[0] && Math.max(l.cols, l.rows) <= PHONE_MAX[1];
  });
  // od najmniejszych do największych
  list.sort((a, b) => a.count - b.count);

  return {
    list,
    PHONE_MAX,
    forDevice(device) {
      return device === 'phone' ? list.filter((l) => l.phone) : list;
    },
    get(id, device) {
      if (id === 'random') {
        const pool = this.forDevice(device);
        return pool[Math.floor(Math.random() * pool.length)];
      }
      return list.find((l) => l.id === id) || list[0];
    },
  };
})();

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

  const list = [
    {
      id: 'turtle',
      name: 'Żółw',
      build() {
        const L = [];
        R(L, 0, 1, 0, 12, 1);
        R(L, 0, 3, 1, 8, 1);
        R(L, 0, 2, 2, 10, 1);
        R(L, 0, 1, 3, 12, 1);
        R(L, 0, 1, 4, 12, 1);
        R(L, 0, 2, 5, 10, 1);
        R(L, 0, 3, 6, 8, 1);
        R(L, 0, 1, 7, 12, 1);
        T(L, 0, 0, 3.5);
        T(L, 0, 13, 3.5);
        T(L, 0, 14, 3.5);
        R(L, 1, 4, 1, 6, 6);
        R(L, 2, 5, 2, 4, 4);
        R(L, 3, 6, 3, 2, 2);
        T(L, 4, 6.5, 3.5);
        return L; // 144
      },
    },
    {
      id: 'pyramid',
      name: 'Piramida',
      build() {
        const L = [];
        R(L, 0, 0, 0, 8, 8);
        R(L, 1, 1, 1, 6, 6);
        R(L, 2, 2, 2, 4, 4);
        R(L, 3, 3, 3, 2, 2);
        return L; // 120
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
        const L = [];
        R(L, 0, 0, 3, 12, 2);
        R(L, 0, 5, 0, 2, 3);
        R(L, 0, 5, 5, 2, 5);
        R(L, 1, 2, 3, 8, 2);
        R(L, 1, 5, 1, 2, 2);
        R(L, 1, 5, 5, 2, 4);
        R(L, 2, 4, 3, 4, 2);
        R(L, 2, 5, 2, 2, 1);
        R(L, 2, 5, 5, 2, 2);
        R(L, 3, 5, 3, 2, 2);
        return L; // 86
      },
    },
    {
      id: 'stairs',
      name: 'Schody',
      build() {
        const L = [];
        R(L, 0, 0, 0, 10, 4);
        R(L, 1, 2, 0, 8, 4);
        R(L, 2, 4, 0, 6, 4);
        R(L, 3, 6, 0, 4, 4);
        return L; // 112
      },
    },
    {
      id: 'flower',
      name: 'Kwiat',
      build() {
        const L = [];
        R(L, 0, 3, 3, 4, 4);
        R(L, 0, 4, 0, 2, 3);
        R(L, 0, 4, 7, 2, 3);
        R(L, 0, 0, 4, 3, 2);
        R(L, 0, 7, 4, 3, 2);
        R(L, 1, 3, 3, 4, 4);
        R(L, 1, 4, 1, 2, 2);
        R(L, 1, 4, 7, 2, 2);
        R(L, 1, 1, 4, 2, 2);
        R(L, 1, 7, 4, 2, 2);
        R(L, 2, 4, 4, 2, 2);
        return L; // 76
      },
    },
    {
      id: 'small',
      name: 'Mały kwadrat',
      build() {
        const L = [];
        R(L, 0, 0, 0, 6, 6);
        R(L, 1, 1, 1, 4, 4);
        R(L, 2, 2, 2, 2, 2);
        return L; // 56
      },
    },
    {
      id: 'house',
      name: 'Domek',
      build() {
        const L = [];
        R(L, 0, 2, 0, 2, 1);
        R(L, 0, 1, 1, 4, 1);
        R(L, 0, 0, 2, 6, 3);
        R(L, 1, 1, 3, 4, 2);
        return L; // 32
      },
    },
    {
      id: 'snake',
      name: 'Wąż',
      build() {
        const L = [];
        R(L, 0, 0, 0, 6, 1);
        T(L, 0, 5, 1);
        R(L, 0, 0, 2, 6, 1);
        T(L, 0, 0, 3);
        R(L, 0, 0, 4, 6, 1);
        R(L, 1, 1, 0, 4, 1);
        R(L, 1, 1, 2, 4, 1);
        R(L, 1, 1, 4, 4, 1);
        return L; // 32
      },
    },
    {
      id: 'diamond',
      name: 'Diament',
      build() {
        const L = [];
        R(L, 0, 2, 0, 2, 1);
        R(L, 0, 1, 1, 4, 1);
        R(L, 0, 0, 2, 6, 2);
        R(L, 0, 1, 4, 4, 1);
        R(L, 0, 2, 5, 2, 1);
        R(L, 1, 1, 2, 4, 2);
        R(L, 1, 2, 1, 2, 1);
        R(L, 1, 2, 4, 2, 1);
        R(L, 2, 2, 2, 2, 2);
        return L; // 40
      },
    },
    {
      id: 'hourglass',
      name: 'Klepsydra',
      build() {
        const L = [];
        R(L, 0, 0, 0, 6, 1);
        R(L, 0, 1, 1, 4, 1);
        R(L, 0, 2, 2, 2, 2);
        R(L, 0, 1, 4, 4, 1);
        R(L, 0, 0, 5, 6, 1);
        R(L, 1, 1, 0, 4, 1);
        R(L, 1, 2, 1, 2, 1);
        R(L, 1, 2, 4, 2, 1);
        R(L, 1, 1, 5, 4, 1);
        R(L, 2, 2, 0, 2, 1);
        R(L, 2, 2, 5, 2, 1);
        return L; // 40
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
        const L = [];
        R(L, 0, 1, 0, 2, 1);
        R(L, 0, 4, 0, 2, 1);
        R(L, 0, 0, 1, 7, 2);
        R(L, 0, 1, 3, 5, 1);
        R(L, 0, 2, 4, 3, 1);
        T(L, 0, 3, 5);
        R(L, 1, 1, 1, 2, 1);
        R(L, 1, 4, 1, 2, 1);
        R(L, 1, 1, 2, 5, 1);
        R(L, 1, 2, 3, 3, 1);
        T(L, 1, 3, 4);
        R(L, 2, 2, 2, 3, 1);
        T(L, 2, 3, 3);
        return L; // 48
      },
    },
    {
      id: 'tree',
      name: 'Choinka',
      build() {
        const L = [];
        T(L, 0, 3, 0);
        R(L, 0, 2.5, 1, 2, 1);
        R(L, 0, 2, 2, 3, 1);
        R(L, 0, 1.5, 3, 4, 1);
        R(L, 0, 1, 4, 5, 1);
        R(L, 0, 0.5, 5, 6, 1);
        R(L, 0, 0, 6, 7, 1);
        T(L, 0, 3, 7);
        T(L, 0, 3, 8);
        R(L, 1, 2, 3, 3, 1);
        R(L, 1, 1.5, 4, 4, 1);
        R(L, 1, 1, 5, 5, 1);
        R(L, 1, 0.5, 6, 6, 1);
        R(L, 2, 1.5, 5, 4, 1);
        R(L, 2, 1, 6, 5, 1);
        T(L, 3, 3, 6);
        return L; // 58
      },
    },
    {
      id: 'butterfly',
      name: 'Motyl',
      build() {
        const L = [];
        R(L, 0, 0, 0, 3, 3);
        R(L, 0, 4, 0, 3, 3);
        R(L, 0, 0, 4, 3, 3);
        R(L, 0, 4, 4, 3, 3);
        R(L, 0, 3, 0, 1, 7);
        R(L, 0, 1, 3, 2, 1);
        R(L, 0, 4, 3, 2, 1);
        R(L, 1, 0.5, 0.5, 2, 2);
        R(L, 1, 4.5, 0.5, 2, 2);
        R(L, 1, 0.5, 4.5, 2, 2);
        R(L, 1, 4.5, 4.5, 2, 2);
        R(L, 1, 3, 1, 1, 5);
        R(L, 2, 3, 2, 1, 3);
        T(L, 3, 3, 3);
        return L; // 88
      },
    },
    {
      id: 'castle',
      name: 'Zamek',
      build() {
        const L = [];
        R(L, 0, 0, 1, 7, 7);
        T(L, 0, 0, 0);
        T(L, 0, 2, 0);
        T(L, 0, 4, 0);
        T(L, 0, 6, 0);
        R(L, 1, 0, 1, 2, 2);
        R(L, 1, 5, 1, 2, 2);
        R(L, 1, 0, 6, 2, 2);
        R(L, 1, 5, 6, 2, 2);
        R(L, 1, 2, 3, 3, 3);
        T(L, 2, 0.5, 1.5);
        T(L, 2, 5.5, 1.5);
        T(L, 2, 0.5, 6.5);
        T(L, 2, 5.5, 6.5);
        R(L, 2, 2.5, 4, 2, 1);
        return L; // 88
      },
    },
    {
      id: 'tower',
      name: 'Wieża',
      build() {
        const L = [];
        R(L, 0, 0, 0, 6, 9);
        R(L, 1, 1, 1, 4, 7);
        R(L, 2, 2, 2, 2, 5);
        T(L, 3, 2.5, 3);
        T(L, 3, 2.5, 5);
        return L; // 94
      },
    },
    {
      id: 'cup',
      name: 'Puchar',
      build() {
        const L = [];
        R(L, 0, 0, 0, 7, 1);
        R(L, 0, 0, 1, 7, 1);
        R(L, 0, 0.5, 2, 6, 1);
        R(L, 0, 1, 3, 5, 1);
        R(L, 0, 1.5, 4, 4, 1);
        R(L, 0, 2.5, 5, 2, 1);
        R(L, 0, 2.5, 6, 2, 1);
        R(L, 0, 1.5, 7, 4, 1);
        R(L, 0, 1, 8, 5, 1);
        R(L, 1, 0.5, 0, 6, 1);
        R(L, 1, 0.5, 1, 6, 1);
        R(L, 1, 1, 2, 5, 1);
        R(L, 1, 1.5, 3, 4, 1);
        R(L, 1, 2, 4, 3, 1);
        R(L, 1, 1.5, 8, 4, 1);
        R(L, 2, 1, 0, 5, 1);
        R(L, 2, 1, 1, 5, 1);
        R(L, 2, 1.5, 2, 4, 1);
        return L; // 98
      },
    },
    {
      id: 'littleturtle',
      name: 'Żółwik',
      build() {
        const L = [];
        R(L, 0, 1, 0, 5, 1);
        R(L, 0, 0, 1, 7, 7);
        T(L, 0, 3, 8);
        R(L, 1, 1, 2, 5, 5);
        R(L, 2, 2, 3, 3, 3);
        T(L, 3, 3, 4);
        return L; // 106
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
    l.cols = (Math.max(...xs) - Math.min(...xs) + 2) / 2;
    l.rows = (Math.max(...ys) - Math.min(...ys) + 2) / 2;
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

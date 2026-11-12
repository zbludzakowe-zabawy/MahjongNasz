# Mahjong Nasz – notatki dla Claude

Pasjans Mahjong w przeglądarce (PWA, działa offline, da się zainstalować na telefonie).
Strona: https://zbludzakowe-zabawy.github.io/MahjongNasz/ – publikowana automatycznie z `main` przez GitHub Actions.
Rozmowy, interfejs gry, komentarze w kodzie, commity i opisy PR są po polsku.

## Zasady pracy
- Zmiany na wyznaczonej gałęzi, potem pull request do `main`. Właściciel repozytorium sam scala.
  Jeśli poprzedni PR z tej gałęzi jest już scalony, zacznij gałąź od nowa od `origin/main`.
- Przed PR: `node tools/check-layouts.mjs` (gdy zmieniasz układy) i sprawdzenie w przeglądarce (Playwright, ekran telefonu; patrz „Testowanie”). Po zmianie wyglądu wyślij zrzuty ekranu.
- Bez frameworków, bez zależności i bez kroku budowania: czysty HTML, CSS i JS. Skrypty to zwykłe `<script>` (nie moduły ES), każdy plik to IIFE z jednym obiektem globalnym.
- **Gra jest przede wszystkim na telefon.** Układ na telefon ma najwyżej 7 kafelków szerokości i 9 wysokości (`PHONE_MAX` w `js/layouts.js`, w dowolnej orientacji).
- Po zmianie opcji, układów albo zestawów obrazków zaktualizuj README (lista układów z liczbą kafelków, opis opcji).
- Gdy zadanie ma kilka wariantów (np. nowe układy, logo), przygotuj kilka propozycji ze zrzutami do wyboru.

## Architektura
| Plik | Rola |
|---|---|
| `index.html` | szkielet: pasek (HUD, pomoce), plansza `#board`, schowek, okna (menu, wygrana, pomoc), banery PWA |
| `style.css` | wygląd; kolory kafelków zestawów: `[data-set="<id>"] { --tile-face; --tile-face2; --img-filter }` |
| `js/layouts.js` | `Layouts`: lista układów stosu, `pile()`, `PHONE_MAX`, `forDevice(device)`, `get(id, device)` (`'random'` losuje) |
| `js/tilesets.js` | `TileSets`: zestawy obrazków (`{ id, name, size, render(i) → HTML, preview:[3 indeksy] }`), `emojiSet`, `facesSet` (SVG 60×80 przez `wrap`) |
| `js/game.js` | cała gra: ustawienia, rozdanie, reguły, schowek, pomoce, gwiazdki, zakryte kafelki, animacje, menu, zapis partii |
| `js/pwa.js` | baner „Zainstaluj” (z podpowiedzią dla iPhone'a) i baner „Dostępna nowa wersja” |
| `sw.js` | service worker (offline). `VERSION` i `ASSETS` uzupełnia przy publikacji `tools/build-sw.mjs` |
| `manifest.webmanifest`, `icons/` | dane i ikony aplikacji; `icons/logo.svg` to źródło logo (kafelek ze złotą gwiazdką) |
| `tools/build-sw.mjs` | wpisuje do `sw.js` wersję (skrót wszystkich plików) i listę plików |
| `tools/check-layouts.mjs` | sprawdza układy i liczy, ile kafelków jest wolnych naraz |

Publikacja: `.github/workflows/pages.yml` (push do `main`) kopiuje `index.html style.css js icons manifest.webmanifest sw.js` do `_site`, potem uruchamia `build-sw` i publikuje na Pages. Nowy katalog z plikami strony trzeba dopisać do `cp` w workflow. `tools/` nie trafia na stronę.

## Układy (`js/layouts.js`)
- Współrzędne w opisie układu podaje się w jednostkach kafelka, dopuszczalne są połówki. Wewnętrznie przechowywane są w **półjednostkach** (`x*2`, `y*2`); `z` to piętro.
- Pomocnicze: `R(L, z, x, y, w, h)` (prostokąt), `T(L, z, x, y)` (jeden kafelek), `pile(art, levels)`.
- `pile(art)` buduje stos z rysunku podstawy: `#` to kafelek, `o` to dziura, `.` to puste pole. Każde piętro wyżej leży przesunięte o pół kafelka: kafelek trafia tam, gdzie pod spodem są 4 pola. Dziura `o` też się liczy, więc kafelek nad nią opiera się na trzech.
- Przy ładowaniu liczone są `count`, `cols`, `rows` (zaokrąglone w górę) i `phone`. Lista jest sortowana od najmniejszej liczby kafelków. `id` jest trwały (zapis ustawień, statystyki wyboru, `DEFAULT_LAYOUTS`/`DEVICE_LAYOUT` w `game.js`), nazwę można zmieniać.
- **Zasada dobrego układu:** w każdej chwili ma być wolnych niewiele kafelków. Wyższe piętro przesunięte o pół kafelka i węższe o pół z każdej strony przykrywa końce rzędów niżej, więc wolne są tylko brzegi najwyższego piętra. Kolumny pojedynczych kafelków są zawsze wolne (blokują tylko sąsiedzi z lewej i prawej), tak samo kafelki bez sąsiadów (np. „szachownica”). Takich miejsc należy unikać.
- Cele (z `tools/check-layouts.mjs`): wolnych na starcie najwyżej ok. 12, średnio w trakcie gry najwyżej ok. 11, liczba kafelków parzysta. Obecnie wszystkie układy na telefon i duże układy spełniają te cele.
- Na pionowym ekranie szeroki układ jest obracany (x ↔ y) w `newGame`, gdy jest szerszy niż wyższy. Po obrocie rzędy stają się kolumnami, a ciasność układu się zmienia. Układy na telefon projektuj więc jako wyższe niż szersze albo prawie kwadratowe.

## Reguły gry (`js/game.js`)
- Kafelek jest wolny, gdy nic na nim nie leży i ma wolny lewy **lub** prawy bok (`computeNeighbors`, `freeWith`). W półjednostkach: „leży na” = wyższe `z`, `|dx| < 2` i `|dy| < 2`; sąsiad z boku = to samo `z`, `dx = ±2`, `|dy| < 2`.
- Rozdanie zawsze da się rozwiązać: `solvableOrder` zdejmuje losowe pary wolnych kafelków (60% z najwyższego piętra), do 80 prób. Obrazki przydziela się parom w tej kolejności. `S.solution` służy lupie i miksowaniu.
- Trudność 1–5 (`DIFFICULTY`): `ratio` (ile par na jeden obrazek), `glow` (podświetlanie pasujących).
- Schowek: 4 miejsca (`SLOTS`). Pomoce: po 2 na poziom (lupa, cofnij, miksuj). Gwiazdki: 4 na starcie, wygrana także wtedy, gdy wszystkie kafelki na stosie mają gwiazdki. Kafelki zakryte (rewersem do góry) odwraca się kliknięciem; po 4 odwróceniach (`FLIPS_TO_STAY`) zostają odkryte na stałe.
- Tryb `variable` (Zmienny): po wygranej `nextVariant` zmienia układ i obrazki, zakrytych kafelków przybywa (2, 4, … do 30), gwiazdki włączają się i wyłączają co najwyżej co 4 poziomy.
- Menu pokazuje 7 najczęściej wybieranych układów i 5 zestawów (`layoutUse`/`tilesetUse`), resztę chowa pod przyciskiem „Więcej …”. Zanim gracz coś wybierze, pokazuje domyślne propozycje.

## Stan w localStorage
- `mahjongnasz-settings`: `{ v:2, layout, tileset, hidden, stars, dim, difficulty, device:'phone'|'desktop', mode:'fixed'|'variable', layoutUse, tilesetUse }`.
- `mahjongnasz-game` (partia zapisywana po każdym ruchu): `{ v:1, layout, tileset, difficulty, tiles:[[x,y,z,face,star,faceDown,loc,slot,flips]…], tray, helps, history, solution, starPath, level, stars, hiddenN, starsAge, elapsed }`. Pozycje kafelków są zapisane w partii, więc zmiana kształtu układu nie psuje zapisanej gry. Usunięcie układu albo zestawu sprawia, że partia się nie wczyta i gra otwiera menu.
- `mahjongnasz-install-dismissed`: ukryty baner instalacji.

## Zestawy obrazków (`js/tilesets.js`)
- Nowy zestaw: dopisz do `list` przez `emojiSet(id, name, 'emoji oddzielone spacjami')` albo `facesSet(id, name, [funkcje → SVG], preview)`. Rysunki SVG w `viewBox 0 0 60 80`, dobrze czytelne w małym rozmiarze (obrys, wyraźne kolory).
- Do tego kolory tła kafelka w `style.css`: `[data-set="<id>"]`. Każdy zestaw ma własne pastelowe tło.
- Liczba różnych obrazków ≥ 36 (przy trudności 5 każdy obrazek ma tylko jedną parę).

## PWA i ikony
- Przepis: skill „pwa-na-telefon”. Nowa wersja czeka na „Odśwież”, a partia zostaje zachowana.
- Zmiana ikony: telefony trzymają stare ikony w pamięci, więc nowe pliki dostają nowe nazwy (`-v2`, `-v3`…). Trzeba wtedy poprawić `manifest.webmanifest`, `index.html` i `ASSETS` w `sw.js`.
- `ASSETS` w źródłowym `sw.js` ma być poprawnym JS i zawierać każdy plik `js/*.js` (przy publikacji i tak nadpisuje go `build-sw.mjs`).

## Testowanie
- Układy: `node tools/check-layouts.mjs [id …]` pokazuje błędy (nieparzysta liczba, nachodzenie, kafelki w powietrzu) i miary ciasności. Kod wyjścia 1 oznacza błąd.
- Przeglądarka: `python3 -m http.server 8765` w katalogu repo (w tle), Playwright jest preinstalowany (`require('playwright')`). Uchwyt do testów: `window.__mahjong = { state, settings, newGame, clickTile, clickSlot, findPair, isFree }`.
  Przykład: `m.settings.device = 'phone'; m.settings.layout = 'castle'; m.newGame(1);`, potem zrzut ekranu. Gwarancję rozwiązania sprawdzisz przez `m.state.solution !== null` w wielu rozdaniach.
- Telefon: viewport 390×780 (lub `devices['Pixel 7']`). Komputer: np. 1100×760 i `settings.device = 'desktop'`.
- Service worker rejestruje się tylko przez HTTPS. Do testów offline podmień warunek w kopii `js/pwa.js` i zbuduj `sw.js` przez `tools/build-sw.mjs`.

## Pułapki
- `cd` w poleceniu Bash wraca potem do katalogu startowego. Używaj ścieżek bezwzględnych, a serwer HTTP po testach zatrzymaj (`pkill -f "http.server 8765"`).
- Nie zgaduj płci osób. W tekstach używaj form neutralnych.

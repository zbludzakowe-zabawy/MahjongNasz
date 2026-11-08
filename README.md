# Mahjong Nasz

Pasjans Mahjong w przeglądarce: czysty HTML, CSS i JavaScript, bez zależności i bez budowania.

## Uruchomienie

Otwórz `index.html` w przeglądarce. Możesz też podać katalog przez dowolny serwer statyczny, np. `python3 -m http.server`.

## Zasady

Zbieraj pary takich samych kafelków. Kafelek jest wolny, gdy nic na nim nie leży i ma wolny lewy **lub** prawy bok.

### Schowek (4 miejsca)
Zaznacz wolny kafelek i kliknij puste miejsce w schowku (albo kliknij kafelek dwukrotnie). Kafelki ze schowka można łączyć w pary z kafelkami z planszy albo z innymi kafelkami w schowku.

### Opcje gry
- **Układ stosu:** Żółw, Piramida, Forteca, Krzyż, Schody, Kwiat, Mały kwadrat albo Losowy.
- **Obrazki na kafelkach:** Klasyczny (kropki, bambusy, znaki, wiatry, smoki, kwiaty i pory roku), Owoce i warzywa, Zwierzęta, Natura, Sport i zabawa, Pojazdy, Słodycze.
- **Kafelki rewersem do góry:** brak, kilka (6) albo kilkanaście (14). Zakryty kafelek odwraca się dopiero wtedy, gdy nic na nim nie leży.
- **Gwiazdki:** na starcie 4 kafelki mają gwiazdkę. Zebranie pary z 1 gwiazdką daje gwiazdki 2 kafelkom na stosie, a pary z 2 gwiazdkami – 4 kafelkom. Wygrywasz po oczyszczeniu planszy **albo** gdy wszystkie pozostałe kafelki mają gwiazdki.
- **Poziom trudności 1–5** działa niezależnie od pozostałych opcji:

  | Poziom | Powtórzeń obrazka | Przyciemnione zablokowane | Podświetlanie pasujących |
  |---|---|---|---|
  | 1 | ok. 8 | tak | tak |
  | 2 | ok. 6 | tak | nie |
  | 3 | ok. 4 | nie | nie |
  | 4 | ok. 3 | nie | nie |
  | 5 | 2 (jeśli zestaw na to pozwala) | nie | nie |

  Każde rozdanie da się rozwiązać.

### Pomoce (po 2 na każdy poziom)
- 🔍 **Lupa** – pokazuje parę, którą można zebrać.
- ↶ **Cofnij** – cofa ostatni ruch (zebraną parę albo odłożenie do schowka).
- 🔀 **Miksuj** – tasuje kafelki pozostałe na stosie tak, żeby dało się je dalej zbierać.

Skróty klawiszowe: `H` lupa, `U` cofnij, `M` miksuj.

Po wygranej przycisk **Następny poziom** rozdaje nową planszę i daje nowy komplet pomocy.

## Struktura

- `index.html` – szkielet strony
- `style.css` – wygląd
- `js/layouts.js` – układy stosów
- `js/tilesets.js` – zestawy obrazków
- `js/game.js` – logika gry

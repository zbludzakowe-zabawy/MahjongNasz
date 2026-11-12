# Mahjong Nasz

Pasjans Mahjong w przeglądarce: czysty HTML, CSS i JavaScript, bez zależności i bez budowania.

**Zagraj:** https://zbludzakowe-zabawy.github.io/MahjongNasz/

## Aplikacja na telefon

Gra jest aplikacją PWA: działa bez internetu i można ją zainstalować na ekranie głównym.

- **Android (Chrome, Edge, Samsung Internet):** po otwarciu strony pojawi się baner **Zainstaluj**. Można też użyć menu przeglądarki → *Zainstaluj aplikację* / *Dodaj do ekranu głównego*.
- **iPhone / iPad (Safari):** baner podpowiada: **Udostępnij** → **Do ekranu początkowego**.
- **Komputer (Chrome, Edge):** ikona instalacji na pasku adresu.

Bieżąca partia zapisuje się po każdym ruchu, więc wraca po zamknięciu aplikacji. Po opublikowaniu nowej wersji gra pokazuje komunikat **Dostępna nowa wersja**; po stuknięciu *Odśwież* partia jest zachowana.

## Uruchomienie

Otwórz `index.html` w przeglądarce. Możesz też podać katalog przez dowolny serwer statyczny, np. `python3 -m http.server`.

Każdy push do `main` publikuje grę na GitHub Pages (workflow `.github/workflows/pages.yml`). Jednorazowo trzeba włączyć Pages w ustawieniach repozytorium: **Settings → Pages → Source: GitHub Actions**.

## Zasady

Zbieraj pary takich samych kafelków. Kafelek jest wolny, gdy nic na nim nie leży i ma wolny lewy **lub** prawy bok.

### Schowek (4 miejsca)
Zaznacz wolny kafelek i kliknij puste miejsce w schowku (albo kliknij kafelek dwukrotnie). Kafelki ze schowka można łączyć w pary z kafelkami z planszy – wystarczy jedno kliknięcie w pasujący kafelek na stosie. Gdy do schowka trafią dwa takie same kafelki, od razu tworzą parę i znikają.

### Opcje gry
- **Urządzenie:** 📱 Telefon albo 🖥️ Komputer (wykrywane automatycznie przy pierwszym uruchomieniu). Na telefonie dostępne są układy najwyżej 7 kafelków szerokie i 9 wysokie (większe też można odsłonić przyciskiem **Więcej układów** i w nie zagrać). Na komputerze dostępne są wszystkie układy.
- **Porządek w menu:** od razu widać 7 najczęściej wybieranych układów (plus Losowy) i 5 ulubionych zestawów obrazków; pozostałe są pod przyciskami **Więcej układów** / **Więcej obrazków**. Zanim gracz zacznie wybierać, widoczne są domyślne propozycje – dla obrazków: Muzyka, Klasyczny, Kotki, Minecraft, Natura.
- **Układ stosu:**
  - na telefon (do 7×9): Kwiatek (34), Mała piramida (40), Diament (42), Wąż (42), Piramidki (46), Domek (48), Okienka (52), Klepsydra (56), Pączek (64), Serce (64), Zamek (66), Mały kwadrat (68), Dachy (70), Motyl (70), Choinka (80), Mur (80), Wieża (80), Puchar (84), Żółwik (96);
  - kafelki na wyższym piętrze mogą leżeć przesunięte o pół kafelka (jak w piramidce 4+1: jeden kafelek na górze przykrywa po kawałku cztery pod spodem), a niższe piętro może mieć dziury: Piramidki (pięć piramidek 4+1 na wspólnej schodkowej podstawie), Kwiatek (płatki-piramidki wokół wyższego środka), Pączek (pierścień z dziurą, wyżej pierścień przesunięty o pół), Dachy (trzy długie dachy z dziurą pod kalenicą – na starcie wolne są tylko końce najwyższych rzędów), Okienka (cztery kwadraty, każdy z okienkiem pod daszkiem), Mur (rzędy jak cegły, co drugi przesunięty o pół), Mały kwadrat (ze studnią w środku), Wieża, Żółwik (na skorupie pierścień z dziurą), Serce (z dziurą pod środkiem), Diament, Klepsydra, Motyl (z „oczkami” – dziurami w skrzydłach), Zamek (baszty wokół pustego dziedzińca), Puchar, Choinka, Domek (z kominem i drzwiami), Wąż. W tych układach każde piętro wyżej jest przesunięte o pół kafelka i przykrywa końce rzędów pod spodem, więc naraz dostępnych jest niewiele kafelków (na starcie 5–12);
  - większe (domyślnie na komputer): Most (40), Kwiat (76), Schody (80), Forteca (84), Krzyż (98), Piramida (130), Żółw (152) – też z piętrami przesuniętymi o pół kafelka;
  - albo Losowy (na telefonie losowany spośród układów na telefon).
- **Obrazki na kafelkach** (domyślnie Muzyka): Klasyczny (kropki, bambusy, znaki, wiatry, smoki, kwiaty i pory roku), Owoce i warzywa, Zwierzęta, Natura, Sport i zabawa, Pojazdy, Słodycze, Muzyka (nuty i instrumenty), Minecraft (pikselowe kostki i przedmioty), Kotki (6 umaszczeń z różnymi dodatkami), Góry i wspinaczka (szczyty, schronisko, znak szlaku, zwierzęta tatrzańskie i sprzęt wspinaczkowy).
- **Kafelki rewersem do góry:** brak, kilka (6) albo kilkanaście (14). Zakryty kafelek odwracasz kliknięciem, gdy jest wolny. Jeśli nie trafi do pary (zaznaczysz inny kafelek albo odznaczysz ten), znów odwraca się rewersem do góry. Po 4 odwróceniach zostaje odkryty na stałe.
- **Gwiazdki:** na starcie 4 kafelki mają gwiazdkę. Zebranie pary z 1 gwiazdką daje gwiazdki 2 kafelkom na stosie, a pary z 2 gwiazdkami – 4 kafelkom. Wygrywasz po oczyszczeniu planszy **albo** gdy wszystkie kafelki na stosie mają gwiazdki. Kafelki w schowku się nie liczą. Gwiezdne zwycięstwo kończy animacja: świetlista ścieżka przez miejsca, gdzie zebrano gwiazdki, z gwiazdką innego koloru i kształtu dla każdego piętra stosu, oraz deszcz migoczących gwiazdek. Zwycięstwo przez oczyszczenie planszy kończy wystrzał konfetti.
- **Poziom trudności 1–5** działa niezależnie od pozostałych opcji:

  | Poziom | Powtórzeń obrazka | Podświetlanie pasujących |
  |---|---|---|
  | 1 | ok. 8 | tak |
  | 2 | ok. 6 | nie |
  | 3 | ok. 4 | nie |
  | 4 | ok. 3 | nie |
  | 5 | 2 (jeśli zestaw na to pozwala) | nie |

  Każde rozdanie da się rozwiązać.
- **Tryb gry:** *Stały* (każdy poziom według ustawień) albo *Zmienny* – po każdej wygranej następna plansza ma inny układ i inne obrazki, zakrytych kafelków przybywa (2 na pierwszym poziomie, potem 4, 6… do 30), a co jakiś czas (najpóźniej co 4 poziomy) gra zmienia się z gwiazdkami na bez gwiazdek i odwrotnie.
- **Przyciemniaj niedostępne:** opcjonalne przyciemnianie zablokowanych kafelków (domyślnie wyłączone).

### Pomoce (po 2 na każdy poziom)
- 🔍 **Lupa** – pokazuje parę, którą można zebrać.
- ↶ **Cofnij** – cofa ostatni ruch (zebraną parę albo odłożenie do schowka).
- 🔀 **Miksuj** – tasuje kafelki pozostałe na stosie tak, żeby dało się je dalej zbierać. Kafelki zjeżdżają wirując do środka, mieszają się i rozlatują z powrotem na miejsca.

Skróty klawiszowe: `H` lupa, `U` cofnij, `M` miksuj.

Po wygranej przycisk **Następny poziom** rozdaje nową planszę i daje nowy komplet pomocy.

## Struktura

- `index.html` – szkielet strony
- `style.css` – wygląd
- `js/layouts.js` – układy stosów
- `js/tilesets.js` – zestawy obrazków
- `js/game.js` – logika gry
- `js/pwa.js` – instalacja aplikacji i komunikat o nowej wersji
- `sw.js` – service worker (gra offline); `tools/build-sw.mjs` przy publikacji wpisuje do niego wersję i listę plików
- `manifest.webmanifest`, `icons/` – dane i ikony aplikacji (`icons/logo.svg` to źródło logo, z którego powstały ikony PNG)
- `tools/check-layouts.mjs` – sprawdza układy (`node tools/check-layouts.mjs`): błędy i to, ile kafelków jest wolnych naraz
- `CLAUDE.md` – notatki o budowie gry dla Claude

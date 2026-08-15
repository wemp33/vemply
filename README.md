# Vemply

Prywatna aplikacja webowa (PWA) do treningu wyznaczania **dnia tygodnia z daty**.
Bez App Store, bez instalacji, bez kont — otwierasz link i dodajesz do ekranu głównego.

## Jak działa

- System losuje datę i pokazuje 7 przycisków: *niedziela … sobota*.
- **Dobrze** → przycisk zapala się na zielono, po 0,5 s leci następna data.
- **Źle** → wybrany przycisk na czerwono, poprawny na zielono, aplikacja **czeka** — sam klikasz „Dalej".
- Przycisk w prawym dolnym rogu siatki („Pomiń" / „Dalej") przechodzi do następnej daty.
- Zero podpowiedzi. Kolejne daty są przygotowane z wyprzedzeniem (bufor 8 pytań), więc przejście jest natychmiastowe.

## Ściągi (ikony **E**, **D** i **C** w nagłówku)

**E — martwy dzień roku.** Wyliczenie krok po kroku, na losowanym przykładzie
(przycisk *Inny rok* losuje kolejny z zakresu 1700–2099):

1. kotwica stulecia **C** (z ekranu C),
2. dwie ostatnie cyfry roku ÷ 12 — ile całych,
3. reszta z tego dzielenia,
4. ta reszta ÷ 4 — ile całych,
5. suma czterech liczb, od której odejmujemy po 7, aż zostanie 0–6.

Wynik to dzień tygodnia (0 = niedziela … 6 = sobota), w którym w tym roku wypadają
wszystkie daty z ekranu D. Formalnie:

```
(C + ⌊YY/12⌋ + YY mod 12 + ⌊(YY mod 12)/4⌋) mod 7
```

Wzór zweryfikowany dla wszystkich lat 1583–2400 wobec dnia tygodnia 4 kwietnia
liczonego z numeru dnia juliańskiego — zero rozbieżności; dodatkowo 250 losowań
sprawdzonych krok po kroku razem z tym, co pokazuje ekran.

**D — dni doomsday.** Wszystkie dni, które w obrębie jednego roku wypadają w tym samym
dniu tygodnia — w każdym miesiącu kotwica i jej powtórzenia co 7 dni (52 dni w roku).
Miesiące w kolejności kalendarzowej, po dwa w rzędzie:

| Miesiąc | Dni (kotwica **pogrubiona**) |
|---|---|
| styczeń | **3** · 10 · 17 · 24 · 31 — *przestępny:* **4** · 11 · 18 · 25 |
| luty | 7 · 14 · 21 · **28** — *przestępny:* 1 · 8 · 15 · 22 · **29** |
| marzec | 7 · **14** · 21 · 28 |
| kwiecień | **4** · 11 · 18 · 25 |
| maj | 2 · **9** · 16 · 23 · 30 |
| czerwiec | **6** · 13 · 20 · 27 |
| lipiec | 4 · **11** · 18 · 25 |
| sierpień | 1 · **8** · 15 · 22 · 29 |
| wrzesień | **5** · 12 · 19 · 26 |
| październik | 3 · **10** · 17 · 24 · 31 |
| listopad | **7** · 14 · 21 · 28 |
| grudzień | 5 · **12** · 19 · 26 |

Reguła kotwic (na ekranie jako notka pod tabelą): w miesiącach parzystych dzień = numer
miesiąca, w nieparzystych działa „9–5, 7–11".

Przełącznik *rok zwykły / rok przestępny* podmienia listy stycznia i lutego
(pozostałe dziesięć miesięcy nie zmienia się nigdy). Żaden konkretny rok nie jest pokazywany.
Listy nie są wpisane na sztywno — aplikacja liczy je z kotwicy i długości miesiąca.

**C — kotwice stuleci.** Dzień tygodnia doomsday dla roku „00" danego stulecia:

| Stulecie | Numer | Dzień |
|---|---|---|
| 1700–1799 | 0 | niedziela |
| 1800–1899 | 5 | piątek |
| 1900–1999 | 3 | środa |
| 2000–2099 | 2 | wtorek |

Cykl powtarza się co 400 lat (2100 jak 1700 itd.).

Obie tabele zweryfikowane rachunkiem dla lat 1–2400: dla każdego roku, zwykłego
i przestępnego, wyświetlane listy pokrywają się **dokładnie** ze zbiorem dni, które
w tym roku wypadają w dniu doomsday (zero niezgodności — porównanie z niezależną
implementacją opartą o numer dnia juliańskiego), a kotwice stuleci zgadzają się
z obliczonym 4.04 danego roku setnego.

## Udostępnianie

Ikona kodu QR w nagłówku otwiera arkusz z kodem prowadzącym pod adres aplikacji —
wystarczy, że ktoś zeskanuje go aparatem telefonu. Pod spodem przycisk *Udostępnij link*
(systemowe okno udostępniania, a bez jego wsparcia — kopiowanie do schowka).

Kod QR jest wklejony do `index.html` jako SVG, więc działa też offline. Po zmianie adresu
aplikacji trzeba go wygenerować od nowa i podmienić zawartość `.qr-card`:

```bash
npx qrcode -t svg -e M -o qr.svg "https://wemp33.github.io/vemply/"
```

## Arkusze (ustawienia, QR)

Arkusze zamyka się gestem — w trakcie przeciągania podążają za palcem 1:1
(w górę z oporem), a przyciemnienie tła gaśnie proporcjonalnie do przesunięcia.
Po puszczeniu decyduje dystans (28 % wysokości, ale nie więcej niż 140 px)
**albo** prędkość (0,5 px/ms), więc krótkie strzepnięcie też zamyka; czas animacji
dobiera się do prędkości gestu.

Strefa zamykania jest celowo większa niż sam uchwyt:

- cała góra arkusza (uchwyt, tytuł, a w sekcji D także przełącznik roku i notka)
  ciągnie arkusz zawsze — w sekcji D to ok. 28 % jego wysokości;
- poza tą strefą gest łapie się, gdy treść jest przewinięta na samą górę: ruch w dół
  zamyka, ruch w górę oddaje sterowanie przewijaniu;
- po przewinięciu treści w dół gest z jej obszaru nie zamyka arkusza, żeby dało się
  wrócić do góry — wtedy zostaje górna strefa albo stuknięcie w tło.

## Zakres dat (Ustawienia)

| Tryb | Zakres |
|---|---|
| Tylko naszej ery *(domyślnie)* | 1 – 2400 n.e. |
| Naszej ery i p.n.e. | 3000 p.n.e. – 2400 n.e. (ok. 30 % dat p.n.e.) |
| Tylko przed naszą erą | 3000 – 1 p.n.e. |

Losowanie jest ważone — daty bliskie nam wypadają najczęściej (ok. 60 % trafia
w lata 1975–2049), ale każdy rok z pełnego zakresu ma niezerową szansę.

## Kalendarz

Wszystko liczone **wyłącznie kalendarzem gregoriańskim (proleptycznym)**, z latami
przestępnymi (podzielne przez 4, bez pełnych stuleci niepodzielnych przez 400).
Lata p.n.e. w numeracji astronomicznej: rok 0 = 1 p.n.e., rok −1 = 2 p.n.e.

Dzień tygodnia liczony z numeru dnia juliańskiego:

```
a = ⌊(14 − m) / 12⌋
y' = rok + 4800 − a
m' = m + 12a − 3
JDN = d + ⌊(153m' + 2)/5⌋ + 365y' + ⌊y'/4⌋ − ⌊y'/100⌋ + ⌊y'/400⌋ − 32045
dzień tygodnia = (JDN + 1) mod 7      // 0 = niedziela
```

Algorytm zweryfikowany dzień po dniu dla całego zakresu **4001 p.n.e. – 2600 n.e.**
(2 410 966 dni, zero rozbieżności z niezależną implementacją referencyjną).

## Instalacja na iPhonie

1. Otwórz link w **Safari**.
2. Przycisk *Udostępnij* → **Dodaj do ekranu początkowego**.
3. Aplikacja startuje pełnoekranowo, bez paska adresu, i działa **offline**.

## Pliki

```
index.html              cała aplikacja (HTML + CSS + JS, bez zależności)
manifest.webmanifest    manifest PWA
sw.js                   service worker (tryb offline)
icons/                  ikony wygenerowane skryptem
tools/gen-icons.mjs     generator ikon (czysty Node, bez bibliotek)
```

Uruchomienie lokalnie:

```bash
npx serve -l 5173 .
```

## Skróty klawiszowe (desktop)

`1`–`7` = odpowiedź (kolejność jak na ekranie) · `spacja` / `Enter` = następna data

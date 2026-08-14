# Vemply

Prywatna aplikacja webowa (PWA) do treningu wyznaczania **dnia tygodnia z daty**.
Bez App Store, bez instalacji, bez kont — otwierasz link i dodajesz do ekranu głównego.

## Jak działa

- System losuje datę i pokazuje 7 przycisków: *niedziela … sobota*.
- **Dobrze** → przycisk zapala się na zielono, po 0,5 s leci następna data.
- **Źle** → wybrany przycisk na czerwono, poprawny na zielono, aplikacja **czeka** — sam klikasz „Dalej".
- Dolny przycisk pomija datę bez odpowiadania.
- Zero podpowiedzi. Kolejne daty są przygotowane z wyprzedzeniem (bufor 8 pytań), więc przejście jest natychmiastowe.

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

# design.md — Sklum (karta produktu)

> Źródło: https://www.sklum.com/pl/kup-stoly-do-jadalni/184223-okragly-stol-jadalniany-z-cementu-namara.html
> Wartości odczytane ze stylów strony (zmienne CSS `:root` i style obliczone) — stan na 2026-11-10.

## 1. Charakter wizualny

- **Minimalizm skandynawsko‑śródziemnomorski**: biel, czerń i ciepły beż; fotografia produktu gra główną rolę.
- **Ostre krawędzie** — przyciski, pola i karty mają `border-radius: 0`. Okrągłe są wyłącznie próbki kolorów.
- **Jeden krój pisma** (Azeret) w kilku wagach; hierarchia budowana rozmiarem i wagą, nie kolorem.
- **Monochromatyczne CTA** — główny przycisk jest prawie czarny; kolor pojawia się tylko jako sygnał statusu (zielona dostępność).
- Dużo powietrza, cienkie linie podziału (`#D9D9D9`), brak cieni.

## 2. Kolory

### Tokeny marki

| Token | Wartość | Zastosowanie |
|---|---|---|
| `--color__primary-100` | `#191919` | CTA, tytuły, linki, logo, nawigacja |
| `--color__text` | `#2E2E2E` | Domyślny kolor tekstu |
| `--color__primary-50` | `#747474` | Tekst drugorzędny, stara cena, wybrana wartość wariantu |
| `--color__primary-30` | `#D2D2D2` | Obramowania przycisków wariantów |
| `--color__primary-20` | `#E6E6E5` | Delikatne tła/separatory |
| `--color__secondary` | `#EFECE6` | Ciepły beż — tło bloków, stopka, kontrolki slidera |
| `--color__secondary--dark` | `#DBD4C7` | Ciemniejszy beż (hover/aktywny na beżu) |
| `--palette__white` | `#FFFFFF` | Tło strony i nagłówka |
| `--palette__black` | `#000000` | Pasek promocyjny, plakietki |
| `--selection__bg-color` | `#DDD3CC` | Tło zaznaczonego tekstu |

### Kolory UI / statusu

| Token | Wartość | Zastosowanie |
|---|---|---|
| (dostępność) | `#0D5F00` | „W magazynie, przewidywana dostawa…” |
| `--ui-color__success` | `#639C63` | Sukces |
| `--ui-color__danger` | `#E74C40` | Błąd |
| `--ui-color__warning` | `#FF9F0F` | Ostrzeżenie |
| `--ui-color__info` | `#00CBE6` | Informacja |
| `--ui-color__details` / `--border-color__details` | `#D9D9D9` | Linie podziału |
| `--ui-color__bg-shade` | `#F5F5F5` | Wyszarzone tła, disabled |
| `--bg-color__account` | `#F9F9F9` | Tło sekcji konta |
| `--review-star-filled` | `#4B4A4E` | Gwiazdki ocen (pełne) |
| `--review-star-empty` | `#D0D0D0` | Gwiazdki ocen (puste) |

## 3. Typografia

- **Krój:** `Azeret, sans-serif` (`--font__primary`) — jedyna rodzina na całej stronie.
- **Wagi:** 300 light · 400 normal · 500 medium · 600 semibold · 700 bold.
- **Skala modularna:** bazowo `1em` (16px), współczynnik **1.125** (major second).

| Token | Wzór | ≈ px |
|---|---|---|
| `--text-xxs` | base / 1.125³ | 11.2 |
| `--text-xs` | base / 1.125² | 12.6 |
| `--text-sm` | base / 1.125 | 14.2 |
| `--text-md` | base | 16 |
| `--text-lg` | base × 1.125 | 18 |
| `--text-xl` | base × 1.125² | 20.25 |
| `--text-xxl` | base × 1.125³ | 22.8 |
| `--text-xxxl` | base × 1.125⁴ | 25.6 |

### Style tekstu na karcie produktu

| Element | Rozmiar / waga | Kolor | Uwagi |
|---|---|---|---|
| Nazwa kolekcji („Namara”) | 22.8px / 600 | `#2E2E2E` | line-height ≈ 1.25 |
| H1 — pełna nazwa produktu | 14.2px / 400 | `#2E2E2E` | celowo mały, pod nazwą kolekcji |
| Cena końcowa | 25.6px / 500 | `#191919` | line-height 1 |
| Cena przekreślona | 14.2px / 300 | `#747474` | `line-through` |
| Etykieta opcji („Rozmiar:”) | 14.2px / 400 | `#2E2E2E` | wybrana wartość obok w `#747474` |
| Nagłówki akordeonu (OPIS, ROZMIARY, MATERIAŁ, CECHY) | 14.2px / 400 | `#2E2E2E` | `uppercase` |
| Tytuł sekcji („Opinie o produkcie”) | 20.25px / 400 | `#191919` | |
| Tekst pomocniczy (Klarna, raty) | 12.6px / 400 | `#2E2E2E` | linki podkreślone |
| Informacja o dostawie | 11.2px / 300 | `#0D5F00` | z ikoną ciężarówki |
| Nawigacja główna | 12px / 400 | `#191919` | wybrane pozycje `is-bold` |
| Body | 16px / 400, lh 24px | `#2E2E2E` | |

## 4. Odstępy i layout

- **Jednostka:** `--spacing-unit: 1em` (wariant stały `1rem`).

| Token | Mnożnik | ≈ px |
|---|---|---|
| `--spacing-xxxs` | 0.125 | 2 |
| `--spacing-xxs` | 0.25 | 4 |
| `--spacing-xs` | 0.5 | 8 |
| `--spacing-sm` | 0.75 | 12 |
| `--spacing-md` | 1 | 16 |
| `--spacing-lg` | 1.25 | 20 |
| `--spacing-xl` | 1.5 | 24 |
| `--spacing-xxl` | 1.75 | 28 |
| `--spacing-xxxl` | 2 | 32 |
| `--spacing-xxxxl` | 4 | 64 |

- **Maks. szerokość strony:** `--site__max-width: 1400px`.
- **Nagłówek:** `--header__height: 50px` (łącznie z paskiem promo i menu ≈ 132px).
- **Karta produktu (desktop):** dwie kolumny — galeria ≈ 55–60% po lewej, panel zakupowy po prawej (sticky).
- **Galeria:** siatka 2 duże zdjęcia u góry + 3 mniejsze poniżej, odstęp ~4px, brak zaokrągleń, zdjęcia na neutralnym tle (lifestyle + packshot).
- **Z‑index:** loader 20 · header 30 · dropdown/overlay 40 · modal 50.

## 5. Komponenty

### Pasek promocyjny
Pełna szerokość, tło `#000`, biały tekst 14px, wysokość 32px, wyśrodkowany (np. „BLACK NOVEMBER | Up to -50% off”).

### Nagłówek
Białe tło; po lewej hamburger + logo „sklum” (SVG, `#191919`); po prawej pole „Szukaj produktu” z podkreśleniem (bez ramki) i ikony konta, koszyka, ulubionych (liniowe, monochromatyczne). Poniżej poziome menu kategorii 12px, oddzielone cienką linią.

### Breadcrumbs
`Home / Meble / Stoły / Stoły do jadalni` — separator `/`, ostatni element pogrubiony.

### Plakietka (badge)
Czarne tło, biały tekst wersalikami, mały rozmiar (~11px), bez zaokrągleń (np. „BLACK NOVEMBER”). Plakietka rabatu („-8%”) — jasnoszare tło, ciemny tekst.

### Przycisk główny (CTA „Dodaj do koszyka”)
```css
background: #191919;
color: #FFFFFF;
border: 1px solid #191919;
border-radius: 0;
padding: 7.2px 12px;
height: 40px;
font: 400 14.4px/1.5 Azeret, sans-serif;
```
Zawiera cenę w nawiasie i ikonę torby. Obok: selektor ilości `− 1 +` (biały, ramka 1px) oraz ikona „zapisz” (zakładka).

### Przycisk drugorzędny / ghost
Tło `#EEEEEE`, ramka `1px solid rgba(34,34,34,.2)`, tekst `#444` 14px/700, padding `8px 16px`, bez zaokrągleń.

### Przycisk nakładkowy na zdjęciu („Zobacz w 3D”)
Tło `rgba(255,255,255,.6)`, padding `8px 12px`, ikona kostki + tekst 14.2px.

### Selektor wariantu (rozmiar)
```css
/* nieaktywny */
border: 1px solid #D2D2D2;
padding: 3px 6px;
font: 300 12.6px Azeret;
color: #2E2E2E;
border-radius: 0;
/* aktywny */
background: #191919;
color: #FFFFFF;
```

### Próbki kolorów
Okrągłe miniatury tekstury (25×25px, `border-radius: 100%`); aktywna próbka ma dodatkowy pierścień (obramowanie z odstępem).

### Oceny
5 gwiazdek (`#4B4A4E` / `#D0D0D0`), liczba ocen i podkreślony link „17 opinie”.

### Dostępność i dostawa
Ikona ciężarówki + tekst 11.2px/300 w kolorze `#0D5F00`.

### Akordeon szczegółów
Nagłówki wersalikami (OPIS, ROZMIARY, MATERIAŁ, CECHY), oddzielone liniami `#D9D9D9`, rozwijane ikoną +/strzałką.

### Widżet czatu
Pływający okrągły przycisk w lewym dolnym rogu, tło `rgba(64,64,64,.75)`, biała ikona.

## 6. Zasady stosowania

1. Nie zaokrąglaj narożników (wyjątek: próbki kolorów, awatary, pływające przyciski).
2. Nie używaj cieni — separuj sekcje cienką linią lub beżowym tłem `#EFECE6`.
3. Kolor akcentowy = czerń `#191919`; barwne kolory tylko dla statusów.
4. Hierarchia tekstu przez skalę 1.125 i wagi 300–600; wersaliki tylko dla etykiet sekcji i plakietek.
5. Zdjęcia w ciepłej, naturalnej tonacji (beże, drewno, kamień) — interfejs ma im nie konkurować.

## 7. Tokeny CSS (gotowe do użycia)

```css
:root {
  /* kolory */
  --color-primary: #191919;
  --color-text: #2E2E2E;
  --color-muted: #747474;
  --color-border-strong: #D2D2D2;
  --color-border: #D9D9D9;
  --color-subtle: #E6E6E5;
  --color-sand: #EFECE6;
  --color-sand-dark: #DBD4C7;
  --color-bg: #FFFFFF;
  --color-bg-shade: #F5F5F5;
  --color-black: #000000;
  --color-stock: #0D5F00;
  --color-success: #639C63;
  --color-danger: #E74C40;
  --color-warning: #FF9F0F;
  --color-info: #00CBE6;
  --color-selection: #DDD3CC;

  /* typografia */
  --font-primary: "Azeret", sans-serif;
  --text-ratio: 1.125;
  --text-base: 1rem;

  /* layout */
  --radius: 0;
  --site-max-width: 1400px;
  --header-height: 50px;
  --spacing-unit: 1rem;
}
```

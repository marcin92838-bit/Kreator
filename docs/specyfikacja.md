# Specyfikacja MVP: Kalendarz zadań

_Wersja robocza 0.1 · 2026-11-17_
_Źródła: `docs/brief.md` (wersja 3), `docs/plan-testu.md` (prototyp v3), `prototyp/index.html` (v3), `DESIGN.md`, notatki z testów prototypu v2._

Oznaczenia w tekście:
- **[DECYZJA]** — sprawa otwarta, którą rozstrzyga autor przed rozpoczęciem budowy MVP.
- **[PO TEŚCIE v3]** — do potwierdzenia lub zmiany po testach prototypu v3.

---

## 1. Cel produktu

Osoba pracująca zdalnie dostaje na prywatną skrzynkę maile z fakturami (telefon, internet, gaz, prąd itd.) i łatwo je przeocza — skutkiem może być monit, a nawet odcięcie usługi. Kalendarz zadań zbiera w jednym miejscu:

- **faktury do zapłacenia**, odczytane automatycznie z maili, ułożone według terminu płatności,
- **własne zadania** dodane ręcznie (np. wywóz śmieci według harmonogramu gminy).

Użytkownik nie musi stale pilnować skrzynki ani pamiętać o domowych obowiązkach — wystarczy, że zajrzy do kalendarza.

## 2. Użytkownik

Jedna rola: **właściciel konta** — osoba pracująca przy komputerze, która podłącza swoją prywatną skrzynkę pocztową. MVP nie przewiduje współdzielenia kalendarza ani innych ról.

Urządzenie docelowe: komputer (laptop, monitor). Widok musi pozostać użyteczny na wąskim ekranie (prototyp ma już układ responsywny), ale optymalizujemy pod desktop.

## 3. Wnioski z prototypu i testów

### 3.1 Co potwierdziły testy prototypu v2 (2 testerów)

| Obserwacja | Wniosek dla MVP |
|---|---|
| Wybór faktury z kalendarza, oznaczenie jako opłaconej i powrót do kalendarza działały bez trudu u obu testerów. | Ścieżka „kalendarz → dzień → oznacz jako opłaconą” zostaje bez zmian. |
| Dodawanie zadania działało, ale **obaj testerzy nie wiedzieli, do czego służy „Dodaj kolejny termin”**. | Przeprojektować pole terminów (patrz 6.4). |
| Tester nie wiedział, co oznacza „Twoje zadania”. | Zmienić etykietę lub dodać wyjaśnienie (patrz 6.4, 9). **[PO TEŚCIE v3]** |
| Tester nie był pewny, czy legenda jest klikalna. | Legenda nie może wyglądać jak przyciski albo powinna stać się filtrem. **[DECYZJA]** |
| Tester dopytywał, do czego służy informacja o skrzynce w nagłówku. | Status skrzynki potrzebuje czytelnej etykiety, np. „Połączona skrzynka: …” (patrz 6.6). |
| Brak przechodzenia między miesiącami i przenoszenia zadań. | Dodane w v3 — wchodzi do MVP. |
| Brak przypomnień. | Kandydat na pierwszą funkcję po MVP lub do MVP — **[DECYZJA]** (patrz 10). |
| Przycisk „Pokaż maila” — testerzy go zauważyli. | Wchodzi do MVP jako podgląd oryginalnej wiadomości (patrz 6.2). |

### 3.2 Co sprawdzają testy prototypu v3

Założenia z `docs/plan-testu.md`: przeplanowanie zadania i przejście do innego miesiąca oraz to, czy miganie wpisów po terminie zwraca uwagę i nie przeszkadza. Wyniki należy dopisać tutaj przed zamknięciem specyfikacji. **[PO TEŚCIE v3]**

## 4. Zakres MVP

### W zakresie

1. Konto użytkownika i logowanie.
2. Podłączenie jednej prywatnej skrzynki pocztowej i automatyczne rozpoznawanie maili z fakturami.
3. Kalendarz miesięczny z fakturami i zadaniami, nawigacja między miesiącami, wyróżnienie wpisów po terminie.
4. Szczegóły dnia: oznaczanie faktury jako opłaconej, oznaczanie terminu zadania jako zrobionego, cofanie tych akcji.
5. Podgląd oryginalnego maila z fakturą.
6. Dodawanie zadania z jednym lub wieloma terminami (harmonogram).
7. Przeplanowanie pojedynczego terminu zadania, z możliwością cofnięcia.
8. Trwałe zapisywanie danych między sesjami.

### Poza zakresem MVP

- Wykonywanie płatności (przelew) — aplikacja tylko odnotowuje, że faktura jest opłacona.
- Wiele skrzynek pocztowych, współdzielenie kalendarza.
- Godzina zadania (zadania są całodniowe).
- Przeplanowanie faktury — **[DECYZJA]**, pytanie z briefu (patrz 10).
- Automatyczny import harmonogramu (np. ze strony gminy) — **[DECYZJA]**, pytanie z briefu (patrz 10).
- Zmiana nazwy i usuwanie zadań — **[DECYZJA]**: w prototypie poza zakresem, ale w produkcie z trwałym zapisem brak usuwania oznacza, że błędnie dodane zadanie zostaje na zawsze. Rekomendacja: dodać do MVP przynajmniej usuwanie zadania.
- Przypomnienia i powiadomienia — **[DECYZJA]** (patrz 10).

## 5. Model danych

Zalążek z briefu („Dane w prototypie”) uzupełniony o pola potrzebne do trwałego zapisu i integracji z pocztą.

### Użytkownik
| Pole | Typ | Uwagi |
|---|---|---|
| id | identyfikator | |
| email | tekst | login |
| strefa_czasowa | tekst | wyznacza „dzisiaj” i to, co jest po terminie |

### Skrzynka
| Pole | Typ | Uwagi |
|---|---|---|
| id | identyfikator | |
| uzytkownik_id | odwołanie | jedna skrzynka na użytkownika w MVP |
| adres | tekst | wyświetlany w nagłówku |
| dostawca_poczty | tekst | np. Gmail, Outlook, IMAP — **[DECYZJA]** |
| status | `połączona` / `błąd` / `odłączona` | |
| ostatnia_synchronizacja | data i czas | |

### Faktura
| Pole | Typ | Uwagi |
|---|---|---|
| id | identyfikator | |
| uzytkownik_id | odwołanie | |
| dostawca | tekst | nazwa wyświetlana na kalendarzu, np. „Gazovia” |
| email_nadawcy | tekst | „Od: …” w szczegółach dnia |
| opis | tekst | krótki opis, np. „Gaz – rozliczenie za wrzesień i październik 2026” — źródło **[DECYZJA]** |
| kwota | liczba (grosze) + waluta | w prototypie część opisu; w MVP osobne pole — **[DECYZJA]** czy wydzielać |
| termin_platnosci | data | dzień, w którym faktura pojawia się w kalendarzu |
| status | `do_oplacenia` / `oplacona` | |
| oplacona_kiedy | data i czas, opcjonalnie | potrzebne do licznika „Opłacone w tym miesiącu” i cofania |
| wiadomosc_id | identyfikator wiadomości w skrzynce | do „Pokaż maila” i do unikania duplikatów |

### Zadanie
| Pole | Typ | Uwagi |
|---|---|---|
| id | identyfikator | |
| uzytkownik_id | odwołanie | |
| nazwa | tekst, wymagany | |
| terminy | lista Terminów zadania | co najmniej jeden |

### Termin zadania
| Pole | Typ | Uwagi |
|---|---|---|
| id | identyfikator | |
| zadanie_id | odwołanie | |
| data | data | po przeplanowaniu — nowa data |
| status | `do_zrobienia` / `zrobione` | stan dotyczy jednego terminu, nie całego zadania |

Reguły:
- Jedno zadanie nie może mieć dwóch terminów w tym samym dniu.
- „Jednorazowe” zadanie to zadanie z jednym terminem; z kilkoma — „harmonogram”.
- Przeplanowanie zmienia datę jednego Terminu; pozostałe terminy zadania się nie zmieniają.

## 6. Ekrany i zachowanie

Wygląd zgodnie z `DESIGN.md` (ostre krawędzie, brak cieni, czerń jako kolor akcentowy, kolory tylko dla statusów). Teksty interfejsu poniżej pochodzą z prototypu v3.

### 6.1 Kalendarz miesięczny (ekran startowy)

- Domyślnie bieżący miesiąc. Nagłówek: nazwa miesiąca i rok, np. „Listopad 2026”.
- Tydzień zaczyna się w poniedziałek; weekendy i dzień dzisiejszy są wyróżnione.
- **Wpisy w dniu:**
  - faktura do opłacenia — nazwa dostawcy,
  - termin zadania do zrobienia — ikona zadania + nazwa; wizualnie odróżniony od faktury,
  - najwyżej 2 wpisy, potem „+N więcej”.
- Opłacone faktury i zrobione terminy zadań **nie są wyświetlane** w kalendarzu.
- **Po terminie:** wpis z datą wcześniejszą niż dzisiaj, nieopłacony / niezrobiony. Wyróżniony na czerwono; po każdym wyświetleniu kalendarza miga ok. 5 s (4 × 1,2 s), potem pozostaje czerwony. Przy systemowej opcji „ogranicz ruch” bez migania. Limit 5 s wynika z WCAG 2.2.2. **[PO TEŚCIE v3]**
- **Podsumowanie miesiąca** (pod nagłówkiem), elementy oddzielone „·”:
  - „Faktury do opłacenia: N” / „Faktury: wszystkie opłacone” / „Brak faktur z poczty”,
  - „Twoje zadania: N”,
  - „Po terminie: N” (na czerwono, tylko gdy N > 0),
  - „Opłacone w tym miesiącu: N” (tylko gdy N > 0).
- **Banery:**
  - wszystkie faktury miesiąca opłacone → „Wszystko opłacone. W tym miesiącu nie masz już faktur do zapłaty.”,
  - przyszły miesiąc bez faktur → „Faktury na ten miesiąc jeszcze nie przyszły. Pojawią się tu same, gdy dostaniesz je mailem.”
- **Akcje:** „Dodaj zadanie”, strzałki poprzedni / następny miesiąc, „Dzisiaj” (tylko gdy wyświetlany miesiąc nie jest bieżący).
- Kliknięcie dnia otwiera Szczegóły dnia (także dnia bez wpisów).
- Legenda: Dzisiaj · Faktura z poczty (termin płatności) · Twoje zadanie · Po terminie. Nie może wyglądać na klikalną (patrz 3.1).
- Każdy miesiąc ma własny adres (np. `/kalendarz/2026-12`), żeby działały „wstecz” i zakładki.

### 6.2 Szczegóły dnia

- Nagłówek: pełna data, np. „Czwartek, 12 listopada 2026”, podtytuł z liczbą faktur i zadań. Powrót: „Kalendarz: listopad 2026”.
- **Sekcja „Faktury do opłacenia”** — dla każdej faktury: dostawca, plakietka „Po terminie” (gdy dotyczy), opis, „Od: <e-mail nadawcy>”, przyciski:
  - „Oznacz jako opłaconą” — faktura znika z dnia i z kalendarza; komunikat „Faktura oznaczona jako opłacona.” z „Cofnij”,
  - „Pokaż maila” — otwiera podgląd oryginalnej wiadomości (w prototypie atrapa). Sposób podglądu **[DECYZJA]**: widok w aplikacji czy link do skrzynki.
- **Sekcja „Twoje zadania”** — dla każdego terminu: nazwa, plakietka „Twoje zadanie”, plakietka „Po terminie” (gdy dotyczy), opis harmonogramu („Jednorazowe” albo „Harmonogram: N terminów · następny: 21 grudnia”), przyciski:
  - „Oznacz jako zrobione” — znika tylko ten termin; komunikat „Zadanie oznaczone jako zrobione.” z „Cofnij”,
  - „Przeplanuj” — przejście do ekranu 6.5.
- „Dodaj zadanie na ten dzień” — formularz z podpowiedzianą datą.
- **Stany puste:**
  - wszystko załatwione → „Wszystko z tego dnia jest załatwione” + „Opłacone faktury i zrobione zadania nie znikły — po prostu nie musisz już o nich pamiętać.”,
  - nic nie było → „Nic zaplanowanego na ten dzień” + przyciski „Wróć do kalendarza” i „Dodaj zadanie na ten dzień”.
- Podczas zapisu przycisk pokazuje „Zapisywanie…”, a pozostałe akcje wiersza są zablokowane.

### 6.3 Cofanie akcji

- Po oznaczeniu faktury, oznaczeniu zadania lub przeplanowaniu pojawia się komunikat na dole ekranu z przyciskiem „Cofnij” (widoczny 7 s; komunikaty bez akcji — 4,5 s).
- Cofnąć można tylko ostatnią akcję. Po cofnięciu: „Przywrócono fakturę do opłacenia.” / „Przywrócono zadanie.” / „Przywrócono poprzedni termin zadania „…”: <data>.”
- **[DECYZJA]** Czy po zniknięciu komunikatu da się jeszcze cofnąć oznaczenie (np. z listy „Opłacone” albo z historii)? Prototyp tego nie przewiduje, a przy trwałym zapisie omyłkowe kliknięcie byłoby nieodwracalne. Rekomendacja: widok opłaconych faktur / zrobionych zadań miesiąca z możliwością przywrócenia, dostępny z licznika „Opłacone w tym miesiącu”.

### 6.4 Nowe zadanie

- Pola: „Nazwa zadania” (wymagana, placeholder „np. Wywóz śmieci”) i „Terminy” (co najmniej jeden).
- Kolejny termin dodaje się przyciskiem, każdy dodatkowy można usunąć.
- **Zmiana względem prototypu** (wniosek z testów v2): przycisk „Dodaj kolejny termin” nie był zrozumiały. Do rozważenia **[DECYZJA]**:
  - przemianować na „Dodaj kolejną datę z harmonogramu” i pokazywać podpowiedź tuż obok,
  - albo zastąpić pole wyborem kilku dni na mini-kalendarzu.
- Walidacja:
  - pusta nazwa → „Wpisz nazwę zadania.”,
  - brak poprawnej daty → „Wybierz co najmniej jeden termin.”,
  - zduplikowane daty są łączone w jedną, terminy sortowane rosnąco.
- **[DECYZJA]** Czy dopuszczać daty z przeszłości? Prototyp je dopuszcza (zadanie od razu jest „po terminie”), a przeplanowanie — nie.
- Po zapisie: przejście do miesiąca pierwszego terminu i komunikat „Dodano zadanie „<nazwa>”: N terminów (17 listopada, 21 grudnia, …).” Formularz nie zostaje w historii „wstecz”.

### 6.5 Przeplanuj zadanie

- Karta zadania: nazwa, „Obecny termin: …” (z plakietką „Po terminie”, gdy dotyczy), lista „Pozostałe terminy z harmonogramu się nie zmienią:”.
- Pole „Nowy termin” z podpowiedzią „Możesz wybrać dzień także w innym miesiącu.”; domyślnie obecny termin (puste, gdy obecny jest po terminie); nie można wybrać daty sprzed dzisiaj.
- Walidacja:
  - brak daty → „Wybierz nowy termin.”,
  - ta sama data → „Wybierz inny dzień niż obecny termin.”,
  - data z przeszłości → „Nowy termin nie może być wcześniejszy niż dzisiaj.”,
  - zadanie ma już termin w tym dniu → „To zadanie ma już termin w tym dniu.”
- Po zapisie: przejście do miesiąca z nowym terminem, komunikat „Przeniesiono „<nazwa>” na <data>.” z „Cofnij”.

### 6.6 Nagłówek aplikacji i skrzynka

- Nagłówek pokazuje adres połączonej skrzynki. Po testach v2 — z wyraźną etykietą (np. „Faktury zbieramy z: <adres>”) i stanem synchronizacji (połączona / błąd).
- Przy błędzie połączenia: komunikat z akcją „Połącz ponownie”.
- Ekran ustawień skrzynki (podłączenie, odłączenie) — nowy względem prototypu.

### 6.7 Logowanie i pierwsze uruchomienie

Nowe względem prototypu: rejestracja / logowanie, podłączenie skrzynki, pierwsze pobranie faktur. Metoda logowania i zakres pierwszego importu (np. maile z ostatnich N dni) — **[DECYZJA]**.

## 7. Integracja z pocztą

- Aplikacja okresowo pobiera nowe wiadomości z połączonej skrzynki i rozpoznaje maile z fakturami.
- Z każdej faktury wyciąga: dostawcę, e-mail nadawcy, krótki opis, kwotę, termin płatności.
- Jedna wiadomość = najwyżej jedna faktura (deduplikacja po `wiadomosc_id`).
- Faktury pojawiają się w kalendarzu dopiero po nadejściu maila — przyszłe miesiące są puste, dopóki faktury nie przyjdą (baner z 6.1).
- **[DECYZJA]** Pozostaje do ustalenia:
  - dostawcy poczty (Gmail API, Microsoft Graph, IMAP) i sposób autoryzacji (OAuth, hasło aplikacji),
  - jak rozpoznawać faktury (reguły, model językowy, odczyt załącznika PDF),
  - co, jeśli nie da się ustalić terminu płatności (np. data maila + 14 dni z oznaczeniem do sprawdzenia albo osobna lista „do uzupełnienia”),
  - czy użytkownik może poprawić rozpoznane dane albo odrzucić mail, który nie jest fakturą,
  - częstotliwość synchronizacji.
- Dane z poczty są danymi osobowymi: aplikacja pobiera tylko to, co potrzebne, umożliwia odłączenie skrzynki i usunięcie danych (RODO).

## 8. Wymagania niefunkcjonalne

- **Trwałość:** wszystkie zmiany (opłacenie, zrobienie, nowe zadanie, przeplanowanie, cofnięcie) zapisują się trwale; odświeżenie strony niczego nie resetuje.
- **Czas:** „dzisiaj” i „po terminie” liczone w strefie czasowej użytkownika.
- **Dostępność:** jak w prototypie — etykiety dni dla czytników ekranu (np. „12 listopada: 2 faktury do opłacenia, po terminie”), fokus na nagłówku po zmianie ekranu, komunikaty błędów powiązane z polami, respektowanie „ogranicz ruch”, kontrast zgodny z WCAG AA.
- **Bezpieczeństwo:** tokeny dostępu do poczty szyfrowane, połączenia wyłącznie HTTPS, dostęp tylko do własnych danych.
- **Język:** polski, z poprawną odmianą liczebników (1 faktura, 2 faktury, 5 faktur).
- **Technologia:** **[DECYZJA]** (aplikacja webowa — stos, hosting, baza danych).

## 9. Słownik pojęć w interfejsie

| Pojęcie | Znaczenie |
|---|---|
| Faktura z poczty | Faktura rozpoznana automatycznie w mailu; w kalendarzu w dniu terminu płatności. |
| Twoje zadanie | Coś, co użytkownik dodał sam. Testerzy v2 nie rozumieli tej etykiety — rozważyć „Moje sprawy” lub „Dodane przeze mnie”. **[PO TEŚCIE v3]** |
| Termin | Dzień, w którym zadanie ma być zrobione; zadanie może mieć ich wiele (harmonogram). |
| Po terminie | Nieopłacona faktura / niezrobione zadanie z datą sprzed dzisiaj. |
| Przeplanuj | Przeniesienie jednego terminu zadania na inny dzień. |

## 10. Pytania otwarte

Z briefu („Pytania do specyfikacji”):
1. Skąd pochodzi krótki opis faktury, np. z maila, i na jakiej podstawie powstaje? — decyduje autor.
2. Czy harmonogram da się wczytać automatycznie (np. ze strony gminy), czy zawsze wpisuje się go ręcznie?
3. Czy da się przeplanować także fakturę (np. odroczony termin płatności uzgodniony z dostawcą)?

Nowe, wynikające z przejścia z prototypu do MVP:

4. Przypomnienia (zgłoszone przez testera v2): czy wchodzą do MVP? Kanał (e-mail, powiadomienie w przeglądarce) i moment (np. 3 dni przed terminem, w dniu terminu).
5. Czy w MVP jest usuwanie i edycja zadań?
6. Gdzie można przywrócić opłaconą fakturę lub zrobione zadanie po zniknięciu komunikatu „Cofnij”?
7. Czy kwota ma być osobnym polem (np. do sumy „do zapłaty w tym miesiącu”)?
8. Którzy dostawcy poczty i jaka metoda logowania w MVP?
9. Jak przeprojektować dodawanie kolejnych terminów, żeby było zrozumiałe (patrz 6.4)?
10. Czy legenda kalendarza ma być filtrem (pokaż tylko faktury / tylko zadania)?

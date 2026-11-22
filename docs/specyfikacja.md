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
Konto w Supabase Auth (`auth.users`); dodatkowe pola w osobnej tabeli powiązanej z `auth.users.id`.

| Pole | Typ | Uwagi |
|---|---|---|
| id | identyfikator | = `auth.users.id` |
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

### 5.1 Baza danych (Supabase, zrobione)

Migracja: `supabase/migrations/20261122160151_schemat_kalendarza.sql`. Tabele w schemacie `public`: `skrzynki`, `faktury`, `zadania`, `terminy_zadan`. Statusy zapisane bez polskich znaków: `polaczona` / `blad` / `odlaczona`, `do_oplacenia` / `oplacona`, `do_zrobienia` / `zrobione`.

Różnice względem tabel powyżej:
- Każda tabela ma `uzytkownik_id` (domyślnie `auth.uid()`), także `terminy_zadan`, żeby reguła dostępu była prosta i szybka.
- Kwota jako `kwota_grosze` (opcjonalna) + `waluta` (domyślnie PLN). Pole można zostawić puste, dopóki decyzja o kwocie nie zapadnie.
- `zrobione_kiedy` w terminach zadań (analogicznie do `oplacona_kiedy`).
- Tabela z dodatkowymi polami użytkownika (np. `strefa_czasowa`) jeszcze nie istnieje.

Reguły pilnowane przez bazę:
- jedna skrzynka na użytkownika; jedna faktura na wiadomość (`uzytkownik_id`, `wiadomosc_id`),
- zadanie nie ma dwóch terminów w tym samym dniu; usunięcie zadania usuwa jego terminy,
- faktura może wskazywać tylko skrzynkę, a termin tylko zadanie tego samego użytkownika,
- `status = oplacona` ⇔ wypełnione `oplacona_kiedy`; `status = zrobione` ⇔ wypełnione `zrobione_kiedy`,
- nazwa zadania nie może być pusta.

Reguła „zadanie ma co najmniej jeden termin” jest pilnowana w aplikacji, nie w bazie.

Druga migracja (`20261122163009_skrzynka_imap_frazy.sql`) dodaje:
- w `skrzynki`: `imap_host`, `imap_port`, `imap_login`, `haslo_secret_id` (niedostępne dla przeglądarki), `folder`, `dni_na_platnosc`, `ostatni_blad`, `ostatnio_nowych`; nowy status `niesprawdzona`; usunięcie skrzynki usuwa hasło z Vault;
- tabelę `frazy` (`fraza`, unikalna dla użytkownika bez względu na wielkość liter) z RLS: odczyt, dodawanie, usuwanie tylko własnych;
- funkcję `zapisz_skrzynke(...)` — jedyny sposób zapisu skrzynki i hasła przez użytkownika;
- harmonogram `pobierz-faktury-co-15-min` (pg_cron + pg_net).

**Dostęp (Row Level Security)** — zalogowany użytkownik widzi i zmienia wyłącznie wiersze ze swoim `uzytkownik_id`; użytkownik niezalogowany (`anon`) nie ma dostępu do żadnej tabeli.

| Tabela | Użytkownik może |
|---|---|
| `skrzynki` | odczytać (bez `haslo_secret_id`), usunąć (odłączyć); dodać i zmienić tylko przez `zapisz_skrzynke` |
| `frazy` | odczytać, dodać, usunąć |
| `faktury` | odczytać, zmienić tylko `status` i `oplacona_kiedy` |
| `zadania` | odczytać, dodać, zmienić `nazwa`, usunąć |
| `terminy_zadan` | odczytać, dodać, zmienić `data`, `status`, `zrobione_kiedy`, usunąć |

Skrzynki i faktury dodaje serwer synchronizujący pocztę (klucz `service_role`, który omija RLS — nigdy w przeglądarce). Tokenów dostępu do poczty nie przechowujemy w tych tabelach — miejsce ich przechowywania **[DECYZJA]** razem z integracją pocztową (sekcja 7).

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

**Zrobione (`app/`, ekran `#skrzynka`):**
- Nagłówek: link do ustawień skrzynki — „Skonfiguruj skrzynkę” (brak skrzynki), adres skrzynki na zielono (działa) albo „Błąd skrzynki” na czerwono; podpowiedź „Faktury zbieramy z tej skrzynki — kliknij, aby zmienić ustawienia”.
- Kalendarz pokazuje baner: brak skrzynki → „Skonfiguruj skrzynkę pocztową…”; błąd → „Nie udało się sprawdzić skrzynki.” + treść błędu; brak fraz → „Dodaj frazy…”.
- Ekran „Skrzynka pocztowa”:
  - stan: adres, status (jeszcze nie sprawdzona / połączona / błąd połączenia), ostatnie sprawdzenie, liczba nowych faktur, treść błędu, przycisk „Sprawdź pocztę teraz”;
  - **frazy w tytule maila**: lista z usuwaniem, pole „Nowa fraza” + „Dodaj frazę”, podpowiedzi (faktura, rachunek, do zapłaty, e-faktura). Fraza 2–100 znaków, bez duplikatów (bez względu na wielkość liter);
  - **połączenie IMAP**: wybór poczty (Gmail, Outlook / Hotmail, WP, Onet, Interia, o2, iCloud, Inny — wypełnia serwer i port), adres skrzynki, serwer IMAP, port, login (domyślnie = adres), hasło aplikacji (z podpowiedzią dla danej poczty; przy edycji puste = bez zmiany), folder (INBOX), dni na zapłatę (0–120, domyślnie 14);
  - „Połącz i sprawdź pocztę” / „Zapisz i sprawdź pocztę” — zapisuje i od razu sprawdza skrzynkę;
  - „Odłącz skrzynkę” (z potwierdzeniem) — usuwa skrzynkę i hasło; pobrane faktury zostają.
- Przycisk „Pokaż maila” z prototypu nie jest jeszcze zrobiony.

### 6.7 Logowanie i pierwsze uruchomienie

Nowe względem prototypu: logowanie, podłączenie skrzynki, pierwsze pobranie faktur.

**Logowanie (zrobione, `app/`):**
- Supabase Auth, adres e-mail + hasło.
- Brak rejestracji w aplikacji: konta zakłada administrator w panelu Supabase (Authentication → Users → Add user, z zaznaczonym „Auto Confirm User”). Publiczna rejestracja jest wyłączona w ustawieniach Auth.
- Ekran „Zaloguj się”: pola „Adres e-mail” i „Hasło” (z „Pokaż hasło”), przycisk „Zaloguj się” (podczas wysyłania „Logowanie…”).
- Walidacja: „Wpisz adres e-mail.”, „Wpisz poprawny adres e-mail, np. imie@domena.pl.”, „Wpisz hasło.”
- Błędy logowania: „Nieprawidłowy e-mail lub hasło.”, „Ten adres e-mail nie jest jeszcze potwierdzony.”, „Zbyt wiele prób logowania. Odczekaj chwilę i spróbuj ponownie.”, „Nie udało się połączyć z serwerem. Sprawdź połączenie z internetem i spróbuj ponownie.”
- Sesja jest zapamiętywana w przeglądarce; w nagłówku adres e-mail i „Wyloguj się”.
- Odzyskiwanie hasła — poza obecnym zakresem; hasło zmienia administrator w panelu Supabase.

Pierwszy import: maile z ostatnich 30 dni (patrz 7).

## 7. Integracja z pocztą

**Decyzje (2026-11-22):** IMAP z hasłem aplikacji; faktura = mail, którego **tytuł** zawiera frazę użytkownika; termin płatności szukany w treści, a gdy go nie ma — data maila + N dni; sprawdzanie automatyczne co 15 minut i przyciskiem.

**Jak to działa (zrobione):**
- Edge Function `pobierz-faktury` (`supabase/functions/pobierz-faktury/`), biblioteki `imapflow` (IMAP) i `postal-mime` (treść maila).
- Wywołanie z aplikacji („Sprawdź pocztę teraz”, token użytkownika) → tylko skrzynka tego użytkownika; z harmonogramu `pg_cron` co 15 min (nagłówek `x-cron-sekret` porównywany z sekretem w Vault) → wszystkie skrzynki.
- Hasło IMAP przechowywane zaszyfrowane w Supabase Vault; zapisuje je tylko funkcja `zapisz_skrzynke` (dla skrzynki zalogowanego użytkownika). Przeglądarka nie może odczytać ani hasła, ani identyfikatora sekretu.
- Zakres maili: pierwsze sprawdzenie — ostatnie 30 dni; kolejne — od ostatniej synchronizacji minus 2 dni. Najwyżej 40 nowych faktur na jedno sprawdzenie (reszta przy następnym).
- **Dopasowanie:** tytuł zawiera co najmniej jedną frazę; bez względu na wielkość liter i polskie znaki („faktura” pasuje do „FAKTURA”, „do zapłaty” do „Do zaplaty”).
- **Dane faktury:**
  - dostawca — nazwa nadawcy maila; gdy jej brak, domena adresu (faktury@gazovia.pl → „Gazovia”);
  - e-mail nadawcy — adres nadawcy; opis — tytuł maila;
  - termin płatności — data po słowach „termin płatności”, „termin zapłaty”, „płatne do”, „zapłać do”, „wpłać do” itp. (formaty 15.12.2026, 15-12-2026, 15/12/2026, 2026-12-15, 15 grudnia 2026), tylko w zakresie od 31 dni przed do 365 dni po dacie maila; gdy brak — data maila (strefa Europe/Warsaw) + „dni na zapłatę”;
  - kwota — liczba z „zł”/„PLN” po słowach „do zapłaty”, „kwota”, „razem”, „brutto” itp.; gdy brak — pole puste.
- Jedna wiadomość = najwyżej jedna faktura (`wiadomosc_id` = Message-ID maila).
- Po sprawdzeniu skrzynka ma status `polaczona` albo `blad` z komunikatem po polsku (złe hasło, nieznany serwer, brak odpowiedzi, brak folderu, brak fraz).
- Faktury pojawiają się w kalendarzu dopiero po nadejściu maila — przyszłe miesiące są puste, dopóki faktury nie przyjdą (baner z 6.1).

**Nadal otwarte — [DECYZJA]:**
- odczyt załączników PDF (dziś czytana jest tylko treść maila),
- poprawianie rozpoznanych danych (termin, kwota, dostawca) i odrzucanie maila, który nie jest fakturą,
- oznaczenie faktur, w których termin nie został znaleziony w treści (dziś nie są wyróżnione).

Dane z poczty są danymi osobowymi: aplikacja pobiera tylko maile pasujące do fraz, umożliwia odłączenie skrzynki (usuwa hasło) i usunięcie danych (RODO).

## 8. Wymagania niefunkcjonalne

- **Trwałość:** wszystkie zmiany (opłacenie, zrobienie, nowe zadanie, przeplanowanie, cofnięcie) zapisują się trwale; odświeżenie strony niczego nie resetuje.
- **Czas:** „dzisiaj” i „po terminie” liczone w strefie czasowej użytkownika.
- **Dostępność:** jak w prototypie — etykiety dni dla czytników ekranu (np. „12 listopada: 2 faktury do opłacenia, po terminie”), fokus na nagłówku po zmianie ekranu, komunikaty błędów powiązane z polami, respektowanie „ogranicz ruch”, kontrast zgodny z WCAG AA.
- **Bezpieczeństwo:** tokeny dostępu do poczty szyfrowane, połączenia wyłącznie HTTPS, dostęp tylko do własnych danych.
- **Język:** polski, z poprawną odmianą liczebników (1 faktura, 2 faktury, 5 faktur).
- **Technologia:** backend, baza danych i logowanie — Supabase (projekt „Kreator”, region eu-central-1). Frontend na razie jako statyczna strona HTML/JS z biblioteką `@supabase/supabase-js` (`app/`, lokalnie uruchamiana przez `serwer.ps1`). Framework frontendu i hosting — **[DECYZJA]**.

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

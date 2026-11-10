# Plan testu: Kalendarz faktur z poczty — prototyp v2

_Wersja 2: dodane zadania wpisywane ręcznie, z harmonogramem terminów (zadania 5–7 i dwa nowe założenia)._

Prototyp: `prototyp/index.html` (otwórz dwukrotnym kliknięciem). Mapa ekranów i scenariuszy dla moderatora: dopisz `#mapa` na końcu adresu w przeglądarce.

Testujemy na komputerze (laptop lub monitor), 3–5 osób z grupy docelowej: osoby pracujące zdalnie, które dostają faktury na prywatną skrzynkę.

## 1. Założenia i jak je sprawdzamy

| Założenie | Scenariusz / ekran, który je sprawdza | Co uznajemy za potwierdzenie |
|---|---|---|
| Tester bez podpowiedzi znajdzie faktury na wybrany dzień i oznaczy jedną jako opłaconą (z briefu) | Zadanie 1 · Kalendarz → Szczegóły dnia | Co najmniej 2 z 3 testerów samodzielnie oznaczają fakturę i nie pytają, co dalej. **Nie potwierdzi się**, jeśli co najmniej 2 z 3 nie znajdą, gdzie oznaczyć fakturę, albo zapytają, co dalej. |
| Plik HTML pokaże całą ścieżkę na fikcyjnych fakturach, a opłacona faktura zniknie z danego dnia (z briefu, założenie technologiczne) | Zadanie 1 · Kalendarz po opłaceniu | U każdego testera opłacona faktura znika z dnia i nie wraca po przejściu między ekranami (także przyciskiem „wstecz” przeglądarki). |
| Tester bez instrukcji zrozumie, że oznaczenia w kalendarzu to faktury do zapłaty w danym dniu (propozycja) | Zadanie 2 · Kalendarz | Tester trafia w dzień z fakturą za prąd bez klikania na chybił trafił (najwyżej 1 błędne kliknięcie) i potrafi powiedzieć, co oznaczają wpisy w kalendarzu. |
| Po oznaczeniu tester ma pewność, że faktura jest opłacona, a nie usunięta lub zgubiona (propozycja) | Zadanie 1 (koniec) + pytanie po teście nr 2 | Tester sam mówi, że faktura jest „opłacona / załatwiona”; nie wyraża obawy, że ją skasował. |
| Tester bez podpowiedzi doda własne zadanie z kilkoma terminami z harmonogramu (wersja 2, z briefu) | Zadanie 5 · Kalendarz → Nowe zadanie | Co najmniej 2 z 3 testerów samodzielnie zapisują zadanie ze wszystkimi trzema terminami. **Nie potwierdzi się**, jeśli co najmniej 2 z 3 nie znajdą, jak dodać zadanie lub kolejny termin (np. dodają trzy osobne zadania albo wpisują daty w nazwie). |
| Tester odróżni w kalendarzu swoje zadania od faktur z poczty (wersja 2, z briefu) | Zadanie 6 · Kalendarz → Szczegóły dnia 13 listopada | Tester bez wahania mówi, że 13 listopada ma coś do zrobienia, a nie do zapłacenia. **Nie potwierdzi się**, jeśli co najmniej 2 z 3 pomylą zadanie z fakturą. |

## 2. Zadania dla testera

Przeczytaj testerowi wprowadzenie, a potem po kolei zadania. Nie pokazuj mu ekranu `#mapa`.

> **Wprowadzenie:** Wyobraź sobie, że pracujesz z domu. Ta aplikacja sama przegląda Twoją prywatną skrzynkę i zbiera z niej faktury. Dziś jest 10 listopada. Mów na głos, co myślisz, gdy z niej korzystasz. Testujemy aplikację, nie Ciebie — nie da się tu niczego zepsuć.

1. **Zapłaciłeś(-aś) właśnie przelewem rachunek za prąd i wodę, które masz zapłacić 12 listopada. Odnotuj to w aplikacji.**
   _Czego szukamy:_ czy znajdzie dzień 12, czy znajdzie, jak odhaczyć fakturę, czy po powrocie zauważy, że dzień jest pusty.
2. **Sprawdź, ile masz zapłacić za gaz w tym miesiącu i kto Ci przysłał tę fakturę.**
   _Czego szukamy:_ czy rozumie wpisy w kalendarzu i trafia od razu w 16 listopada.
3. **Sprawdź, czy masz coś do zapłacenia 18 listopada.**
   _Czego szukamy:_ czy stan pusty („Nic zaplanowanego na ten dzień”) jest zrozumiały i czy tester bez trudu wraca do kalendarza.
4. **Czy jest coś, czym powinieneś (powinnaś) zająć się od razu?**
   _Czego szukamy:_ czy zauważy faktury oznaczone „Po terminie” (5 i 8 listopada).
5. **Dostałeś(-aś) od gminy harmonogram wywozu śmieci: 17 listopada, 21 grudnia i 19 stycznia. Zapisz go w aplikacji, żeby nie musieć o nim pamiętać.**
   _Czego szukamy:_ czy znajdzie, jak dodać zadanie, czy doda wszystkie trzy terminy w jednym zadaniu, jak zareaguje na komunikat błędu (jeśli go zobaczy) i czy po zapisaniu zauważy wywóz 17 listopada w kalendarzu.
6. **Co masz zaplanowane na 13 listopada? Czy musisz wtedy coś zapłacić?**
   _Czego szukamy:_ czy odróżnia zadanie („Odczyt licznika gazu”) od faktury.
7. **Jest 17 listopada, śmieci zostały odebrane. Odnotuj to.**
   _Czego szukamy:_ czy znajdzie „Oznacz jako zrobione” i czy rozumie, że pozostałe terminy z harmonogramu zostają w aplikacji.

## 3. Pytania po teście

1. Jak własnymi słowami opisałbyś(-abyś), do czego służy ta aplikacja?
2. Co według Ciebie stało się z fakturą, którą oznaczyłeś(-aś) jako opłaconą? Gdzie byś jej szukał(a)?
3. Co Cię zaskoczyło albo przez chwilę nie było jasne?
4. Czego Ci brakowało?
5. Czy korzystałbyś(-abyś) z takiej aplikacji? W jakiej sytuacji?
6. Co jeszcze, poza fakturami i wywozem śmieci, chciałbyś(-abyś) mieć w tym kalendarzu? Czy to nadal „kalendarz faktur”?

## 4. Jak prowadzić test

- **Przed każdym testerem odśwież stronę (F5)** i wróć na kalendarz — to przywraca wszystkie faktury i zadania do stanu początkowego (dodane zadania znikają).
- Zadania wykonuj w podanej kolejności: zadanie 7 wymaga, żeby tester najpierw zapisał harmonogram w zadaniu 5.
- Moderator nie podpowiada i nie tłumaczy interfejsu. Jeśli tester pyta „co mam teraz zrobić?”, odpowiedz: „A jak myślisz?” — i zanotuj to pytanie.
- Notuj, gdzie tester się zawahał, gdzie kliknął w złe miejsce i co powiedział na głos (dosłownie).
- **Uwagi o treściach przykładowych** (dostawcy, kwoty, opisy faktur) notuj osobno od uwag o obsłudze aplikacji — treści są wymyślone i zmienią się w MVP.
- Przyciski spoza zakresu (zmiana miesiąca, „Pokaż maila”) pokazują komunikat „Ta funkcja nie jest częścią prototypu”. Zanotuj, czy tester ich szukał — to sygnał, że są mu potrzebne.

### Arkusz notatek (na każdego testera)

| Zadanie | Wykonane samodzielnie? (tak / z trudem / nie) | Gdzie się zawahał | Cytaty | Uwagi o treściach |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |

## 5. Poza zakresem prototypu

- **Odczytywanie prawdziwej skrzynki pocztowej** — prototyp pokazuje gotowe, fikcyjne faktury (brief).
- **Logowanie i zapisywanie danych między sesjami** — odświeżenie strony to reset (brief).
- **Sama płatność (przelew)** — aplikacja tylko odnotowuje, że faktura jest opłacona.
- **Podgląd oryginalnego maila i przełączanie miesięcy** — przyciski są widoczne, ale pokazują komunikat „Ta funkcja nie jest częścią prototypu”.
- **Powiadomienia o zbliżającym się terminie płatności i zadania.**
- **Edycja i usuwanie zadań oraz godzina zadania** — zadanie można tylko dodać i oznaczyć jako zrobione.
- **Terminy zadań w innych miesiącach** są zapisywane, ale widać tylko listopad (przełączanie miesięcy jest poza zakresem).

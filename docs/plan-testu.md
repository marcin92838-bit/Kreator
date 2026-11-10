# Plan testu: Kalendarz faktur z poczty — prototyp v1

Prototyp: `prototyp/index.html` (otwórz dwukrotnym kliknięciem). Mapa ekranów i scenariuszy dla moderatora: dopisz `#mapa` na końcu adresu w przeglądarce.

Testujemy na komputerze (laptop lub monitor), 3–5 osób z grupy docelowej: osoby pracujące zdalnie, które dostają faktury na prywatną skrzynkę.

## 1. Założenia i jak je sprawdzamy

| Założenie | Scenariusz / ekran, który je sprawdza | Co uznajemy za potwierdzenie |
|---|---|---|
| Tester bez podpowiedzi znajdzie faktury na wybrany dzień i oznaczy jedną jako opłaconą (z briefu) | Zadanie 1 · Kalendarz → Szczegóły dnia | Co najmniej 2 z 3 testerów samodzielnie oznaczają fakturę i nie pytają, co dalej. **Nie potwierdzi się**, jeśli co najmniej 2 z 3 nie znajdą, gdzie oznaczyć fakturę, albo zapytają, co dalej. |
| Plik HTML pokaże całą ścieżkę na fikcyjnych fakturach, a opłacona faktura zniknie z danego dnia (z briefu, założenie technologiczne) | Zadanie 1 · Kalendarz po opłaceniu | U każdego testera opłacona faktura znika z dnia i nie wraca po przejściu między ekranami (także przyciskiem „wstecz” przeglądarki). |
| Tester bez instrukcji zrozumie, że oznaczenia w kalendarzu to faktury do zapłaty w danym dniu (propozycja) | Zadanie 2 · Kalendarz | Tester trafia w dzień z fakturą za prąd bez klikania na chybił trafił (najwyżej 1 błędne kliknięcie) i potrafi powiedzieć, co oznaczają wpisy w kalendarzu. |
| Po oznaczeniu tester ma pewność, że faktura jest opłacona, a nie usunięta lub zgubiona (propozycja) | Zadanie 1 (koniec) + pytanie po teście nr 2 | Tester sam mówi, że faktura jest „opłacona / załatwiona”; nie wyraża obawy, że ją skasował. |

## 2. Zadania dla testera

Przeczytaj testerowi wprowadzenie, a potem po kolei zadania. Nie pokazuj mu ekranu `#mapa`.

> **Wprowadzenie:** Wyobraź sobie, że pracujesz z domu. Ta aplikacja sama przegląda Twoją prywatną skrzynkę i zbiera z niej faktury. Dziś jest 10 listopada. Mów na głos, co myślisz, gdy z niej korzystasz. Testujemy aplikację, nie Ciebie — nie da się tu niczego zepsuć.

1. **Zapłaciłeś(-aś) właśnie przelewem rachunek za prąd i wodę, które masz zapłacić 12 listopada. Odnotuj to w aplikacji.**
   _Czego szukamy:_ czy znajdzie dzień 12, czy znajdzie, jak odhaczyć fakturę, czy po powrocie zauważy, że dzień jest pusty.
2. **Sprawdź, ile masz zapłacić za gaz w tym miesiącu i kto Ci przysłał tę fakturę.**
   _Czego szukamy:_ czy rozumie wpisy w kalendarzu i trafia od razu w 16 listopada.
3. **Sprawdź, czy masz coś do zapłacenia 18 listopada.**
   _Czego szukamy:_ czy stan pusty („Brak faktur do opłacenia w tym dniu”) jest zrozumiały i czy tester bez trudu wraca do kalendarza.
4. **Czy jest coś, czym powinieneś (powinnaś) zająć się od razu?**
   _Czego szukamy:_ czy zauważy faktury oznaczone „Po terminie” (5 i 8 listopada).

## 3. Pytania po teście

1. Jak własnymi słowami opisałbyś(-abyś), do czego służy ta aplikacja?
2. Co według Ciebie stało się z fakturą, którą oznaczyłeś(-aś) jako opłaconą? Gdzie byś jej szukał(a)?
3. Co Cię zaskoczyło albo przez chwilę nie było jasne?
4. Czego Ci brakowało?
5. Czy korzystałbyś(-abyś) z takiej aplikacji? W jakiej sytuacji?

## 4. Jak prowadzić test

- **Przed każdym testerem odśwież stronę (F5)** i wróć na kalendarz — to przywraca wszystkie faktury do stanu początkowego.
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

## 5. Poza zakresem prototypu

- **Odczytywanie prawdziwej skrzynki pocztowej** — prototyp pokazuje gotowe, fikcyjne faktury (brief).
- **Logowanie i zapisywanie danych między sesjami** — odświeżenie strony to reset (brief).
- **Sama płatność (przelew)** — aplikacja tylko odnotowuje, że faktura jest opłacona.
- **Podgląd oryginalnego maila i przełączanie miesięcy** — przyciski są widoczne, ale pokazują komunikat „Ta funkcja nie jest częścią prototypu”.
- **Powiadomienia o zbliżającym się terminie płatności.**

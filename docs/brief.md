# Brief prototypu: Kalendarz zadań

_Wersja 3. Wcześniej „Kalendarz faktur z poczty”; nazwa zmieniona, bo kalendarz pokazuje także zadania dodawane ręcznie._

## 1. Problem
Osoba pracująca zdalnie dostaje na prywatną skrzynkę maile z fakturami od różnych dostawców: za telefon, internet, gaz, prąd. Niedawno przeoczyła mail od dostawcy internetu z fakturą do opłacenia, a potem także kolejny mail z monitem o zapłatę. Dostawca odciął internet i osoba musiała zadzwonić do niego, żeby wyjaśnić sytuację.

## 2. Użytkownik
Osoba pracująca zdalnie przy komputerze, zajęta na co dzień pracą zawodową. W trakcie pracy dostaje na komputerze powiadomienie o nowym mailu na prywatnej skrzynce, np. z fakturą do opłacenia.

## 3. Wartość
Osoba nie musi bez przerwy monitorować skrzynki w poszukiwaniu maili z fakturami ani pamiętać o domowych obowiązkach. Wszystkie faktury do zapłacenia i własne zadania widzi zebrane w jednym miejscu, w kalendarzu.

## 4. Zakres
Prototyp pokazuje jedną ścieżkę osoby pracującej zdalnie na komputerze.

**Ekran 1 · Kalendarz miesięczny:** w różnych dniach miesiąca widać faktury, które przyszły mailem i przy których nie podjęto jeszcze żadnej akcji, oraz zadania dodane ręcznie. Strzałkami można przejść do poprzedniego i następnego miesiąca, a przyciskiem „Dzisiaj” wrócić do bieżącego. Faktury i zadania po terminie migają przez kilka sekund po wyświetleniu kalendarza, a potem pozostają wyróżnione na czerwono. Użytkownik klika wybrany dzień.
**Ekran 2 · Szczegóły dnia:** faktury do opłacenia w tym dniu; przy każdej adres e-mail nadawcy, krótki opis i możliwość zaznaczenia, że faktura jest opłacona. Pod nimi zadania z tego dnia.
**Ekran 3 · Kalendarz po opłaceniu:** ten sam kalendarz miesięczny; opłacone faktury nie wyświetlają się już w danym dniu.

**Ekran 4 · Dodawanie zadania (wersja 2):** niezależnie od skrzynki pocztowej użytkownik sam dodaje do kalendarza zadanie, o którym nie chce pamiętać, np. odbiór śmieci. Zadanie może być cykliczne, ale według harmonogramu, a nie w stały dzień miesiąca (np. odbiór śmieci 17 listopada, 21 grudnia). Dlatego jedno zadanie ma nazwę i jeden lub więcej terminów. Zadania są widoczne w kalendarzu obok faktur, ale da się je od nich odróżnić. Zadanie z danego dnia można oznaczyć jako zrobione: znika wtedy z kalendarza i można je przywrócić.

**Ekran 5 · Przeplanowanie zadania (wersja 3):** termin zadania można przenieść na inny dzień, także w innym miesiącu. Przenosi się tylko wybrany termin; pozostałe terminy z harmonogramu się nie zmieniają. Przeniesienie można cofnąć.

**Dane w prototypie:** faktura: adres e-mail nadawcy, krótki opis, termin płatności. Fikcyjne faktury mają te same pola; adresy e-mail też są fikcyjne. Faktury są tylko na bieżący miesiąc, bo te na kolejne jeszcze nie przyszły mailem. Zadanie: nazwa, lista terminów (w dowolnych miesiącach).

**Poza prototypem:** odczytywanie prawdziwej skrzynki pocztowej (prototyp pokazuje gotowe, fikcyjne faktury), logowanie, zapisywanie danych między sesjami, zmiana nazwy i usuwanie zadań, godzina zadania, przypomnienia i powiadomienia, przeplanowanie faktur.

## 5. Co testujemy
**Założenie o użyteczności:** tester bez podpowiedzi znajdzie faktury na wybrany dzień i oznaczy jedną jako opłaconą. Nie potwierdzi się, jeśli co najmniej dwóch z trzech testerów nie znajdzie, gdzie oznaczyć fakturę, albo zapyta, co dalej.
**Założenie o technologii:** plik HTML pokaże całą ścieżkę na fikcyjnych fakturach, a opłacona faktura zniknie z danego dnia. Nie potwierdzi się, jeśli po zaznaczeniu faktura nadal będzie widoczna albo wróci po przejściu między ekranami.

**Założenie o użyteczności (wersja 2):** tester bez podpowiedzi doda własne zadanie z kilkoma terminami z harmonogramu i odróżni w kalendarzu swoje zadania od faktur z poczty. Nie potwierdzi się, jeśli co najmniej dwóch z trzech testerów nie znajdzie, jak dodać zadanie lub kolejny termin, albo pomyli zadanie z fakturą.

**Założenia o użyteczności (wersja 3):**
- Tester bez podpowiedzi przeplanuje zadanie na inny dzień i sprawdzi je w innym miesiącu. Nie potwierdzi się, jeśli co najmniej dwóch z trzech testerów nie znajdzie, jak zmienić termin, albo nie przejdzie do innego miesiąca.
- Migające wpisy po terminie zwracają uwagę: tester po otwarciu kalendarza jako pierwsze zauważa zaległe faktury i zadania. Nie potwierdzi się, jeśli co najmniej dwóch z trzech testerów ich nie zauważy albo uzna miganie za przeszkadzające.

## Pytania do specyfikacji
_Nie dotyczą prototypu. Agent budujący prototyp ich nie rozstrzyga._
- Skąd pochodzi krótki opis faktury, np. z maila, i na jakiej podstawie powstaje? → decyduję ja
- Czy harmonogram da się wczytać automatycznie (np. ze strony gminy), czy zawsze wpisuje się go ręcznie?
- Czy da się przeplanować także fakturę (np. odroczony termin płatności uzgodniony z dostawcą)?

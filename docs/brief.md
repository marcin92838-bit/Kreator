# Brief prototypu: Kalendarz faktur z poczty

## 1. Problem
Osoba pracująca zdalnie dostaje na prywatną skrzynkę maile z fakturami od różnych dostawców: za telefon, internet, gaz, prąd. Niedawno przeoczyła mail od dostawcy internetu z fakturą do opłacenia, a potem także kolejny mail z monitem o zapłatę. Dostawca odciął internet i osoba musiała zadzwonić do niego, żeby wyjaśnić sytuację.

## 2. Użytkownik
Osoba pracująca zdalnie przy komputerze, zajęta na co dzień pracą zawodową. W trakcie pracy dostaje na komputerze powiadomienie o nowym mailu na prywatnej skrzynce, np. z fakturą do opłacenia.

## 3. Wartość
Osoba nie musi bez przerwy monitorować skrzynki w poszukiwaniu maili z fakturami. Wszystkie faktury i rachunki do zapłacenia widzi zebrane w jednym miejscu, w kalendarzu.

## 4. Zakres
Prototyp pokazuje jedną ścieżkę osoby pracującej zdalnie na komputerze.

**Ekran 1 · Kalendarz miesięczny:** w różnych dniach miesiąca widać faktury, które przyszły mailem i przy których nie podjęto jeszcze żadnej akcji. Użytkownik klika wybrany dzień.
**Ekran 2 · Szczegóły dnia:** faktury do opłacenia w tym dniu; przy każdej adres e-mail nadawcy, krótki opis i możliwość zaznaczenia, że faktura jest opłacona.
**Ekran 3 · Kalendarz po opłaceniu:** ten sam kalendarz miesięczny; opłacone faktury nie wyświetlają się już w danym dniu.

**Dane w prototypie:** faktura: adres e-mail nadawcy, krótki opis, dzień w kalendarzu. Fikcyjne faktury mają te same pola; adresy e-mail też są fikcyjne.

**Poza prototypem:** odczytywanie prawdziwej skrzynki pocztowej (prototyp pokazuje gotowe, fikcyjne faktury), logowanie, zapisywanie danych między sesjami.

## 5. Co testujemy
**Założenie o użyteczności:** tester bez podpowiedzi znajdzie faktury na wybrany dzień i oznaczy jedną jako opłaconą. Nie potwierdzi się, jeśli co najmniej dwóch z trzech testerów nie znajdzie, gdzie oznaczyć fakturę, albo zapyta, co dalej.
**Założenie o technologii:** plik HTML pokaże całą ścieżkę na fikcyjnych fakturach, a opłacona faktura zniknie z danego dnia. Nie potwierdzi się, jeśli po zaznaczeniu faktura nadal będzie widoczna albo wróci po przejściu między ekranami.

## Pytania do specyfikacji
_Nie dotyczą prototypu. Agent budujący prototyp ich nie rozstrzyga._
- Skąd pochodzi krótki opis faktury, np. z maila, i na jakiej podstawie powstaje? → decyduję ja

// Rozpoznawanie danych faktury z maila. Czysty JavaScript bez zależności —
// używany przez Edge Function; można go też zaimportować w przeglądarce jako moduł ES, żeby przetestować.

const MIESIACE = {
  stycznia: 1, lutego: 2, marca: 3, kwietnia: 4, maja: 5, czerwca: 6,
  lipca: 7, sierpnia: 8, wrzesnia: 9, pazdziernika: 10, listopada: 11, grudnia: 12,
};

/** Małe litery bez polskich znaków — do porównywania fraz i słów kluczowych. */
export function normalizuj(tekst) {
  return String(tekst || '')
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Czy tytuł maila zawiera którąkolwiek z fraz użytkownika (bez względu na wielkość liter i polskie znaki). */
export function pasujeDoFraz(tytul, frazy) {
  const t = normalizuj(tytul);
  return frazy.some(f => {
    const n = normalizuj(f);
    return n.length > 0 && t.includes(n);
  });
}

/** Tekst z HTML (gdy mail nie ma wersji tekstowej). */
export function tekstZHtml(html) {
  return String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>|<\/(p|div|tr|li|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

const pad = n => String(n).padStart(2, '0');
const iso = (r, m, d) => `${r}-${pad(m)}-${pad(d)}`;

function poprawnaData(r, m, d) {
  if (m < 1 || m > 12 || d < 1) return false;
  return d <= new Date(Date.UTC(r, m, 0)).getUTCDate();
}

/** Data jako RRRR-MM-DD w strefie Europe/Warsaw. */
export function dataWarszawa(data) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(data);
}

export function dodajDni(isoData, dni) {
  const [r, m, d] = isoData.split('-').map(Number);
  const dt = new Date(Date.UTC(r, m - 1, d + dni));
  return iso(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

const SLOWA_TERMINU = [
  'termin platnosci', 'termin zaplaty', 'data platnosci', 'platne do', 'platnosc do', 'platny do',
  'zaplac do', 'zaplacic do', 'oplac do', 'wplac do', 'do zaplaty do', 'nalezy zaplacic do',
  'nalezy oplacic do', 'prosimy o wplate do', 'prosimy o zaplate do', 'termin wplaty', 'zaplata do',
];

// Daty po słowie kluczowym (do 60 znaków dalej): 15.12.2026, 15-12-2026, 15/12/2026, 2026-12-15, 15 grudnia 2026
const WZOR_DATY = /(\d{4})-(\d{1,2})-(\d{1,2})|(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})|(\d{1,2}) ([a-z]+) (\d{4})/;

/**
 * Szuka terminu płatności w treści. Zwraca RRRR-MM-DD albo null.
 * Akceptuje tylko daty w rozsądnym zakresie względem daty maila (od 31 dni przed do 365 dni po).
 */
export function znajdzTermin(tekst, dataMailaIso) {
  const t = normalizuj(tekst);
  for (const slowo of SLOWA_TERMINU) {
    let od = 0;
    let poz;
    while ((poz = t.indexOf(slowo, od)) !== -1) {
      od = poz + slowo.length;
      const fragment = t.slice(od, od + 60);
      const m = fragment.match(WZOR_DATY);
      if (!m) continue;
      let r, mies, d;
      if (m[1]) { r = +m[1]; mies = +m[2]; d = +m[3]; }
      else if (m[4]) { d = +m[4]; mies = +m[5]; r = +m[6]; }
      else { d = +m[7]; mies = MIESIACE[m[8]]; r = +m[9]; }
      if (!mies || !poprawnaData(r, mies, d)) continue;
      const wynik = iso(r, mies, d);
      if (dataMailaIso && (wynik < dodajDni(dataMailaIso, -31) || wynik > dodajDni(dataMailaIso, 365))) continue;
      return wynik;
    }
  }
  return null;
}

const SLOWA_KWOTY = ['do zaplaty', 'kwota do zaplaty', 'kwota', 'razem', 'suma', 'naleznosc', 'wartosc brutto', 'brutto', 'saldo'];
// 1 234,56 zł / 1.234,56 PLN / 79.99 zł / 79,99zł
const WZOR_KWOTY = /(\d{1,3}(?:[ .]\d{3})*|\d+)[,.](\d{2})\s?(zl|pln)\b/;

/** Szuka kwoty do zapłaty w treści. Zwraca liczbę groszy albo null. */
export function znajdzKwote(tekst) {
  const t = normalizuj(tekst);
  for (const slowo of SLOWA_KWOTY) {
    let od = 0;
    let poz;
    while ((poz = t.indexOf(slowo, od)) !== -1) {
      od = poz + slowo.length;
      const m = t.slice(od, od + 50).match(WZOR_KWOTY);
      if (!m) continue;
      const zlote = +m[1].replace(/[ .]/g, '');
      const grosze = zlote * 100 + +m[2];
      if (grosze > 0 && grosze < 100000000) return grosze;
    }
  }
  return null;
}

/** Nazwa dostawcy: nazwa nadawcy maila, a gdy jej brak — domena adresu (faktury@gazovia.pl → Gazovia). */
export function nazwaDostawcy(nazwa, adres) {
  const n = String(nazwa || '').replace(/^["']|["']$/g, '').trim();
  if (n && !n.includes('@')) return n.slice(0, 120);
  const domena = String(adres || '').split('@')[1] || '';
  const czesci = domena.split('.').filter(Boolean);
  // mobilia.com.pl → mobilia (pomijamy com/net/org/… przed krajową końcówką)
  if (czesci.length >= 3 && ['com', 'net', 'org', 'edu', 'gov', 'co', 'info', 'biz'].includes(czesci[czesci.length - 2])) {
    czesci.pop();
  }
  const glowna = czesci.length >= 2 ? czesci[czesci.length - 2] : (czesci[0] || 'Nieznany nadawca');
  return glowna.charAt(0).toUpperCase() + glowna.slice(1);
}

/**
 * Składa dane faktury z maila.
 * mail: { tytul, nadawcaNazwa, nadawcaAdres, data (Date), tekst }
 */
export function odczytajFakture(mail, dniNaPlatnosc) {
  const dataMaila = dataWarszawa(mail.data || new Date());
  const terminZTresci = znajdzTermin(mail.tekst, dataMaila);
  return {
    dostawca: nazwaDostawcy(mail.nadawcaNazwa, mail.nadawcaAdres),
    email_nadawcy: String(mail.nadawcaAdres || '').toLowerCase(),
    opis: String(mail.tytul || '').replace(/\s+/g, ' ').trim().slice(0, 300),
    kwota_grosze: znajdzKwote(mail.tekst),
    termin_platnosci: terminZTresci || dodajDni(dataMaila, dniNaPlatnosc),
    termin_z_tresci: Boolean(terminZTresci),
  };
}

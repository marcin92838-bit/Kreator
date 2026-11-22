/* Kalendarz zadań — aplikacja (Supabase).
   Ekrany: logowanie, kalendarz miesięczny, szczegóły dnia, nowe zadanie, przeplanowanie, skrzynka pocztowa.
   Konta zakłada administrator w panelu Supabase; rejestracji w aplikacji nie ma. */

const klient = window.supabase.createClient(window.KONFIG.supabaseUrl, window.KONFIG.supabaseKey);
const el = id => document.getElementById(id);

/* =========================================================
   TEKSTY
   ========================================================= */
const TEKSTY = {
  pustyEmail: 'Wpisz adres e-mail.',
  zlyEmail: 'Wpisz poprawny adres e-mail, np. imie@domena.pl.',
  pusteHaslo: 'Wpisz hasło.',
  zleDane: 'Nieprawidłowy e-mail lub hasło.',
  niepotwierdzony: 'Ten adres e-mail nie jest jeszcze potwierdzony.',
  limit: 'Zbyt wiele prób logowania. Odczekaj chwilę i spróbuj ponownie.',
  siec: 'Nie udało się połączyć z serwerem. Sprawdź połączenie z internetem i spróbuj ponownie.',
  inny: 'Nie udało się zalogować. Spróbuj ponownie.',

  bladZapisu: 'Nie udało się zapisać zmian. Spróbuj ponownie.',
  bladWczytania: 'Nie udało się wczytać danych. Odśwież stronę.',
  oplacona: 'Faktura oznaczona jako opłacona.',
  zrobione: 'Zadanie oznaczone jako zrobione.',
  przywrocona: 'Przywrócono fakturę do opłacenia.',
  przywrocone: 'Przywrócono zadanie.',
  bladNazwa: 'Wpisz nazwę zadania.',
  bladTermin: 'Wybierz co najmniej jeden termin.',
  bladNowyTerminPusty: 'Wybierz nowy termin.',
  bladNowyTerminTenSam: 'Wybierz inny dzień niż obecny termin.',
  bladNowyTerminZajety: 'To zadanie ma już termin w tym dniu.',
  bladNowyTerminPrzeszly: 'Nowy termin nie może być wcześniejszy niż dzisiaj.',

  bladFrazaKrotka: 'Fraza musi mieć co najmniej 2 znaki.',
  bladFrazaJest: 'Ta fraza jest już na liście.',
  bladAdres: 'Wpisz adres skrzynki, np. imie@gmail.com.',
  bladHost: 'Wpisz adres serwera IMAP.',
  bladPort: 'Wpisz port od 1 do 65535 (zwykle 993).',
  bladLogin: 'Wpisz login do skrzynki.',
  bladHasloSkrzynki: 'Wpisz hasło aplikacji do skrzynki.',
  bladDni: 'Wpisz liczbę dni od 0 do 120.'
};

const DOSTAWCY_POCZTY = [
  { id: 'gmail', nazwa: 'Gmail', host: 'imap.gmail.com', port: 993 },
  { id: 'outlook', nazwa: 'Outlook / Hotmail', host: 'outlook.office365.com', port: 993 },
  { id: 'wp', nazwa: 'WP Poczta', host: 'imap.wp.pl', port: 993 },
  { id: 'onet', nazwa: 'Onet Poczta', host: 'imap.poczta.onet.pl', port: 993 },
  { id: 'interia', nazwa: 'Interia', host: 'poczta.interia.pl', port: 993 },
  { id: 'o2', nazwa: 'o2', host: 'poczta.o2.pl', port: 993 },
  { id: 'icloud', nazwa: 'iCloud', host: 'imap.mail.me.com', port: 993 },
  { id: 'inny', nazwa: 'Inny (wpiszę serwer sam)', host: '', port: 993 }
];
const PODPOWIEDZI_FRAZ = ['faktura', 'rachunek', 'do zapłaty', 'e-faktura'];

/* =========================================================
   STAN (dane wczytane z Supabase)
   ========================================================= */
const stan = {
  uzytkownikId: null,
  email: '',
  skrzynka: null,      // wiersz z tabeli skrzynki albo null
  frazy: [],           // [{id, fraza}]
  faktury: [],         // wiersze z tabeli faktury
  zadania: [],         // [{id, nazwa, terminy: [{id, data, status}]}]
  ostatnio: null,      // ostatnia akcja do cofnięcia
  sprawdzanie: false
};

const KOLUMNY_SKRZYNKI = 'id, adres, dostawca_poczty, status, ostatnia_synchronizacja, imap_host, imap_port, imap_login, folder, dni_na_platnosc, ostatni_blad, ostatnio_nowych';

/* =========================================================
   POMOCNICZE
   ========================================================= */
const MIESIACE = ['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'];
const MIESIACE_DOP = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
const DNI_TYG = ['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota'];
const DNI_KROTKO = ['Pn','Wt','Śr','Cz','Pt','Sb','Nd'];
const DNI_DLUGO = ['poniedziałek','wtorek','środa','czwartek','piątek','sobota','niedziela'];

const pad = n => String(n).padStart(2, '0');
const rozbij = s => s.split('-').map(Number);
const iso = (r, m, d) => `${r}-${pad(m)}-${pad(d)}`;
const kluczMies = (r, m) => `${r}-${pad(m)}`;
const dzis = () => { const d = new Date(); return iso(d.getFullYear(), d.getMonth() + 1, d.getDate()); };
const dniWMiesiacu = (r, m) => new Date(r, m, 0).getDate();
const przesunMiesiac = (r, m, o) => { const dt = new Date(r, m - 1 + o, 1); return [dt.getFullYear(), dt.getMonth() + 1]; };
const poprawnaData = s => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [r, m, d] = rozbij(s);
  return m >= 1 && m <= 12 && d >= 1 && d <= dniWMiesiacu(r, m);
};
const wielka = t => t.charAt(0).toUpperCase() + t.slice(1);
const nazwaMiesiaca = (r, m) => `${wielka(MIESIACE[m - 1])} ${r}`;
const dataSlownie = s => { const [r, m, d] = rozbij(s); return `${d} ${MIESIACE_DOP[m - 1]}${r !== new Date().getFullYear() ? ' ' + r : ''}`; };
const nazwaDnia = s => { const [r, m, d] = rozbij(s); return `${wielka(DNI_TYG[new Date(r, m - 1, d).getDay()])}, ${d} ${MIESIACE_DOP[m - 1]} ${r}`; };
const dataICzas = t => t ? new Date(t).toLocaleString('pl-PL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '';
const kwota = (grosze, waluta) => grosze == null ? '' :
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: (waluta || 'PLN').trim() }).format(grosze / 100);

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const poTerminie = s => s < dzis();
const fakturyDnia = s => stan.faktury.filter(f => f.termin_platnosci === s && f.status === 'do_oplacenia');
const terminyDnia = s => stan.zadania.flatMap(z => z.terminy
  .filter(t => t.data === s && t.status === 'do_zrobienia')
  .map(t => ({ zadanie: z, termin: t })));
const znajdzTermin = id => {
  for (const z of stan.zadania) { const t = z.terminy.find(x => x.id === id); if (t) return { zadanie: z, termin: t }; }
  return null;
};
const odmiana = (n, jeden, kilka, wiele) => n === 1 ? jeden : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? kilka : wiele;
const odmianaFaktur = n => odmiana(n, 'faktura', 'faktury', 'faktur');
const odmianaZadan = n => odmiana(n, 'zadanie', 'zadania', 'zadań');
const odmianaTerminow = n => odmiana(n, 'termin', 'terminy', 'terminów');

const IKONY = {
  wstecz: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  dalej: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  ok: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  usun: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  przenies: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4M9 15.5h6M13 13l2.5 2.5L13 18"/></svg>',
  zadanie: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="4" width="16" height="16"/><path d="M8 12l3 3 5-6"/></svg>',
  mail: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14"/><path d="m3 6 9 7 9-7"/></svg>',
  odswiez: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/></svg>',
  pusto: '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4M9 15.5l2 2 4-4"/></svg>'
};

/* =========================================================
   WCZYTYWANIE DANYCH
   ========================================================= */
async function wczytajSkrzynke() {
  const [s, f] = await Promise.all([
    klient.from('skrzynki').select(KOLUMNY_SKRZYNKI).maybeSingle(),
    klient.from('frazy').select('id, fraza').order('utworzono')
  ]);
  if (s.error || f.error) throw s.error || f.error;
  stan.skrzynka = s.data;
  stan.frazy = f.data;
}

async function wczytajFaktury() {
  const { data, error } = await klient.from('faktury')
    .select('id, dostawca, email_nadawcy, opis, kwota_grosze, waluta, termin_platnosci, status, oplacona_kiedy')
    .order('termin_platnosci');
  if (error) throw error;
  stan.faktury = data;
}

async function wczytajZadania() {
  const { data, error } = await klient.from('zadania')
    .select('id, nazwa, terminy_zadan (id, data, status)')
    .order('utworzono');
  if (error) throw error;
  stan.zadania = data.map(z => ({ id: z.id, nazwa: z.nazwa, terminy: z.terminy_zadan.sort((a, b) => a.data.localeCompare(b.data)) }));
}

async function wczytajWszystko() {
  await Promise.all([wczytajSkrzynke(), wczytajFaktury(), wczytajZadania()]);
}

/* =========================================================
   EKRANY
   ========================================================= */

/* Kalendarz miesięczny */
function ekranKalendarz(r, m) {
  const DZIS = dzis();
  const [dzR, dzM] = rozbij(DZIS);
  const km = kluczMies(r, m);
  const biezacy = kluczMies(dzR, dzM);
  const n = dniWMiesiacu(r, m);
  const pierwszyDzienTyg = (new Date(r, m - 1, 1).getDay() + 6) % 7;
  let ileFaktur = 0, ileZadan = 0, ilePoTerminie = 0;

  const komorki = [];
  for (let i = 0; i < pierwszyDzienTyg; i++) komorki.push('<td class="is-empty"></td>');
  for (let d = 1; d <= n; d++) {
    const s = iso(r, m, d);
    const fakt = fakturyDnia(s);
    const zad = terminyDnia(s);
    const zalegle = s < DZIS;
    ileFaktur += fakt.length; ileZadan += zad.length;
    if (zalegle) ilePoTerminie += fakt.length + zad.length;

    const dzienTyg = (pierwszyDzienTyg + d - 1) % 7;
    const klasy = ['day'];
    if (s === DZIS) klasy.push('is-today');
    if (dzienTyg >= 5) klasy.push('is-weekend');
    if (fakt.length || zad.length) klasy.push('has-items');
    if (zalegle && (fakt.length || zad.length)) klasy.push('has-overdue');

    const zal = zalegle ? ' is-overdue' : '';
    const wpisy = [
      ...fakt.map(f => `<span class="chip${zal}"><span>${esc(f.dostawca)}</span></span>`),
      ...zad.map(({ zadanie }) => `<span class="chip is-task${zal}">${IKONY.zadanie}<span>${esc(zadanie.nazwa)}</span></span>`)
    ];
    const chipy = wpisy.slice(0, 2).join('') +
      (wpisy.length > 2 ? `<span class="chip chip--more"><span>+${wpisy.length - 2} więcej</span></span>` : '');

    const czesci = [];
    if (fakt.length) czesci.push(`${fakt.length} ${odmianaFaktur(fakt.length)} do opłacenia`);
    if (zad.length) czesci.push(`${zad.length} ${odmianaZadan(zad.length)}`);
    if (zalegle && czesci.length) czesci.push('po terminie');
    const opisSr = `${d} ${MIESIACE_DOP[m - 1]}${s === DZIS ? ', dzisiaj' : ''}: ` + (czesci.length ? czesci.join(', ') : 'nic zaplanowanego');

    komorki.push(`<td><a class="${klasy.join(' ')}" href="#dzien-${s}" aria-label="${opisSr}">
      <span class="day__num">${d}</span>${chipy}</a></td>`);
  }
  while (komorki.length % 7) komorki.push('<td class="is-empty"></td>');
  let wiersze = '';
  for (let i = 0; i < komorki.length; i += 7) wiersze += '<tr>' + komorki.slice(i, i + 7).join('') + '</tr>';

  const fakturyMiesiaca = stan.faktury.filter(f => f.termin_platnosci.startsWith(km));
  const oplaconeMiesiaca = fakturyMiesiaca.filter(f => f.status === 'oplacona').length;

  const pods = [];
  if (fakturyMiesiaca.length) pods.push(ileFaktur ? `Faktury do opłacenia: <strong>${ileFaktur}</strong>` : 'Faktury: wszystkie opłacone');
  else pods.push('Brak faktur z poczty');
  pods.push(`Twoje zadania: <strong>${ileZadan}</strong>`);
  if (ilePoTerminie) pods.push(`<span class="is-danger">Po terminie: ${ilePoTerminie}</span>`);
  if (oplaconeMiesiaca) pods.push(`Opłacone w tym miesiącu: ${oplaconeMiesiaca}`);

  let baner = '';
  if (!stan.skrzynka) {
    baner = `<div class="banner">${IKONY.mail}<span>Skonfiguruj skrzynkę pocztową, a faktury z maili będą pojawiać się tu same.</span>
      <a class="btn btn--primary" href="#skrzynka">Skonfiguruj skrzynkę</a></div>`;
  } else if (stan.skrzynka.status === 'blad') {
    baner = `<div class="banner banner--danger" role="alert">${IKONY.mail}<span><strong>Nie udało się sprawdzić skrzynki.</strong> ${esc(stan.skrzynka.ostatni_blad || '')}</span>
      <a class="btn btn--secondary" href="#skrzynka">Ustawienia skrzynki</a></div>`;
  } else if (!stan.frazy.length) {
    baner = `<div class="banner">${IKONY.mail}<span>Dodaj frazy, których aplikacja ma szukać w tytułach maili (np. „faktura”).</span>
      <a class="btn btn--primary" href="#skrzynka">Dodaj frazy</a></div>`;
  } else if (fakturyMiesiaca.length && !ileFaktur) {
    baner = `<div class="banner banner--success" role="status">${IKONY.ok}<strong>Wszystko opłacone. W tym miesiącu nie masz już faktur do zapłaty.</strong></div>`;
  } else if (!fakturyMiesiaca.length && km > biezacy) {
    baner = `<div class="banner">${IKONY.mail}<span>Faktury na ten miesiąc jeszcze nie przyszły. Pojawią się tu same, gdy dostaniesz je mailem.</span></div>`;
  }

  const [pr, pm] = przesunMiesiac(r, m, -1);
  const [nr, nm] = przesunMiesiac(r, m, 1);

  return `
  <div class="page">
    ${baner}
    <div class="cal-head">
      <div>
        <h1 tabindex="-1">${nazwaMiesiaca(r, m)}</h1>
        <p class="cal-summary">${pods.join(' · ')}</p>
      </div>
      <div class="cal-head__nav">
        <a class="btn btn--primary" href="#dodaj-zadanie">${IKONY.plus}Dodaj zadanie</a>
        ${km !== biezacy ? '<a class="btn btn--secondary" href="#kalendarz">Dzisiaj</a>' : ''}
        <a class="btn btn--icon" href="#kalendarz-${kluczMies(pr, pm)}" aria-label="Poprzedni miesiąc: ${MIESIACE[pm - 1]} ${pr}" title="${wielka(MIESIACE[pm - 1])} ${pr}">${IKONY.wstecz}</a>
        <a class="btn btn--icon" href="#kalendarz-${kluczMies(nr, nm)}" aria-label="Następny miesiąc: ${MIESIACE[nm - 1]} ${nr}" title="${wielka(MIESIACE[nm - 1])} ${nr}">${IKONY.dalej}</a>
      </div>
    </div>
    <table class="calendar">
      <caption class="sr-only">Faktury do opłacenia według terminu płatności i Twoje zadania. Kliknij dzień, aby zobaczyć szczegóły.</caption>
      <thead><tr>${DNI_KROTKO.map((d, i) => `<th scope="col"><abbr title="${DNI_DLUGO[i]}" style="text-decoration:none">${d}</abbr></th>`).join('')}</tr></thead>
      <tbody>${wiersze}</tbody>
    </table>
    <div class="legend" aria-hidden="true">
      <span><i class="is-today"></i>Dzisiaj</span>
      <span><i></i>Faktura z poczty (termin płatności)</span>
      <span><i class="is-task"></i>Twoje zadanie</span>
      <span><i class="is-overdue"></i>Po terminie</span>
    </div>
  </div>`;
}

/* Szczegóły dnia */
function ekranDzien(s) {
  const fakt = fakturyDnia(s);
  const zad = terminyDnia(s);
  const zalegle = poTerminie(s);
  const [r, m] = rozbij(s);
  const cokolwiekBylo = stan.faktury.some(f => f.termin_platnosci === s) || stan.zadania.some(z => z.terminy.some(t => t.data === s));
  const plakietkaZal = zalegle ? '<span class="badge badge--danger">Po terminie</span>' : '';
  let tresc = '';

  if (fakt.length) {
    tresc += `
      <h2 class="section-title">Faktury do opłacenia</h2>
      <ul class="invoice-list">
        ${fakt.map(f => `
        <li class="invoice">
          <div>
            <div class="invoice__provider">${esc(f.dostawca)}${plakietkaZal}</div>
            <p class="invoice__desc">${esc(f.opis)}</p>
            ${f.kwota_grosze != null ? `<p class="invoice__desc invoice__amount">${esc(kwota(f.kwota_grosze, f.waluta))}</p>` : ''}
            <p class="invoice__from">Od: ${esc(f.email_nadawcy)}</p>
          </div>
          <div class="invoice__actions">
            <button class="btn btn--primary" type="button" data-oplac="${esc(f.id)}">${IKONY.ok}Oznacz jako opłaconą</button>
          </div>
        </li>`).join('')}
      </ul>`;
  }

  if (zad.length) {
    tresc += `
      <h2 class="section-title">Twoje zadania</h2>
      <ul class="invoice-list">
        ${zad.map(({ zadanie: z, termin: t }) => {
          const nastepny = z.terminy.filter(x => x.data > s && x.status === 'do_zrobienia').map(x => x.data).sort()[0];
          const harmonogram = z.terminy.length > 1
            ? `Harmonogram: ${z.terminy.length} ${odmianaTerminow(z.terminy.length)}${nastepny ? ` · następny: ${dataSlownie(nastepny)}` : ''}`
            : 'Jednorazowe';
          return `
        <li class="invoice">
          <div>
            <div class="invoice__provider">${esc(z.nazwa)}<span class="badge badge--outline">Twoje zadanie</span>${plakietkaZal}</div>
            <p class="invoice__from">${harmonogram}</p>
          </div>
          <div class="invoice__actions">
            <button class="btn btn--primary" type="button" data-zrobione="${esc(t.id)}">${IKONY.ok}Oznacz jako zrobione</button>
            <a class="btn btn--ghost" href="#przeplanuj-${esc(t.id)}">${IKONY.przenies}Przeplanuj</a>
          </div>
        </li>`;
        }).join('')}
      </ul>`;
  }

  if (!fakt.length && !zad.length) {
    tresc = cokolwiekBylo ? `
      <div class="empty" role="status">
        ${IKONY.pusto}
        <h2>Wszystko z tego dnia jest załatwione</h2>
        <p>Opłacone faktury i zrobione zadania nie znikły — po prostu nie musisz już o nich pamiętać.</p>
        <div class="empty__actions"><a class="btn btn--primary" href="#kalendarz-${kluczMies(r, m)}">Wróć do kalendarza</a></div>
      </div>` : `
      <div class="empty">
        ${IKONY.pusto}
        <h2>Nic zaplanowanego na ten dzień</h2>
        <p>Nie przyszła żadna faktura z terminem płatności na ten dzień i nie masz tu żadnych zadań.</p>
        <div class="empty__actions">
          <a class="btn btn--primary" href="#kalendarz-${kluczMies(r, m)}">Wróć do kalendarza</a>
          <a class="btn btn--secondary" href="#dodaj-zadanie-${s}">${IKONY.plus}Dodaj zadanie na ten dzień</a>
        </div>
      </div>`;
  }

  const czesci = [];
  if (fakt.length) czesci.push(`${fakt.length} ${odmianaFaktur(fakt.length)} z terminem płatności w tym dniu`);
  if (zad.length) czesci.push(`${zad.length} ${odmianaZadan(zad.length)}`);
  const podtytul = czesci.length ? czesci.join(' · ') : (s === dzis() ? 'Dzisiaj' : '&nbsp;');

  return `
  <div class="page">
    <a class="btn btn--ghost back" href="#kalendarz-${kluczMies(r, m)}">${IKONY.wstecz}Kalendarz: ${MIESIACE[m - 1]} ${r}</a>
    <div class="day-head">
      <div>
        <h1 tabindex="-1">${nazwaDnia(s)}</h1>
        <p>${podtytul}</p>
      </div>
      ${(fakt.length || zad.length) ? `<a class="btn btn--secondary" href="#dodaj-zadanie-${s}">${IKONY.plus}Dodaj zadanie na ten dzień</a>` : ''}
    </div>
    ${tresc}
  </div>`;
}

/* Nowe zadanie */
function wierszTerminu(wartosc, moznaUsunac, nr) {
  return `<div class="date-row">
    <input class="input" type="date" name="termin" value="${wartosc || ''}" aria-label="Termin ${nr}" aria-describedby="blad-termin">
    ${moznaUsunac ? `<button class="btn btn--icon" type="button" data-usun-termin aria-label="Usuń termin ${nr}">${IKONY.usun}</button>` : ''}
  </div>`;
}

function ekranDodajZadanie(s) {
  const powrot = s ? '#dzien-' + s : '#kalendarz';
  return `
  <div class="page">
    <a class="btn btn--ghost back" href="${powrot}">${IKONY.wstecz}${s ? 'Wróć do dnia' : 'Kalendarz'}</a>
    <form class="form" id="form-zadanie" novalidate>
      <h1 tabindex="-1">Nowe zadanie</h1>
      <p class="form__intro">Dodaj do kalendarza coś, o czym nie chcesz pamiętać. Pojawi się obok faktur z poczty.</p>
      <div class="field">
        <label for="nazwa">Nazwa zadania</label>
        <input class="input" id="nazwa" name="nazwa" type="text" autocomplete="off" maxlength="200" placeholder="np. Wywóz śmieci" aria-describedby="blad-nazwa">
        <p class="field__error" id="blad-nazwa" hidden>${TEKSTY.bladNazwa}</p>
      </div>
      <div class="field">
        <fieldset>
          <legend>Terminy</legend>
          <p class="field__hint">Jeśli zadanie się powtarza, ale w różne dni (np. według harmonogramu wywozu śmieci), dodaj każdą datę z harmonogramu.</p>
          <div id="terminy">${wierszTerminu(s, false, 1)}</div>
          <button class="btn btn--ghost" type="button" id="dodaj-termin">${IKONY.plus}Dodaj kolejną datę z harmonogramu</button>
          <p class="field__error" id="blad-termin" hidden>${TEKSTY.bladTermin}</p>
        </fieldset>
      </div>
      <div class="form__actions">
        <button class="btn btn--primary" type="submit">Zapisz zadanie</button>
        <a class="btn btn--ghost" href="${powrot}">Anuluj</a>
      </div>
    </form>
  </div>`;
}

/* Przeplanowanie jednego terminu */
function ekranPrzeplanuj({ zadanie: z, termin: t }) {
  const s = t.data;
  const pozostale = z.terminy.filter(x => x.id !== t.id && x.status === 'do_zrobienia').map(x => x.data).sort();
  return `
  <div class="page">
    <a class="btn btn--ghost back" href="#dzien-${s}">${IKONY.wstecz}Wróć do dnia</a>
    <form class="form" id="form-przeplanuj" data-termin="${esc(t.id)}" novalidate>
      <h1 tabindex="-1">Przeplanuj zadanie</h1>
      <div class="task-card">
        <p class="task-card__name">${esc(z.nazwa)}</p>
        <p>Obecny termin: <strong>${nazwaDnia(s)}</strong>${poTerminie(s) ? ' <span class="badge badge--danger">Po terminie</span>' : ''}</p>
        ${pozostale.length ? `<p style="margin-top:var(--spacing-xs)">Pozostałe terminy z harmonogramu się nie zmienią:</p>
        <ul>${pozostale.map(x => `<li>${dataSlownie(x)}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="field">
        <label for="nowy-termin">Nowy termin</label>
        <p class="field__hint">Możesz wybrać dzień także w innym miesiącu.</p>
        <input class="input" id="nowy-termin" name="nowy" type="date" min="${dzis()}" value="${poTerminie(s) ? '' : s}" aria-describedby="blad-nowy">
        <p class="field__error" id="blad-nowy" hidden></p>
      </div>
      <div class="form__actions">
        <button class="btn btn--primary" type="submit">Zapisz nowy termin</button>
        <a class="btn btn--ghost" href="#dzien-${s}">Anuluj</a>
      </div>
    </form>
  </div>`;
}

/* Skrzynka pocztowa i frazy */
function ekranSkrzynka() {
  const sk = stan.skrzynka;
  const dostawca = sk ? (DOSTAWCY_POCZTY.find(d => d.host === sk.imap_host) || DOSTAWCY_POCZTY.at(-1)) : DOSTAWCY_POCZTY[0];

  let status = '';
  if (sk) {
    const opisStatusu = {
      niesprawdzona: 'jeszcze nie sprawdzona',
      polaczona: 'połączona',
      blad: 'błąd połączenia',
      odlaczona: 'odłączona'
    }[sk.status] || sk.status;
    status = `
      <div class="status-box${sk.status === 'blad' || sk.ostatni_blad ? ' status-box--error' : ''}" role="status">
        <p><strong>${esc(sk.adres)}</strong> — ${opisStatusu}
          ${sk.status === 'polaczona' ? '<span class="badge badge--ok">OK</span>' : ''}</p>
        ${sk.ostatnia_synchronizacja ? `<p>Ostatnie sprawdzenie: ${esc(dataICzas(sk.ostatnia_synchronizacja))}${sk.ostatnio_nowych != null ? `, nowe faktury: ${sk.ostatnio_nowych}` : ''}.</p>` : ''}
        ${sk.ostatni_blad ? `<p class="status-box__msg">${esc(sk.ostatni_blad)}</p>` : ''}
        <p>Aplikacja sprawdza skrzynkę automatycznie co 15 minut.</p>
        <div class="actions">
          <button class="btn btn--primary" type="button" id="sprawdz-poczte" ${stan.sprawdzanie ? 'disabled' : ''}>${IKONY.odswiez}${stan.sprawdzanie ? 'Sprawdzanie…' : 'Sprawdź pocztę teraz'}</button>
        </div>
      </div>`;
  }

  const brakujace = PODPOWIEDZI_FRAZ.filter(p => !stan.frazy.some(f => f.fraza.toLowerCase() === p));

  return `
  <div class="page">
    <a class="btn btn--ghost back" href="#kalendarz">${IKONY.wstecz}Kalendarz</a>
    <div class="form">
      <h1 tabindex="-1">Skrzynka pocztowa</h1>
      <p class="form__intro">Aplikacja czyta maile z tej skrzynki i zamienia na faktury te, których tytuł zawiera jedną z Twoich fraz.</p>
      ${status}

      <h2 id="frazy-naglowek">Frazy w tytule maila</h2>
      <p class="field__hint">Pobierane są tylko maile, których tytuł zawiera co najmniej jedną frazę. Wielkość liter i polskie znaki nie mają znaczenia.</p>
      ${stan.frazy.length ? `<ul class="phrases" aria-labelledby="frazy-naglowek">
        ${stan.frazy.map(f => `<li class="phrase"><span>${esc(f.fraza)}</span>
          <button class="btn btn--icon" type="button" data-usun-fraze="${esc(f.id)}" aria-label="Usuń frazę ${esc(f.fraza)}">${IKONY.usun}</button></li>`).join('')}
      </ul>` : '<p><strong>Nie masz jeszcze żadnej frazy</strong> — dopóki jej nie dodasz, aplikacja nie pobierze żadnego maila.</p>'}
      <form id="form-fraza" novalidate>
        <div class="field">
          <label for="nowa-fraza">Nowa fraza</label>
          <div class="phrase-add">
            <input class="input" id="nowa-fraza" type="text" maxlength="100" autocomplete="off" placeholder="np. faktura" aria-describedby="blad-fraza">
            <button class="btn btn--secondary" type="submit">${IKONY.plus}Dodaj frazę</button>
          </div>
          <p class="field__error" id="blad-fraza" hidden></p>
          ${brakujace.length ? `<p class="field__hint" style="margin-top:var(--spacing-xs)">Podpowiedzi:
            ${brakujace.map(p => `<button class="btn btn--ghost" type="button" data-podpowiedz="${esc(p)}">${esc(p)}</button>`).join(' ')}</p>` : ''}
        </div>
      </form>

      <h2>Połączenie ze skrzynką (IMAP)</h2>
      <form id="form-skrzynka" novalidate>
        <div class="field">
          <label for="sk-dostawca">Poczta</label>
          <select class="input" id="sk-dostawca">
            ${DOSTAWCY_POCZTY.map(d => `<option value="${d.id}" ${d.id === dostawca.id ? 'selected' : ''}>${esc(d.nazwa)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="sk-adres">Adres skrzynki</label>
          <input class="input" id="sk-adres" type="email" autocomplete="off" value="${esc(sk?.adres || '')}" placeholder="np. imie@gmail.com" aria-describedby="blad-sk-adres">
          <p class="field__error" id="blad-sk-adres" hidden></p>
        </div>
        <div class="field">
          <div class="field__row">
            <div>
              <label for="sk-host">Serwer IMAP</label>
              <input class="input" id="sk-host" type="text" autocomplete="off" value="${esc(sk?.imap_host || dostawca.host)}" aria-describedby="blad-sk-host">
            </div>
            <div>
              <label for="sk-port">Port</label>
              <input class="input" id="sk-port" type="number" min="1" max="65535" value="${esc(sk?.imap_port || 993)}" aria-describedby="blad-sk-host">
            </div>
          </div>
          <p class="field__error" id="blad-sk-host" hidden></p>
        </div>
        <div class="field">
          <label for="sk-login">Login</label>
          <p class="field__hint">Zwykle pełny adres e-mail.</p>
          <input class="input" id="sk-login" type="text" autocomplete="off" value="${esc(sk?.imap_login || '')}" aria-describedby="blad-sk-login">
          <p class="field__error" id="blad-sk-login" hidden></p>
        </div>
        <div class="field">
          <label for="sk-haslo">Hasło aplikacji</label>
          <p class="field__hint" id="sk-haslo-podpowiedz">${podpowiedzHasla(dostawca.id)}${sk ? ' Zostaw puste, aby nie zmieniać zapisanego hasła.' : ''}</p>
          <input class="input" id="sk-haslo" type="password" autocomplete="new-password" aria-describedby="sk-haslo-podpowiedz blad-sk-haslo">
          <p class="field__error" id="blad-sk-haslo" hidden></p>
          <label class="checkbox"><input type="checkbox" id="sk-pokaz-haslo"> Pokaż hasło</label>
        </div>
        <div class="field">
          <label for="sk-folder">Folder</label>
          <p class="field__hint">Folder, w którym przychodzą faktury. Zwykle INBOX (Odebrane).</p>
          <input class="input" id="sk-folder" type="text" autocomplete="off" value="${esc(sk?.folder || 'INBOX')}">
        </div>
        <div class="field">
          <label for="sk-dni">Dni na zapłatę</label>
          <p class="field__hint">Jeśli w treści maila nie ma terminu płatności, termin = data maila + tyle dni.</p>
          <input class="input" id="sk-dni" type="number" min="0" max="120" value="${esc(sk?.dni_na_platnosc ?? 14)}" style="max-width:120px" aria-describedby="blad-sk-dni">
          <p class="field__error" id="blad-sk-dni" hidden></p>
        </div>
        <div class="alert" id="blad-skrzynki" role="alert" hidden></div>
        <div class="form__actions">
          <button class="btn btn--primary" type="submit">${sk ? 'Zapisz i sprawdź pocztę' : 'Połącz i sprawdź pocztę'}</button>
          <a class="btn btn--ghost" href="#kalendarz">Anuluj</a>
        </div>
      </form>

      ${sk ? `<div class="danger-zone">
        <h2 style="margin-top:0">Odłącz skrzynkę</h2>
        <p>Aplikacja przestanie pobierać maile i usunie zapisane hasło. Pobrane faktury zostaną w kalendarzu.</p>
        <button class="btn btn--danger" type="button" id="odlacz-skrzynke">Odłącz skrzynkę</button>
      </div>` : ''}
    </div>
  </div>`;
}

function podpowiedzHasla(idDostawcy) {
  if (idDostawcy === 'gmail') return 'Gmail wymaga hasła aplikacji (Konto Google → Bezpieczeństwo → Weryfikacja dwuetapowa → Hasła aplikacji). Zwykłe hasło nie zadziała.';
  if (idDostawcy === 'outlook') return 'Outlook wymaga hasła aplikacji (konto Microsoft → Zabezpieczenia → Hasła aplikacji).';
  if (idDostawcy === 'icloud') return 'iCloud wymaga hasła aplikacji (appleid.apple.com → Hasła aplikacji).';
  if (['wp', 'onet', 'interia', 'o2'].includes(idDostawcy)) return 'Upewnij się, że w ustawieniach poczty włączony jest dostęp przez IMAP (programy pocztowe).';
  return 'Hasło do skrzynki albo hasło aplikacji, jeśli Twoja poczta go wymaga.';
}

/* =========================================================
   NAWIGACJA
   ========================================================= */
const app = el('app');

function ustawNaglowek() {
  const link = el('inbox-link');
  const sk = stan.skrzynka;
  link.classList.remove('is-ok', 'is-error');
  if (!sk) {
    link.innerHTML = `${IKONY.mail}<span>Skonfiguruj skrzynkę</span>`;
    link.title = 'Skrzynka pocztowa nie jest skonfigurowana';
  } else if (sk.status === 'blad') {
    link.classList.add('is-error');
    link.innerHTML = `${IKONY.mail}<span>Błąd skrzynki</span>`;
    link.title = 'Nie udało się sprawdzić skrzynki: ' + (sk.ostatni_blad || '');
  } else {
    link.classList.add('is-ok');
    link.innerHTML = `${IKONY.mail}<span>${esc(sk.adres)}</span>`;
    link.title = 'Faktury zbieramy z tej skrzynki — kliknij, aby zmienić ustawienia';
  }
}

function render() {
  if (!stan.uzytkownikId) return;
  const hash = location.hash.replace('#', '') || 'kalendarz';
  const [dzR, dzM] = rozbij(dzis());
  let m, html = null;

  if (hash === 'kalendarz') html = ekranKalendarz(dzR, dzM);
  else if ((m = hash.match(/^kalendarz-(\d{4})-(\d{2})$/)) && +m[2] >= 1 && +m[2] <= 12) html = ekranKalendarz(+m[1], +m[2]);
  else if ((m = hash.match(/^dzien-(.+)$/)) && poprawnaData(m[1])) html = ekranDzien(m[1]);
  else if (hash === 'dodaj-zadanie') html = ekranDodajZadanie(null);
  else if ((m = hash.match(/^dodaj-zadanie-(.+)$/)) && poprawnaData(m[1])) html = ekranDodajZadanie(m[1]);
  else if ((m = hash.match(/^przeplanuj-(.+)$/))) {
    const z = znajdzTermin(m[1]);
    if (z && z.termin.status === 'do_zrobienia') html = ekranPrzeplanuj(z);
  }
  else if (hash === 'skrzynka') html = ekranSkrzynka();

  if (html === null) {
    history.replaceState(null, '', '#kalendarz');
    html = ekranKalendarz(dzR, dzM);
  }

  ustawNaglowek();
  app.innerHTML = html;
  const h1 = app.querySelector('h1');
  if (h1) h1.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

/* Odświeżenie ekranu bez przewijania (np. po zmianie listy fraz) */
function przerysuj(fokusId) {
  const y = window.scrollY;
  ustawNaglowek();
  const hash = location.hash;
  render();
  if (location.hash === hash) window.scrollTo(0, y);
  if (fokusId && el(fokusId)) el(fokusId).focus({ preventScroll: true });
}

/* =========================================================
   KOMUNIKATY
   ========================================================= */
let toastTimer;
function pokazKomunikat(tekst, zCofnij) {
  el('toast-text').textContent = tekst;
  el('toast-action').hidden = !zCofnij;
  el('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el('toast').hidden = true; }, zCofnij ? 7000 : 4500);
}

function ustawBladPola(pole, idBledu, tekst) {
  if (pole) pole.setAttribute('aria-invalid', tekst ? 'true' : 'false');
  const e = el(idBledu);
  if (!e) return;
  e.textContent = tekst || '';
  e.hidden = !tekst;
}

/* =========================================================
   ZAPIS DO BAZY
   ========================================================= */
async function ustawStatusFaktury(id, oplacona) {
  const zmiana = oplacona ? { status: 'oplacona', oplacona_kiedy: new Date().toISOString() } : { status: 'do_oplacenia', oplacona_kiedy: null };
  const { error } = await klient.from('faktury').update(zmiana).eq('id', id);
  if (error) throw error;
  Object.assign(stan.faktury.find(f => f.id === id), zmiana);
}

async function ustawStatusTerminu(id, zrobione) {
  const zmiana = zrobione ? { status: 'zrobione', zrobione_kiedy: new Date().toISOString() } : { status: 'do_zrobienia', zrobione_kiedy: null };
  const { error } = await klient.from('terminy_zadan').update(zmiana).eq('id', id);
  if (error) throw error;
  znajdzTermin(id).termin.status = zmiana.status;
}

async function ustawDateTerminu(id, data) {
  const { error } = await klient.from('terminy_zadan').update({ data }).eq('id', id);
  if (error) throw error;
  const { zadanie, termin } = znajdzTermin(id);
  termin.data = data;
  zadanie.terminy.sort((a, b) => a.data.localeCompare(b.data));
}

async function dodajZadanie(nazwa, daty) {
  const { data: z, error } = await klient.from('zadania').insert({ nazwa }).select('id').single();
  if (error) throw error;
  const { data: terminy, error: e2 } = await klient.from('terminy_zadan')
    .insert(daty.map(data => ({ zadanie_id: z.id, data })))
    .select('id, data, status');
  if (e2) {
    await klient.from('zadania').delete().eq('id', z.id);   // bez terminów zadanie nie ma sensu
    throw e2;
  }
  stan.zadania.push({ id: z.id, nazwa, terminy: terminy.sort((a, b) => a.data.localeCompare(b.data)) });
}

async function sprawdzPoczte() {
  stan.sprawdzanie = true;
  if (location.hash === '#skrzynka') przerysuj();
  try {
    const { data, error } = await klient.functions.invoke('pobierz-faktury', { body: {} });
    let wynik = data;
    if (error) {
      try { wynik = await error.context.json(); } catch { wynik = { blad: 'Nie udało się sprawdzić poczty. Spróbuj ponownie.' }; }
    }
    await Promise.all([wczytajSkrzynke(), wczytajFaktury()]);
    if (wynik?.blad) pokazKomunikat(wynik.blad, false);
    else pokazKomunikat(wynik?.nowe ? `Sprawdzono pocztę. Nowe faktury: ${wynik.nowe}.` : 'Sprawdzono pocztę. Brak nowych faktur.', false);
  } catch {
    pokazKomunikat('Nie udało się sprawdzić poczty. Spróbuj ponownie.', false);
  } finally {
    stan.sprawdzanie = false;
    przerysuj();
  }
}

/* =========================================================
   INTERAKCJE
   ========================================================= */

/* Cofnij: opłacenie faktury, zrobienie zadania albo przeniesienie terminu */
el('toast-action').addEventListener('click', async () => {
  const o = stan.ostatnio;
  if (!o) return;
  stan.ostatnio = null;
  el('toast').hidden = true;
  try {
    let tekst;
    if (o.typ === 'faktura') { await ustawStatusFaktury(o.id, false); tekst = TEKSTY.przywrocona; }
    else if (o.typ === 'zadanie') { await ustawStatusTerminu(o.id, false); tekst = TEKSTY.przywrocone; }
    else {
      await ustawDateTerminu(o.id, o.z);
      tekst = `Przywrócono poprzedni termin zadania „${znajdzTermin(o.id).zadanie.nazwa}”: ${dataSlownie(o.z)}.`;
    }
    render();
    pokazKomunikat(tekst, false);
  } catch {
    pokazKomunikat(TEKSTY.bladZapisu, false);
  }
});

/* Oznaczanie faktury / terminu z krótkim stanem zapisu */
async function oznacz(przycisk, zapisz, komunikat) {
  const wiersz = przycisk.closest('.invoice');
  wiersz.querySelectorAll('button, a').forEach(b => { b.disabled = true; b.setAttribute('aria-disabled', 'true'); b.style.pointerEvents = 'none'; });
  przycisk.textContent = 'Zapisywanie…';
  wiersz.classList.add('is-leaving');
  try {
    await zapisz();
    render();
    pokazKomunikat(komunikat, true);
  } catch {
    render();
    pokazKomunikat(TEKSTY.bladZapisu, false);
  }
}

app.addEventListener('click', async e => {
  const oplac = e.target.closest('[data-oplac]');
  if (oplac) {
    const id = oplac.dataset.oplac;
    oznacz(oplac, async () => { await ustawStatusFaktury(id, true); stan.ostatnio = { typ: 'faktura', id }; }, TEKSTY.oplacona);
    return;
  }

  const zrob = e.target.closest('[data-zrobione]');
  if (zrob) {
    const id = zrob.dataset.zrobione;
    oznacz(zrob, async () => { await ustawStatusTerminu(id, true); stan.ostatnio = { typ: 'zadanie', id }; }, TEKSTY.zrobione);
    return;
  }

  if (e.target.closest('#dodaj-termin')) {
    const kontener = el('terminy');
    kontener.insertAdjacentHTML('beforeend', wierszTerminu('', true, kontener.children.length + 1));
    kontener.lastElementChild.querySelector('input').focus();
    return;
  }

  const usunTermin = e.target.closest('[data-usun-termin]');
  if (usunTermin) {
    usunTermin.closest('.date-row').remove();
    el('dodaj-termin').focus();
    return;
  }

  const usunFraze = e.target.closest('[data-usun-fraze]');
  if (usunFraze) {
    const id = usunFraze.dataset.usunFraze;
    usunFraze.disabled = true;
    const { error } = await klient.from('frazy').delete().eq('id', id);
    if (error) { pokazKomunikat(TEKSTY.bladZapisu, false); usunFraze.disabled = false; return; }
    const usunieta = stan.frazy.find(f => f.id === id);
    stan.frazy = stan.frazy.filter(f => f.id !== id);
    przerysuj('nowa-fraza');
    pokazKomunikat(`Usunięto frazę „${usunieta?.fraza || ''}”.`, false);
    return;
  }

  const podpowiedz = e.target.closest('[data-podpowiedz]');
  if (podpowiedz) {
    await zapiszFraze(podpowiedz.dataset.podpowiedz);
    return;
  }

  if (e.target.closest('#sprawdz-poczte')) {
    if (!stan.sprawdzanie) sprawdzPoczte();
    return;
  }

  if (e.target.closest('#odlacz-skrzynke')) {
    if (!confirm('Odłączyć skrzynkę? Aplikacja przestanie pobierać maile i usunie zapisane hasło. Pobrane faktury zostaną.')) return;
    const { error } = await klient.from('skrzynki').delete().eq('id', stan.skrzynka.id);
    if (error) { pokazKomunikat(TEKSTY.bladZapisu, false); return; }
    stan.skrzynka = null;
    przerysuj();
    pokazKomunikat('Skrzynka została odłączona.', false);
  }
});

app.addEventListener('change', e => {
  if (e.target.id === 'sk-dostawca') {
    const d = DOSTAWCY_POCZTY.find(x => x.id === e.target.value);
    if (d.host) el('sk-host').value = d.host;
    el('sk-port').value = d.port;
    el('sk-haslo-podpowiedz').textContent = podpowiedzHasla(d.id) + (stan.skrzynka ? ' Zostaw puste, aby nie zmieniać zapisanego hasła.' : '');
    if (d.id === 'inny') el('sk-host').focus();
  }
  if (e.target.id === 'sk-pokaz-haslo') el('sk-haslo').type = e.target.checked ? 'text' : 'password';
});

app.addEventListener('input', e => {
  if (e.target.id === 'nazwa' && e.target.value.trim()) ustawBladPola(e.target, 'blad-nazwa', '');
  if (e.target.name === 'termin' && e.target.value) {
    document.querySelectorAll('input[name="termin"]').forEach(i => i.setAttribute('aria-invalid', 'false'));
    el('blad-termin').hidden = true;
  }
  if (e.target.id === 'nowy-termin' && e.target.value) ustawBladPola(e.target, 'blad-nowy', '');
  if (e.target.id === 'nowa-fraza') ustawBladPola(e.target, 'blad-fraza', '');
  if (e.target.id === 'sk-adres') {
    ustawBladPola(e.target, 'blad-sk-adres', '');
    const login = el('sk-login');
    if (!login.dataset.zmieniony) login.value = e.target.value.trim();
  }
  if (e.target.id === 'sk-login') { e.target.dataset.zmieniony = '1'; ustawBladPola(e.target, 'blad-sk-login', ''); }
  if (e.target.id === 'sk-host' || e.target.id === 'sk-port') ustawBladPola(e.target, 'blad-sk-host', '');
  if (e.target.id === 'sk-haslo') ustawBladPola(e.target, 'blad-sk-haslo', '');
  if (e.target.id === 'sk-dni') ustawBladPola(e.target, 'blad-sk-dni', '');
});

async function zapiszFraze(tekst) {
  const pole = el('nowa-fraza');
  const fraza = tekst.trim().replace(/\s+/g, ' ');
  if (fraza.length < 2) { ustawBladPola(pole, 'blad-fraza', TEKSTY.bladFrazaKrotka); pole.focus(); return; }
  if (stan.frazy.some(f => f.fraza.toLowerCase() === fraza.toLowerCase())) { ustawBladPola(pole, 'blad-fraza', TEKSTY.bladFrazaJest); pole.focus(); return; }
  const { data, error } = await klient.from('frazy').insert({ fraza }).select('id, fraza').single();
  if (error) {
    ustawBladPola(pole, 'blad-fraza', error.code === '23505' ? TEKSTY.bladFrazaJest : TEKSTY.bladZapisu);
    return;
  }
  stan.frazy.push(data);
  przerysuj('nowa-fraza');
  pokazKomunikat(`Dodano frazę „${fraza}”.`, false);
}

function zapiszZKrotkimLadowaniem(form) {
  const przycisk = form.querySelector('[type="submit"]');
  const tekst = przycisk.innerHTML;
  przycisk.disabled = true;
  przycisk.textContent = 'Zapisywanie…';
  return () => { przycisk.disabled = false; przycisk.innerHTML = tekst; };
}

app.addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;

  if (form.id === 'form-fraza') {
    await zapiszFraze(el('nowa-fraza').value);
    return;
  }

  if (form.id === 'form-zadanie') {
    const pole = form.nazwa;
    const nazwa = pole.value.trim();
    const pola = [...form.querySelectorAll('input[name="termin"]')];
    const daty = [...new Set(pola.map(i => i.value).filter(poprawnaData))].sort();

    ustawBladPola(pole, 'blad-nazwa', nazwa ? '' : TEKSTY.bladNazwa);
    const bladT = daty.length ? '' : TEKSTY.bladTermin;
    pola.forEach(i => i.setAttribute('aria-invalid', bladT ? 'true' : 'false'));
    el('blad-termin').hidden = !bladT;
    if (!nazwa) { pole.focus(); return; }
    if (bladT) { pola[0].focus(); return; }

    const przywroc = zapiszZKrotkimLadowaniem(form);
    try {
      await dodajZadanie(nazwa, daty);
      const lista = daty.slice(0, 4).map(dataSlownie).join(', ') + (daty.length > 4 ? '…' : '');
      location.replace('#kalendarz-' + daty[0].slice(0, 7));
      pokazKomunikat(`Dodano zadanie „${nazwa}”: ${daty.length} ${odmianaTerminow(daty.length)} (${lista}).`, false);
    } catch {
      przywroc();
      pokazKomunikat(TEKSTY.bladZapisu, false);
    }
    return;
  }

  if (form.id === 'form-przeplanuj') {
    const { zadanie: z, termin: t } = znajdzTermin(form.dataset.termin);
    const stary = t.data;
    const pole = form.nowy;
    const nowy = pole.value;
    let blad = '';
    if (!poprawnaData(nowy)) blad = TEKSTY.bladNowyTerminPusty;
    else if (nowy === stary) blad = TEKSTY.bladNowyTerminTenSam;
    else if (poTerminie(nowy)) blad = TEKSTY.bladNowyTerminPrzeszly;
    else if (z.terminy.some(x => x.data === nowy)) blad = TEKSTY.bladNowyTerminZajety;
    ustawBladPola(pole, 'blad-nowy', blad);
    if (blad) { pole.focus(); return; }

    const przywroc = zapiszZKrotkimLadowaniem(form);
    try {
      await ustawDateTerminu(t.id, nowy);
      stan.ostatnio = { typ: 'przeniesienie', id: t.id, z: stary };
      location.replace('#kalendarz-' + nowy.slice(0, 7));
      pokazKomunikat(`Przeniesiono „${z.nazwa}” na ${dataSlownie(nowy)}.`, true);
    } catch {
      przywroc();
      pokazKomunikat(TEKSTY.bladZapisu, false);
    }
    return;
  }

  if (form.id === 'form-skrzynka') {
    const v = id => el(id).value.trim();
    const adres = v('sk-adres'), host = v('sk-host'), login = v('sk-login'), folder = v('sk-folder') || 'INBOX';
    const port = Number(v('sk-port')), dni = Number(v('sk-dni'));
    const haslo = el('sk-haslo').value;

    const bledy = [
      ['sk-adres', 'blad-sk-adres', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adres) ? '' : TEKSTY.bladAdres],
      ['sk-host', 'blad-sk-host', !host ? TEKSTY.bladHost : (!Number.isInteger(port) || port < 1 || port > 65535 ? TEKSTY.bladPort : '')],
      ['sk-login', 'blad-sk-login', login ? '' : TEKSTY.bladLogin],
      ['sk-haslo', 'blad-sk-haslo', haslo || stan.skrzynka ? '' : TEKSTY.bladHasloSkrzynki],
      ['sk-dni', 'blad-sk-dni', Number.isInteger(dni) && dni >= 0 && dni <= 120 ? '' : TEKSTY.bladDni]
    ];
    bledy.forEach(([pole, idBledu, tekst]) => ustawBladPola(el(pole), idBledu, tekst));
    const pierwszy = bledy.find(b => b[2]);
    if (pierwszy) { el(pierwszy[0]).focus(); return; }

    el('blad-skrzynki').hidden = true;
    const przywroc = zapiszZKrotkimLadowaniem(form);
    const dostawca = DOSTAWCY_POCZTY.find(d => d.id === el('sk-dostawca').value);
    const { error } = await klient.rpc('zapisz_skrzynke', {
      p_adres: adres, p_dostawca: dostawca?.id === 'inny' ? null : dostawca?.nazwa, p_host: host, p_port: port,
      p_login: login, p_haslo: haslo, p_folder: folder, p_dni_na_platnosc: dni
    });
    if (error) {
      przywroc();
      el('blad-skrzynki').textContent = error.message || TEKSTY.bladZapisu;
      el('blad-skrzynki').hidden = false;
      return;
    }
    await wczytajSkrzynke();
    przerysuj();
    window.scrollTo(0, 0);
    pokazKomunikat('Zapisano ustawienia skrzynki. Sprawdzam pocztę…', false);
    sprawdzPoczte();
  }
});

/* =========================================================
   LOGOWANIE
   ========================================================= */
function opisBleduLogowania(blad) {
  const kod = blad?.code;
  if (kod === 'invalid_credentials') return TEKSTY.zleDane;
  if (kod === 'email_not_confirmed') return TEKSTY.niepotwierdzony;
  if (kod === 'over_request_rate_limit' || blad?.status === 429) return TEKSTY.limit;
  if (blad?.name === 'AuthRetryableFetchError' || blad?.status === 0) return TEKSTY.siec;
  return TEKSTY.inny;
}

el('form-logowanie').addEventListener('submit', async e => {
  e.preventDefault();
  const poleEmail = el('email');
  const poleHaslo = el('haslo');
  const email = poleEmail.value.trim();
  const haslo = poleHaslo.value;
  el('blad-logowania').hidden = true;

  const bladEmail = !email ? TEKSTY.pustyEmail : (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? TEKSTY.zlyEmail : '');
  const bladHaslo = haslo ? '' : TEKSTY.pusteHaslo;
  ustawBladPola(poleEmail, 'blad-email', bladEmail);
  ustawBladPola(poleHaslo, 'blad-haslo', bladHaslo);
  if (bladEmail) { poleEmail.focus(); return; }
  if (bladHaslo) { poleHaslo.focus(); return; }

  const przycisk = el('zaloguj');
  przycisk.disabled = true;
  przycisk.textContent = 'Logowanie…';
  const { error } = await klient.auth.signInWithPassword({ email, password: haslo });
  przycisk.disabled = false;
  przycisk.textContent = 'Zaloguj się';
  poleHaslo.value = '';

  if (error) {
    el('blad-logowania').textContent = opisBleduLogowania(error);
    el('blad-logowania').hidden = false;
    poleHaslo.focus();
  }
  // Zmianę ekranu obsługuje onAuthStateChange.
});

el('email').addEventListener('input', e => { if (e.target.value.trim()) ustawBladPola(e.target, 'blad-email', ''); });
el('haslo').addEventListener('input', e => { if (e.target.value) ustawBladPola(e.target, 'blad-haslo', ''); });
el('pokaz-haslo').addEventListener('change', e => { el('haslo').type = e.target.checked ? 'text' : 'password'; });
el('wyloguj').addEventListener('click', () => klient.auth.signOut());

function pokazLogowanie() {
  Object.assign(stan, { uzytkownikId: null, email: '', skrzynka: null, frazy: [], faktury: [], zadania: [], ostatnio: null });
  el('ladowanie').hidden = true;
  el('user').hidden = true;
  app.hidden = true;
  app.innerHTML = '';
  el('ekran-logowania').hidden = false;
  if (location.hash) history.replaceState(null, '', location.pathname);
  el('ekran-logowania').querySelector('h1').focus({ preventScroll: true });
}

async function pokazAplikacje(sesja) {
  if (stan.uzytkownikId === sesja.user.id) return;   // np. odświeżenie tokenu — dane już są
  stan.uzytkownikId = sesja.user.id;
  stan.email = sesja.user.email || '';
  el('ekran-logowania').hidden = true;
  el('ladowanie').hidden = false;
  el('user').hidden = false;
  el('user-email').textContent = stan.email;
  try {
    await wczytajWszystko();
  } catch {
    el('ladowanie').textContent = TEKSTY.bladWczytania;
    return;
  }
  el('ladowanie').hidden = true;
  app.hidden = false;
  render();
}

window.addEventListener('hashchange', render);

klient.auth.onAuthStateChange((zdarzenie, sesja) => {
  // Callback musi być synchroniczny — dalsza praca poza bieżącym wywołaniem.
  setTimeout(() => { if (sesja) pokazAplikacje(sesja); else pokazLogowanie(); }, 0);
});

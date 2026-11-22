/* Logowanie e-mailem i hasłem przez Supabase Auth.
   Rejestracji w aplikacji nie ma — konta zakłada administrator w panelu Supabase. */

const klient = window.supabase.createClient(window.KONFIG.supabaseUrl, window.KONFIG.supabaseKey);

const el = id => document.getElementById(id);
const ekrany = { ladowanie: el('ladowanie'), logowanie: el('ekran-logowania'), glowny: el('ekran-glowny') };

const TEKSTY = {
  pustyEmail: 'Wpisz adres e-mail.',
  zlyEmail: 'Wpisz poprawny adres e-mail, np. imie@domena.pl.',
  pusteHaslo: 'Wpisz hasło.',
  zleDane: 'Nieprawidłowy e-mail lub hasło.',
  niepotwierdzony: 'Ten adres e-mail nie jest jeszcze potwierdzony.',
  limit: 'Zbyt wiele prób logowania. Odczekaj chwilę i spróbuj ponownie.',
  siec: 'Nie udało się połączyć z serwerem. Sprawdź połączenie z internetem i spróbuj ponownie.',
  inny: 'Nie udało się zalogować. Spróbuj ponownie.'
};

function pokazEkran(nazwa) {
  Object.entries(ekrany).forEach(([k, e]) => { e.hidden = k !== nazwa; });
  const h1 = ekrany[nazwa].querySelector('h1');
  if (h1) h1.focus({ preventScroll: true });
}

function ustawSesje(sesja) {
  const email = sesja?.user?.email || '';
  el('user').hidden = !sesja;
  el('user-email').textContent = email;
  el('powitanie-email').textContent = email;
  pokazEkran(sesja ? 'glowny' : 'logowanie');
}

function ustawBladPola(pole, idBledu, tekst) {
  pole.setAttribute('aria-invalid', tekst ? 'true' : 'false');
  el(idBledu).textContent = tekst;
  el(idBledu).hidden = !tekst;
}

function opisBledu(blad) {
  const kod = blad?.code;
  if (kod === 'invalid_credentials') return TEKSTY.zleDane;
  if (kod === 'email_not_confirmed') return TEKSTY.niepotwierdzony;
  if (kod === 'over_request_rate_limit' || blad?.status === 429) return TEKSTY.limit;
  if (blad?.name === 'AuthRetryableFetchError' || blad?.status === 0) return TEKSTY.siec;
  return TEKSTY.inny;
}

/* Logowanie */
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

  if (error) {
    el('blad-logowania').textContent = opisBledu(error);
    el('blad-logowania').hidden = false;
    poleHaslo.value = '';
    poleHaslo.focus();
    return;
  }
  poleHaslo.value = '';
  // Zmianę ekranu obsługuje onAuthStateChange.
});

/* Usuwanie błędu, gdy użytkownik poprawia pole */
el('email').addEventListener('input', e => { if (e.target.value.trim()) ustawBladPola(e.target, 'blad-email', ''); });
el('haslo').addEventListener('input', e => { if (e.target.value) ustawBladPola(e.target, 'blad-haslo', ''); });
el('pokaz-haslo').addEventListener('change', e => { el('haslo').type = e.target.checked ? 'text' : 'password'; });

/* Wylogowanie */
el('wyloguj').addEventListener('click', async () => {
  await klient.auth.signOut();
});

/* Stan sesji: przy starcie (sesja zapamiętana w przeglądarce) i po każdej zmianie */
klient.auth.onAuthStateChange((zdarzenie, sesja) => {
  // Callback musi być synchroniczny — zmiana ekranu poza bieżącym wywołaniem.
  setTimeout(() => ustawSesje(sesja), 0);
});

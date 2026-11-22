// Edge Function: pobiera z IMAP maile, których tytuł zawiera frazę użytkownika, i zapisuje je jako faktury.
// Wywołania:
//  - harmonogram (pg_cron) z nagłówkiem x-cron-sekret → wszystkie skrzynki,
//  - aplikacja („Sprawdź pocztę teraz”) z tokenem zalogowanego użytkownika → tylko jego skrzynka.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import postgres from 'https://deno.land/x/postgresjs@v3.4.5/mod.js';
import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { ImapFlow } from 'npm:imapflow@2.10.2';
import PostalMime from 'npm:postal-mime@4.1.4';
import { odczytajFakture, pasujeDoFraz, tekstZHtml } from './parser.js';

const PIERWSZY_IMPORT_DNI = 30;     // przy pierwszym sprawdzeniu: maile z ostatnich 30 dni
const ZAKLADKA_DNI = 2;             // kolejne sprawdzenia: od ostatniej synchronizacji minus 2 dni
const MAKS_MAILI_NA_RAZ = 40;       // limit pobieranych treści w jednym wywołaniu

const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { prepare: false, max: 3 });
const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const odpowiedz = (dane: unknown, status = 200) =>
  new Response(JSON.stringify(dane), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

type Skrzynka = {
  id: string; uzytkownik_id: string; imap_host: string; imap_port: number; imap_login: string;
  folder: string; dni_na_platnosc: number; ostatnia_synchronizacja: Date | null; haslo: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return odpowiedz({ blad: 'Dozwolona tylko metoda POST.' }, 405);

  // --- Kto wywołuje? ---
  let uzytkownikId: string | null = null;
  const sekretCrona = req.headers.get('x-cron-sekret');
  if (sekretCrona) {
    const [wiersz] = await sql`select decrypted_secret from vault.decrypted_secrets where name = 'kreator_cron_sekret'`;
    if (!wiersz || wiersz.decrypted_secret !== sekretCrona) return odpowiedz({ blad: 'Brak dostępu.' }, 401);
  } else {
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const { data, error } = token ? await supabaseAdmin.auth.getUser(token) : { data: null, error: true };
    if (error || !data?.user) return odpowiedz({ blad: 'Zaloguj się ponownie.' }, 401);
    uzytkownikId = data.user.id;
  }

  // --- Skrzynki do sprawdzenia (hasło odszyfrowane z Vault) ---
  const skrzynki: Skrzynka[] = await sql`
    select s.id, s.uzytkownik_id, s.imap_host, s.imap_port, s.imap_login, s.folder, s.dni_na_platnosc,
           s.ostatnia_synchronizacja, ds.decrypted_secret as haslo
      from public.skrzynki s
      join vault.decrypted_secrets ds on ds.id = s.haslo_secret_id
     where s.status <> 'odlaczona'
       and s.imap_host is not null
       ${uzytkownikId ? sql`and s.uzytkownik_id = ${uzytkownikId}` : sql``}`;

  if (uzytkownikId && skrzynki.length === 0) {
    return odpowiedz({ blad: 'Najpierw skonfiguruj skrzynkę pocztową.' }, 400);
  }

  const wyniki = [];
  for (const s of skrzynki) wyniki.push(await sprawdzSkrzynke(s));

  return odpowiedz(uzytkownikId ? wyniki[0] : { sprawdzone: wyniki.length, wyniki });
});

async function sprawdzSkrzynke(s: Skrzynka) {
  const frazy: string[] = (await sql`select fraza from public.frazy where uzytkownik_id = ${s.uzytkownik_id}`)
    .map((w: { fraza: string }) => w.fraza);

  if (frazy.length === 0) {
    const blad = 'Dodaj co najmniej jedną frazę, której aplikacja ma szukać w tytułach maili.';
    await sql`update public.skrzynki set ostatni_blad = ${blad} where id = ${s.id}`;
    return { nowe: 0, sprawdzone: 0, blad };
  }

  const klient = new ImapFlow({
    host: s.imap_host,
    port: s.imap_port,
    secure: s.imap_port === 993,
    auth: { user: s.imap_login, pass: s.haslo },
    logger: false,
    socketTimeout: 60_000,
    greetingTimeout: 20_000,
  });

  let nowe = 0;
  let pasujace = 0;
  try {
    await klient.connect();
    const blokada = await klient.getMailboxLock(s.folder || 'INBOX');
    try {
      const od = s.ostatnia_synchronizacja
        ? new Date(new Date(s.ostatnia_synchronizacja).getTime() - ZAKLADKA_DNI * 86_400_000)
        : new Date(Date.now() - PIERWSZY_IMPORT_DNI * 86_400_000);

      // 1. Nagłówki maili od daty „od” i wybór tych, których tytuł zawiera frazę.
      const kandydaci: { uid: number; id: string; tytul: string; nazwa: string; adres: string; data: Date }[] = [];
      for await (const m of klient.fetch({ since: od }, { uid: true, envelope: true, internalDate: true }, { uid: true })) {
        const tytul = m.envelope?.subject || '';
        if (!pasujeDoFraz(tytul, frazy)) continue;
        const nadawca = m.envelope?.from?.[0] || {};
        kandydaci.push({
          uid: m.uid,
          id: m.envelope?.messageId || `uid:${s.folder}:${klient.mailbox && typeof klient.mailbox === 'object' ? klient.mailbox.uidValidity : ''}:${m.uid}`,
          tytul,
          nazwa: nadawca.name || '',
          adres: nadawca.address || '',
          data: m.envelope?.date || m.internalDate || new Date(),
        });
      }
      pasujace = kandydaci.length;

      // 2. Pomijamy maile, które już są fakturami.
      const ids = kandydaci.map(k => k.id);
      const istniejace = new Set(
        ids.length
          ? (await sql`select wiadomosc_id from public.faktury where uzytkownik_id = ${s.uzytkownik_id} and wiadomosc_id = any(${ids})`)
              .map((w: { wiadomosc_id: string }) => w.wiadomosc_id)
          : [],
      );
      const doPobrania = kandydaci.filter(k => !istniejace.has(k.id)).slice(0, MAKS_MAILI_NA_RAZ);

      // 3. Treść maila → termin płatności i kwota.
      for (const k of doPobrania) {
        const wiadomosc = await klient.fetchOne(String(k.uid), { source: true }, { uid: true });
        let tekst = '';
        if (wiadomosc && wiadomosc.source) {
          const mail = await PostalMime.parse(wiadomosc.source);
          tekst = mail.text || tekstZHtml(mail.html);
        }
        const f = odczytajFakture(
          { tytul: k.tytul, nadawcaNazwa: k.nazwa, nadawcaAdres: k.adres, data: new Date(k.data), tekst },
          s.dni_na_platnosc,
        );
        const wynik = await sql`
          insert into public.faktury (uzytkownik_id, skrzynka_id, dostawca, email_nadawcy, opis, kwota_grosze,
                                      termin_platnosci, wiadomosc_id)
          values (${s.uzytkownik_id}, ${s.id}, ${f.dostawca}, ${f.email_nadawcy}, ${f.opis}, ${f.kwota_grosze},
                  ${f.termin_platnosci}, ${k.id})
          on conflict (uzytkownik_id, wiadomosc_id) do nothing`;
        nowe += wynik.count;
      }
    } finally {
      blokada.release();
    }
    await klient.logout();

    await sql`update public.skrzynki
                 set status = 'polaczona', ostatnia_synchronizacja = now(), ostatni_blad = null, ostatnio_nowych = ${nowe}
               where id = ${s.id}`;
    return { nowe, sprawdzone: pasujace, blad: null };
  } catch (e) {
    try { klient.close(); } catch { /* połączenie już zamknięte */ }
    const blad = opisBledu(e);
    console.error('Skrzynka', s.id, e);
    await sql`update public.skrzynki set status = 'blad', ostatni_blad = ${blad} where id = ${s.id}`;
    return { nowe, sprawdzone: pasujace, blad };
  }
}

function opisBledu(e: unknown): string {
  const err = e as { authenticationFailed?: boolean; code?: string; message?: string; responseText?: string };
  const tekst = `${err?.code || ''} ${err?.message || ''} ${err?.responseText || ''}`.toLowerCase();
  if (err?.authenticationFailed || /auth|login|credentials|password/.test(tekst)) {
    return 'Nie udało się zalogować do skrzynki. Sprawdź login i hasło aplikacji (zwykłe hasło do poczty zwykle nie działa).';
  }
  if (/enotfound|getaddrinfo|dns/.test(tekst)) return 'Nie znaleziono serwera IMAP. Sprawdź adres serwera.';
  if (/timeout|timed out|etimedout/.test(tekst)) return 'Serwer poczty nie odpowiada. Sprawdź serwer i port albo spróbuj później.';
  if (/econnrefused|connection refused/.test(tekst)) return 'Serwer poczty odrzucił połączenie. Sprawdź serwer i port.';
  if (/mailbox|folder|nonexistent|no such/.test(tekst)) return 'Nie znaleziono folderu w skrzynce. Sprawdź nazwę folderu (zwykle INBOX).';
  return 'Nie udało się sprawdzić skrzynki. Spróbuj ponownie później.';
}

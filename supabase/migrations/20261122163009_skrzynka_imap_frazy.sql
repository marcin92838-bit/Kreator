-- Konfiguracja skrzynki IMAP, frazy w tytule maila i automatyczne pobieranie faktur.
-- Hasło do skrzynki trafia do Supabase Vault (zaszyfrowane); tabela skrzynki trzyma tylko identyfikator sekretu,
-- którego przeglądarka nie może odczytać.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- =========================================================
-- Skrzynki: dane IMAP
-- =========================================================
alter table public.skrzynki
  add column imap_host        text,
  add column imap_port        integer not null default 993 check (imap_port between 1 and 65535),
  add column imap_login       text,
  add column haslo_secret_id  uuid,
  add column folder           text not null default 'INBOX',
  add column dni_na_platnosc  integer not null default 14 check (dni_na_platnosc between 0 and 120),
  add column ostatni_blad     text,
  add column ostatnio_nowych  integer;

alter table public.skrzynki drop constraint skrzynki_status_check;
alter table public.skrzynki
  add constraint skrzynki_status_check check (status in ('niesprawdzona', 'polaczona', 'blad', 'odlaczona')),
  alter column status set default 'niesprawdzona';

-- Przeglądarka widzi wszystkie kolumny poza identyfikatorem sekretu z hasłem.
revoke select on public.skrzynki from authenticated;
grant select (id, uzytkownik_id, adres, dostawca_poczty, status, ostatnia_synchronizacja, utworzono,
              imap_host, imap_port, imap_login, folder, dni_na_platnosc, ostatni_blad, ostatnio_nowych)
  on public.skrzynki to authenticated;

-- Usunięcie skrzynki usuwa też hasło z Vault.
create function public.usun_haslo_skrzynki()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.haslo_secret_id is not null then
    delete from vault.secrets where id = old.haslo_secret_id;
  end if;
  return old;
end;
$$;
revoke execute on function public.usun_haslo_skrzynki() from public, anon, authenticated;

create trigger skrzynki_usun_haslo
  after delete on public.skrzynki
  for each row execute function public.usun_haslo_skrzynki();

-- Zapis konfiguracji skrzynki przez zalogowanego użytkownika (jedyna droga zapisu hasła).
-- Puste p_haslo przy edycji = zostaw dotychczasowe hasło.
create function public.zapisz_skrzynke(
  p_adres text,
  p_dostawca text,
  p_host text,
  p_port integer,
  p_login text,
  p_haslo text,
  p_folder text,
  p_dni_na_platnosc integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_id     uuid;
  v_secret uuid;
begin
  if v_uid is null then
    raise exception 'Brak zalogowanego użytkownika.' using errcode = '42501';
  end if;
  if coalesce(btrim(p_adres), '') = '' or coalesce(btrim(p_host), '') = '' or coalesce(btrim(p_login), '') = '' then
    raise exception 'Uzupełnij adres, serwer IMAP i login.' using errcode = '22023';
  end if;

  select id, haslo_secret_id into v_id, v_secret from public.skrzynki where uzytkownik_id = v_uid;

  if coalesce(p_haslo, '') <> '' then
    if v_secret is null then
      v_secret := vault.create_secret(p_haslo, 'skrzynka_' || v_uid::text, 'Hasło IMAP skrzynki użytkownika');
    else
      perform vault.update_secret(v_secret, p_haslo);
    end if;
  elsif v_secret is null then
    raise exception 'Podaj hasło aplikacji do skrzynki.' using errcode = '22023';
  end if;

  if v_id is null then
    insert into public.skrzynki (uzytkownik_id, adres, dostawca_poczty, imap_host, imap_port, imap_login,
                                 haslo_secret_id, folder, dni_na_platnosc, status)
    values (v_uid, btrim(p_adres), nullif(btrim(p_dostawca), ''), btrim(p_host), coalesce(p_port, 993), btrim(p_login),
            v_secret, coalesce(nullif(btrim(p_folder), ''), 'INBOX'), coalesce(p_dni_na_platnosc, 14), 'niesprawdzona')
    returning id into v_id;
  else
    update public.skrzynki
       set adres = btrim(p_adres),
           dostawca_poczty = nullif(btrim(p_dostawca), ''),
           imap_host = btrim(p_host),
           imap_port = coalesce(p_port, 993),
           imap_login = btrim(p_login),
           haslo_secret_id = v_secret,
           folder = coalesce(nullif(btrim(p_folder), ''), 'INBOX'),
           dni_na_platnosc = coalesce(p_dni_na_platnosc, 14),
           status = 'niesprawdzona',
           ostatni_blad = null
     where id = v_id;
  end if;

  return v_id;
end;
$$;
revoke execute on function public.zapisz_skrzynke(text, text, text, integer, text, text, text, integer) from public, anon;
grant execute on function public.zapisz_skrzynke(text, text, text, integer, text, text, text, integer) to authenticated;

-- =========================================================
-- Frazy szukane w tytule maila
-- =========================================================
create table public.frazy (
  id            uuid primary key default gen_random_uuid(),
  uzytkownik_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  fraza         text not null check (length(btrim(fraza)) between 2 and 100),
  utworzono     timestamptz not null default now()
);
create unique index frazy_unikalne on public.frazy (uzytkownik_id, lower(btrim(fraza)));

revoke all on public.frazy from anon, authenticated;
grant select, insert, delete on public.frazy to authenticated;

alter table public.frazy enable row level security;

create policy "Własne frazy: odczyt" on public.frazy
  for select to authenticated using ((select auth.uid()) = uzytkownik_id);
create policy "Własne frazy: dodawanie" on public.frazy
  for insert to authenticated with check ((select auth.uid()) = uzytkownik_id);
create policy "Własne frazy: usuwanie" on public.frazy
  for delete to authenticated using ((select auth.uid()) = uzytkownik_id);

-- =========================================================
-- Automatyczne pobieranie co 15 minut (pg_cron → Edge Function pobierz-faktury)
-- Funkcja sprawdza nagłówek x-cron-sekret z sekretem w Vault.
-- =========================================================
select vault.create_secret('https://taoxveyxoxspervhrdez.supabase.co', 'kreator_url', 'Adres projektu dla harmonogramu');
select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'kreator_cron_sekret', 'Sekret wywołań harmonogramu');

select cron.schedule(
  'pobierz-faktury-co-15-min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'kreator_url') || '/functions/v1/pobierz-faktury',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-sekret', (select decrypted_secret from vault.decrypted_secrets where name = 'kreator_cron_sekret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 150000
  );
  $$
);

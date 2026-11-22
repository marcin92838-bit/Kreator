-- Kalendarz zadań: skrzynki, faktury, zadania, terminy zadań (model z docs/specyfikacja.md, sekcja 5).
-- Każdy wiersz należy do jednego użytkownika (uzytkownik_id = auth.users.id).
-- RLS: zalogowany użytkownik widzi i zmienia wyłącznie swoje wiersze; anonim nie ma dostępu.

-- =========================================================
-- Skrzynki pocztowe
-- =========================================================
create table public.skrzynki (
  id                      uuid primary key default gen_random_uuid(),
  uzytkownik_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  adres                   text not null,
  dostawca_poczty         text,
  status                  text not null default 'polaczona'
                            check (status in ('polaczona', 'blad', 'odlaczona')),
  ostatnia_synchronizacja timestamptz,
  utworzono               timestamptz not null default now(),
  constraint skrzynki_jedna_na_uzytkownika unique (uzytkownik_id),   -- MVP: jedna skrzynka na użytkownika
  constraint skrzynki_id_uzytkownik unique (id, uzytkownik_id)       -- dla klucza obcego z faktur
);
comment on table public.skrzynki is 'Skrzynka pocztowa użytkownika, z której odczytywane są maile z fakturami. Tokeny dostępu NIE są tu przechowywane.';

-- =========================================================
-- Faktury
-- =========================================================
create table public.faktury (
  id               uuid primary key default gen_random_uuid(),
  uzytkownik_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  skrzynka_id      uuid,
  dostawca         text not null,
  email_nadawcy    text not null,
  opis             text not null default '',
  kwota_grosze     bigint check (kwota_grosze >= 0),
  waluta           char(3) not null default 'PLN',
  termin_platnosci date not null,
  status           text not null default 'do_oplacenia'
                     check (status in ('do_oplacenia', 'oplacona')),
  oplacona_kiedy   timestamptz,
  wiadomosc_id     text,
  utworzono        timestamptz not null default now(),
  constraint faktury_oplacona_kiedy check ((status = 'oplacona') = (oplacona_kiedy is not null)),
  constraint faktury_wiadomosc_unikalna unique (uzytkownik_id, wiadomosc_id),
  -- faktura może wskazywać tylko skrzynkę tego samego użytkownika
  constraint faktury_skrzynka_fk foreign key (skrzynka_id, uzytkownik_id)
    references public.skrzynki (id, uzytkownik_id) on delete set null (skrzynka_id)
);
create index faktury_uzytkownik_termin on public.faktury (uzytkownik_id, termin_platnosci);
create index faktury_skrzynka on public.faktury (skrzynka_id, uzytkownik_id);

-- =========================================================
-- Zadania
-- =========================================================
create table public.zadania (
  id            uuid primary key default gen_random_uuid(),
  uzytkownik_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nazwa         text not null check (length(btrim(nazwa)) > 0),
  utworzono     timestamptz not null default now(),
  constraint zadania_id_uzytkownik unique (id, uzytkownik_id)        -- dla klucza obcego z terminów
);
create index zadania_uzytkownik on public.zadania (uzytkownik_id);

-- =========================================================
-- Terminy zadań
-- =========================================================
create table public.terminy_zadan (
  id             uuid primary key default gen_random_uuid(),
  zadanie_id     uuid not null,
  uzytkownik_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data           date not null,
  status         text not null default 'do_zrobienia'
                   check (status in ('do_zrobienia', 'zrobione')),
  zrobione_kiedy timestamptz,
  utworzono      timestamptz not null default now(),
  constraint terminy_zrobione_kiedy check ((status = 'zrobione') = (zrobione_kiedy is not null)),
  constraint terminy_jeden_dzien unique (zadanie_id, data),          -- zadanie nie ma dwóch terminów w tym samym dniu
  -- termin może należeć tylko do zadania tego samego użytkownika
  constraint terminy_zadanie_fk foreign key (zadanie_id, uzytkownik_id)
    references public.zadania (id, uzytkownik_id) on delete cascade
);
create index terminy_uzytkownik_data on public.terminy_zadan (uzytkownik_id, data);
create index terminy_zadanie on public.terminy_zadan (zadanie_id, uzytkownik_id);

-- =========================================================
-- Uprawnienia (kolumny, które użytkownik może zmieniać)
-- Faktury i skrzynki zapisuje serwer synchronizujący pocztę (service_role, poza RLS).
-- =========================================================
revoke all on public.skrzynki, public.faktury, public.zadania, public.terminy_zadan from anon, authenticated;

grant select, delete                      on public.skrzynki      to authenticated;
grant select                              on public.faktury       to authenticated;
grant update (status, oplacona_kiedy)     on public.faktury       to authenticated;
grant select, insert, delete              on public.zadania       to authenticated;
grant update (nazwa)                      on public.zadania       to authenticated;
grant select, insert, delete              on public.terminy_zadan to authenticated;
grant update (data, status, zrobione_kiedy) on public.terminy_zadan to authenticated;

-- =========================================================
-- Row Level Security: tylko własne wiersze
-- =========================================================
alter table public.skrzynki      enable row level security;
alter table public.faktury       enable row level security;
alter table public.zadania       enable row level security;
alter table public.terminy_zadan enable row level security;

-- skrzynki
create policy "Własne skrzynki: odczyt" on public.skrzynki
  for select to authenticated using ((select auth.uid()) = uzytkownik_id);
create policy "Własne skrzynki: usuwanie" on public.skrzynki
  for delete to authenticated using ((select auth.uid()) = uzytkownik_id);

-- faktury
create policy "Własne faktury: odczyt" on public.faktury
  for select to authenticated using ((select auth.uid()) = uzytkownik_id);
create policy "Własne faktury: zmiana statusu" on public.faktury
  for update to authenticated
  using ((select auth.uid()) = uzytkownik_id)
  with check ((select auth.uid()) = uzytkownik_id);

-- zadania
create policy "Własne zadania: odczyt" on public.zadania
  for select to authenticated using ((select auth.uid()) = uzytkownik_id);
create policy "Własne zadania: dodawanie" on public.zadania
  for insert to authenticated with check ((select auth.uid()) = uzytkownik_id);
create policy "Własne zadania: zmiana" on public.zadania
  for update to authenticated
  using ((select auth.uid()) = uzytkownik_id)
  with check ((select auth.uid()) = uzytkownik_id);
create policy "Własne zadania: usuwanie" on public.zadania
  for delete to authenticated using ((select auth.uid()) = uzytkownik_id);

-- terminy zadań
create policy "Własne terminy: odczyt" on public.terminy_zadan
  for select to authenticated using ((select auth.uid()) = uzytkownik_id);
create policy "Własne terminy: dodawanie" on public.terminy_zadan
  for insert to authenticated with check ((select auth.uid()) = uzytkownik_id);
create policy "Własne terminy: zmiana" on public.terminy_zadan
  for update to authenticated
  using ((select auth.uid()) = uzytkownik_id)
  with check ((select auth.uid()) = uzytkownik_id);
create policy "Własne terminy: usuwanie" on public.terminy_zadan
  for delete to authenticated using ((select auth.uid()) = uzytkownik_id);

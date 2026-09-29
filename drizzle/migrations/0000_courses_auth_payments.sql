create type public.app_role as enum ('admin', 'user');
create type public.account_status as enum ('active', 'banned');
create type public.payment_status as enum ('pending', 'approved', 'rejected');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users see own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  account_status public.account_status not null default 'active',
  created_at timestamptz not null default now()
);
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create or replace function public.is_active_user(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = _user_id and account_status = 'active') $$;

create policy "Own profile or admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Update own name" on public.profiles for update to authenticated
  using (id = auth.uid() and public.is_active_user(auth.uid())) with check (id = auth.uid());

create table public.payment_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  course_title text not null,
  amount integer not null,
  currency text not null default 'NGN',
  provider text not null default 'manual_opay',
  provider_reference text,
  receipt_path text not null,
  status public.payment_status not null default 'pending',
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.payment_submissions (user_id);
grant select, insert on public.payment_submissions to authenticated;
grant all on public.payment_submissions to service_role;
alter table public.payment_submissions enable row level security;

create policy "Own or admin read" on public.payment_submissions for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Active users submit pending" on public.payment_submissions for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and reviewed_by is null and public.is_active_user(auth.uid()));

create or replace function public.review_payment(_id uuid, _status public.payment_status, _note text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  update public.payment_submissions set status = _status, admin_note = _note, reviewed_by = auth.uid(), reviewed_at = now() where id = _id;
end $$;

create or replace function public.set_account_status(_user_id uuid, _status public.account_status)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  if public.has_role(_user_id, 'admin') then raise exception 'Cannot change an admin account'; end if;
  update public.profiles set account_status = _status where id = _user_id;
end $$;
revoke execute on function public.review_payment(uuid, public.payment_status, text) from anon, public;
revoke execute on function public.set_account_status(uuid, public.account_status) from anon, public;
grant execute on function public.review_payment(uuid, public.payment_status, text) to authenticated;
grant execute on function public.set_account_status(uuid, public.account_status) to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), coalesce(new.email, ''));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if lower(new.email) in ('vpromise06@gmail.com', 'vicolabisi2020@gmail.com', 'aispecialist47@gmail.com') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create policy "Users upload own receipts" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text and public.is_active_user(auth.uid()));
create policy "Users read own receipts, admins all" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'admin')));
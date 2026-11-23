-- 멤버 / 관리자 기본 테이블

create table if not exists members (
  id int primary key,
  name text not null,
  number int,
  birth_year int not null,
  positions text[] not null default '{}',
  tier text not null,
  intro text default '',
  role text,
  stats jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table members enable row level security;
alter table admin_users enable row level security;

create policy "members are viewable by everyone"
  on members for select
  using (true);

create policy "only admins can insert members"
  on members for insert
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "only admins can update members"
  on members for update
  using (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "only admins can delete members"
  on members for delete
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- 로그인한 사용자가 본인이 관리자인지 확인할 수 있도록 자기 행만 조회 허용
create policy "users can check their own admin status"
  on admin_users for select
  using (auth.uid() = user_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger members_set_updated_at
  before update on members
  for each row
  execute function set_updated_at();

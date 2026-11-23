-- 등급/능력치 수정 권한

create table if not exists stats_managers (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table stats_managers enable row level security;

create policy "users can check their own stats manager status"
  on stats_managers for select
  using (auth.uid() = user_id);
create policy "admins can view all stats managers"
  on stats_managers for select
  using (exists (select 1 from admin_users where user_id = auth.uid()));
create policy "only admins can grant stats manager"
  on stats_managers for insert
  with check (exists (select 1 from admin_users where user_id = auth.uid()));
create policy "only admins can revoke stats manager"
  on stats_managers for delete
  using (exists (select 1 from admin_users where user_id = auth.uid()));

create or replace function is_stats_manager()
returns boolean as $$
  select exists (select 1 from admin_users where user_id = auth.uid())
      or exists (select 1 from stats_managers where user_id = auth.uid());
$$ language sql security definer stable;

-- 이 권한으로는 tier/stats만 수정 가능
create or replace function update_member_stats(target_id int, new_tier text, new_stats jsonb)
returns void as $$
begin
  if not is_stats_manager() then
    raise exception 'not a stats manager';
  end if;

  update members set tier = new_tier, stats = new_stats where id = target_id;
  if not found then
    raise exception 'member not found';
  end if;
end;
$$ language plpgsql security definer;

-- 능력치 권한 여부 컬럼 추가
drop function if exists admin_list_accounts();

create function admin_list_accounts()
returns table (
  user_id uuid,
  email text,
  member_id int,
  member_name text,
  is_event_manager boolean,
  is_notice_manager boolean,
  is_stats_manager boolean
) as $$
begin
  if not exists (select 1 from admin_users where admin_users.user_id = auth.uid()) then
    raise exception 'admin only';
  end if;

  return query
    select
      u.id,
      u.email::text,
      m.id,
      m.name,
      exists (select 1 from event_managers em where em.user_id = u.id),
      exists (select 1 from notice_managers nm where nm.user_id = u.id),
      exists (select 1 from stats_managers sm where sm.user_id = u.id)
    from auth.users u
    left join members m on m.user_id = u.id
    order by u.created_at;
end;
$$ language plpgsql security definer;

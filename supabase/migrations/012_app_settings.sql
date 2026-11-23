-- 관리자 토글용 전역 설정 (key-value)

create table if not exists app_settings (
  key text primary key,
  value jsonb not null
);
alter table app_settings enable row level security;

create policy "anyone can view app settings"
  on app_settings for select using (true);

create policy "admins can insert app settings"
  on app_settings for insert
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "admins can update app settings"
  on app_settings for update
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- 평등 모드: S급 외 능력치를 숨기고 팀 짜기에도 반영. 데이터는 그대로 두고 표시만 바꿈
insert into app_settings (key, value) values ('equal_mode', 'false')
  on conflict (key) do nothing;

-- 점검 모드 (관리자 외에는 점검 화면 표시)

insert into app_settings (key, value) values ('maintenance_mode', 'false')
  on conflict (key) do nothing;

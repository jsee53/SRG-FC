-- 일정 관리 권한만으로 confirmed 값을 직접 바꾸지 못하게 막음

-- with check로는 변경 전 값과 비교할 수 없어서 트리거로 처리
create or replace function prevent_non_admin_confirm_change()
returns trigger as $$
begin
  if old.confirmed is distinct from new.confirmed
     and not exists (select 1 from admin_users where admin_users.user_id = auth.uid()) then
    raise exception 'only admins can change confirmed status (use admin_set_event_confirmed)';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists events_guard_confirmed on events;
create trigger events_guard_confirmed
  before update on events
  for each row
  execute function prevent_non_admin_confirm_change();

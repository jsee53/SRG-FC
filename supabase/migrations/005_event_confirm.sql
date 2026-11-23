-- 경기 성사 처리

-- 기존 DB 호환용
alter table events add column if not exists confirmed boolean not null default false;
alter table event_attendees add column if not exists member_id int references members (id) on delete set null;

-- 성사 여부는 참석 횟수 집계에 쓰이므로 관리자 전용 함수로만 변경
create or replace function admin_set_event_confirmed(target_event_id bigint, is_confirmed boolean)
returns void as $$
begin
  if not exists (select 1 from admin_users where user_id = auth.uid()) then
    raise exception 'admin only';
  end if;

  update events set confirmed = is_confirmed where id = target_event_id;
  if not found then
    raise exception 'event not found';
  end if;
end;
$$ language plpgsql security definer;

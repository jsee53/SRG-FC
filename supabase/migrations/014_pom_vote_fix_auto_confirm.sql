-- POM 1인 1표 기준 변경, 지난 경기 자동 성사

-- 1인 1표 기준을 계정(voter_id)에서 경기 참석자(voter_attendee_id)로 변경
-- 계정 연결을 끊었다가 다시 연결하면 auth.uid()가 바뀌어 같은 사람이 중복 투표할 수 있었음
alter table event_best_player_votes add column if not exists voter_attendee_id bigint references event_attendees (id) on delete cascade;

-- 기존 투표 이전. 연결이 끊긴 투표는 null로 남김
update event_best_player_votes v
set voter_attendee_id = mta.attendee_id
from match_team_assignments mta
join event_attendees ea on ea.id = mta.attendee_id
join members m on m.id = ea.member_id
where mta.match_id = v.match_id and m.user_id = v.voter_id and v.voter_attendee_id is null;

-- 중복 투표는 최신 것만 남김
delete from event_best_player_votes
where id in (
  select id from (
    select id, row_number() over (partition by match_id, voter_attendee_id order by created_at desc) as rn
    from event_best_player_votes
    where voter_attendee_id is not null
  ) ranked
  where rn > 1
);

alter table event_best_player_votes drop constraint if exists event_best_player_votes_match_id_voter_id_key;
alter table event_best_player_votes add constraint event_best_player_votes_match_id_voter_attendee_id_key unique (match_id, voter_attendee_id);

drop function if exists cast_best_player_vote(bigint, bigint);
drop function if exists retract_best_player_vote(bigint);

-- 변수명이 컬럼명과 같으면 on conflict에서 ambiguous(42702) 에러가 나서 이름을 다르게 둠
create or replace function cast_best_player_vote(target_match_id bigint, target_attendee_id bigint)
returns void as $$
declare
  match_event_id bigint;
  event_confirmed boolean;
  resolved_voter_attendee_id bigint;
  voter_team_index int;
  candidate_team_index int;
begin
  select event_id into match_event_id from event_matches where id = target_match_id;
  if not found then
    raise exception 'match not found';
  end if;

  select confirmed into event_confirmed from events where id = match_event_id;
  if not found or event_confirmed is not true then
    raise exception 'event not confirmed yet';
  end if;

  select mta.attendee_id, mta.team_index into resolved_voter_attendee_id, voter_team_index
    from match_team_assignments mta
    join event_attendees ea on ea.id = mta.attendee_id
    join members m on m.id = ea.member_id
    where mta.match_id = target_match_id and m.user_id = auth.uid();
  if not found then
    raise exception 'you were not an attendee of this match';
  end if;

  if resolved_voter_attendee_id = target_attendee_id then
    raise exception 'cannot vote for yourself';
  end if;

  select team_index into candidate_team_index
    from match_team_assignments
    where match_id = target_match_id and attendee_id = target_attendee_id;
  if not found or candidate_team_index is distinct from voter_team_index then
    raise exception 'candidate is not on your team';
  end if;

  insert into event_best_player_votes (event_id, match_id, team_index, voter_id, voter_attendee_id, voted_attendee_id)
  values (match_event_id, target_match_id, voter_team_index, auth.uid(), resolved_voter_attendee_id, target_attendee_id)
  on conflict (match_id, voter_attendee_id)
  do update set voted_attendee_id = excluded.voted_attendee_id, team_index = excluded.team_index,
                voter_id = excluded.voter_id, created_at = now();
end;
$$ language plpgsql security definer;

create or replace function retract_best_player_vote(target_match_id bigint)
returns void as $$
declare
  resolved_attendee_id bigint;
begin
  select mta.attendee_id into resolved_attendee_id
    from match_team_assignments mta
    join event_attendees ea on ea.id = mta.attendee_id
    join members m on m.id = ea.member_id
    where mta.match_id = target_match_id and m.user_id = auth.uid();

  delete from event_best_player_votes
  where match_id = target_match_id
    and (voter_attendee_id = resolved_attendee_id or (voter_attendee_id is null and voter_id = auth.uid()));
end;
$$ language plpgsql security definer;

-- 종료 시간이 지난 경기를 성사 처리하는 경우만 관리자가 아니어도 허용 (시간은 서버 기준, KST)
create or replace function prevent_non_admin_confirm_change()
returns trigger as $$
begin
  if old.confirmed is distinct from new.confirmed
     and not exists (select 1 from admin_users where admin_users.user_id = auth.uid())
     and not (
       new.confirmed = true
       and (new.event_date + coalesce(new.end_time, time '23:59:59')) at time zone 'Asia/Seoul' < now()
     )
  then
    raise exception 'only admins can change confirmed status (use admin_set_event_confirmed)';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace function auto_confirm_passed_events()
returns void as $$
begin
  update events
  set confirmed = true
  where confirmed = false
    and auto_confirm_disabled = false
    and (event_date + coalesce(end_time, time '23:59:59')) at time zone 'Asia/Seoul' < now();
end;
$$ language plpgsql security definer;

-- 관리자가 성사를 취소해도 다음 조회 때 자동 성사로 다시 켜지던 문제 수정
-- 수동으로 취소한 경기는 자동 성사 대상에서 제외
alter table events add column if not exists auto_confirm_disabled boolean not null default false;

create or replace function admin_set_event_confirmed(target_event_id bigint, is_confirmed boolean)
returns void as $$
begin
  if not exists (select 1 from admin_users where user_id = auth.uid()) then
    raise exception 'admin only';
  end if;

  update events
  set confirmed = is_confirmed, auto_confirm_disabled = not is_confirmed
  where id = target_event_id;
  if not found then
    raise exception 'event not found';
  end if;
end;
$$ language plpgsql security definer;

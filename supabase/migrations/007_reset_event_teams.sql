-- 팀 배정 초기화

-- 팀이 초기화되면 그 팀 기준 투표도 의미가 없어서 같이 삭제
create or replace function reset_event_teams(target_event_id bigint)
returns void as $$
begin
  if not is_event_manager() then
    raise exception 'not an event manager';
  end if;

  update event_attendees set team_index = null where event_id = target_event_id;
  delete from event_best_player_votes where event_id = target_event_id;
end;
$$ language plpgsql security definer;

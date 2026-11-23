-- 일정 장소 (한 번 입력한 장소는 목록으로 재사용)

alter table events add column if not exists location text;

create table if not exists event_locations (
  id bigint generated always as identity primary key,
  name text unique not null
);
alter table event_locations enable row level security;
create policy "anyone can view event locations" on event_locations for select using (true);
create policy "event managers can add event locations" on event_locations for insert with check (is_event_manager());

insert into event_locations (name) values ('PEC'), ('고려대'), ('경기대')
  on conflict (name) do nothing;

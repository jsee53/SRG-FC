-- SRG-FC Supabase 스키마 + RLS 정책 + 초기 데이터 이전
-- 사용법: Supabase 대시보드 > SQL Editor에 이 파일 내용을 그대로 붙여넣고 실행하세요.
-- (관리자 계정 등록은 이 파일 맨 아래 안내를 따로 참고)

-- 1) members 테이블
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

-- 2) admin_users 테이블 (이 테이블에 유저 id가 있으면 관리자)
create table if not exists admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade
);

-- 3) RLS 켜기
alter table members enable row level security;
alter table admin_users enable row level security;

-- 4) members 정책: 누구나 읽기 가능, 관리자만 쓰기 가능
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

-- admin_users는 관리자 목록을 브라우징할 일은 없지만, 로그인한 유저가
-- "내가 관리자인지"는 스스로 확인해야 해서 자기 자신 행만 보는 정책이 필요함
create policy "users can check their own admin status"
  on admin_users for select
  using (auth.uid() = user_id);

-- 5) updated_at 자동 갱신
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

-- 6) 기존 26명 데이터 이전
insert into members (id, name, number, birth_year, positions, tier, intro, role, stats)
values
(1, '고태현', 7, 1999, ARRAY['MF','FW','DF']::text[], 'S', 'GOATㅐ현', NULL, '{"passing":98,"dribbling":94,"physical":90,"defense":95,"stamina":97,"finishing":96}'::jsonb),
(2, '김다훈', 17, 1999, ARRAY['MF','FW','DF']::text[], 'S', '같은 팀하고 싶은 남자 1위', NULL, '{"passing":97,"dribbling":96,"physical":89,"defense":94,"stamina":93,"finishing":95}'::jsonb),
(3, '최현규', 6, 1998, ARRAY['MF','DF']::text[], 'S', '뚫을 수 없는 플레이어', NULL, '{"passing":87,"dribbling":87,"physical":98,"defense":99,"stamina":99,"finishing":88}'::jsonb),
(4, '한상혁', 8, 1998, ARRAY['MF','FW','DF']::text[], 'S', '육각형 플레이어', 'viceCaptain', '{"passing":98,"dribbling":96,"physical":82,"defense":93,"stamina":97,"finishing":85}'::jsonb),
(5, '송정성', 21, 1998, ARRAY['DF']::text[], 'S', '수비의 천재', NULL, '{"passing":86,"dribbling":84,"physical":96,"defense":98,"stamina":97,"finishing":85}'::jsonb),
(6, '송지우', 11, 2000, ARRAY['FW','GK']::text[], 'S', '미친 골 결정능력 보유자', NULL, '{"passing":87,"dribbling":97,"physical":84,"defense":86,"stamina":88,"finishing":98}'::jsonb),
(7, '진시영', 1, 1999, ARRAY['FW']::text[], 'A', '주사위형 플레이어', 'creator', '{"passing":75,"dribbling":86,"physical":92,"defense":84,"stamina":86,"finishing":93}'::jsonb),
(8, '박주성', 10, 1999, ARRAY['MF','DF']::text[], 'A', 'S급 서포터', 'captain', '{"passing":94,"dribbling":79,"physical":76,"defense":91,"stamina":90,"finishing":80}'::jsonb),
(9, '김진호', 66, 1999, ARRAY['MF','FW']::text[], 'A', '성장형 괴물', NULL, '{"passing":82,"dribbling":87,"physical":81,"defense":80,"stamina":86,"finishing":88}'::jsonb),
(10, '안무힐', NULL, 1999, ARRAY['FW']::text[], 'A', '이름부터 무힐 ㄷㄷ', NULL, '{"passing":88,"dribbling":89,"physical":78,"defense":77,"stamina":76,"finishing":90}'::jsonb),
(11, '최찬영', 3, 1999, ARRAY['DF']::text[], 'A', '수비? 쉽다..', NULL, '{"passing":85,"dribbling":78,"physical":79,"defense":88,"stamina":82,"finishing":80}'::jsonb),
(12, '김진웅', 13, 2003, ARRAY['MF','FW']::text[], 'A', '성장형 괴물 추격자', NULL, '{"passing":79,"dribbling":82,"physical":80,"defense":78,"stamina":83,"finishing":84}'::jsonb),
(13, '이승준', NULL, 1999, ARRAY['FW']::text[], 'B', '예술가', NULL, '{"passing":85,"dribbling":84,"physical":73,"defense":72,"stamina":74,"finishing":86}'::jsonb),
(14, '서승찬', NULL, 1998, ARRAY['MF']::text[], 'B', '다리가 정말 길다', NULL, '{"passing":75,"dribbling":82,"physical":79,"defense":78,"stamina":74,"finishing":80}'::jsonb),
(15, '최종범', NULL, 1999, ARRAY['MF']::text[], 'B', '중원의 정령', 'manager', '{"passing":85,"dribbling":74,"physical":73,"defense":84,"stamina":75,"finishing":71}'::jsonb),
(16, '장천명', 0, 1999, ARRAY['DF']::text[], 'B', '자아를 찾아가는자', NULL, '{"passing":85,"dribbling":84,"physical":70,"defense":75,"stamina":73,"finishing":69}'::jsonb),
(17, '박준서', 9, 2003, ARRAY['MF']::text[], 'B', '플레이메이커', NULL, '{"passing":85,"dribbling":71,"physical":72,"defense":75,"stamina":74,"finishing":73}'::jsonb),
(18, '윤준영', 27, 2000, ARRAY['MF','GK']::text[], 'B', '사춘기 아이', NULL, '{"passing":71,"dribbling":72,"physical":68,"defense":70,"stamina":81,"finishing":82}'::jsonb),
(19, '편현재', 4, 1999, ARRAY['MF']::text[], 'C', '슛돌이', NULL, '{"passing":71,"dribbling":69,"physical":70,"defense":73,"stamina":74,"finishing":75}'::jsonb),
(20, '한민석', 5, 1999, ARRAY['DF','GK']::text[], 'C', '개그맨', NULL, '{"passing":81,"dribbling":71,"physical":70,"defense":67,"stamina":68,"finishing":69}'::jsonb),
(21, '이민녕', NULL, 1999, ARRAY['MF']::text[], 'C', 'SRG-FC 유니콘', NULL, '{"passing":68,"dribbling":66,"physical":67,"defense":72,"stamina":73,"finishing":74}'::jsonb),
(22, '박형진', NULL, 1998, ARRAY['MF']::text[], 'C', '신규 플레이어', NULL, '{"passing":63,"dribbling":77,"physical":65,"defense":66,"stamina":76,"finishing":67}'::jsonb),
(23, '김형석', 26, 1999, ARRAY['DF']::text[], 'C', '1게임은 잘함', NULL, '{"passing":78,"dribbling":75,"physical":63,"defense":66,"stamina":62,"finishing":64}'::jsonb),
(24, '장경우', 77, 1999, ARRAY['DF']::text[], 'C', '탁병과는 다른 티어', NULL, '{"passing":69,"dribbling":59,"physical":70,"defense":73,"stamina":71,"finishing":60}'::jsonb),
(25, '조병찬', 22, 1999, ARRAY['GK','DF']::text[], 'D', '절대적 플레이어 라이벌', NULL, '{"passing":64,"dribbling":63,"physical":62,"defense":75,"stamina":61,"finishing":65}'::jsonb),
(26, '탁성원', 99, 1999, ARRAY['DF']::text[], 'D', '99번 절대적 플레이어', NULL, '{"passing":63,"dribbling":62,"physical":61,"defense":74,"stamina":60,"finishing":64}'::jsonb)
on conflict (id) do nothing;

-- =============================================================
-- Phase 2: 일반 회원가입/로그인 + 게시판 + 관리자 멤버 추가
-- =============================================================

-- 7) 관리자가 새 멤버를 추가할 수 있도록 id를 자동 발급으로 전환 (기존 1~26 유지, 다음부터 27~)
alter table members alter column id add generated by default as identity;
select setval(pg_get_serial_sequence('members', 'id'), (select max(id) from members));

-- 8) 계정과 로스터 멤버를 연결하는 컬럼 (가입 시 자기 이름 선택 → 이 값이 채워짐)
alter table members add column if not exists user_id uuid unique references auth.users (id);

-- 8-1) 관리자가 "어떤 이메일이 이 멤버와 연결됐는지" 볼 수 있도록 이메일 스냅샷을 같이 저장.
--    anon key로는 auth.users를 다른 유저 기준으로 조회할 권한이 없어서, 연결 시점에 저장해둠.
alter table members add column if not exists linked_email text;

-- 9) "미가입 멤버 중 내 이름 선택" 전용 함수 — user_id/linked_email만 건드리는 좁은 함수라
--    tier/stats 같은 다른 필드를 같이 바꿀 위험이 없음 (일반 UPDATE 정책을 열어주지 않음)
create or replace function claim_member(target_id int)
returns void as $$
begin
  update members
  set user_id = auth.uid(),
      linked_email = auth.jwt() ->> 'email'
  where id = target_id and user_id is null;
  if not found then
    raise exception 'already claimed or not found';
  end if;
end;
$$ language plpgsql security definer;

-- 9-1) 본인 계정과 연결된 멤버가 스스로 수정 가능한 필드는 등번호/출생연도/포지션 뿐.
--    이름은 본인이 바꿀 수 없게 함(다른 멤버로 오인되는 걸 막기 위해) — 이름이 바뀌어야 하면 관리자에게 요청.
--    tier/stats/role/name은 여기서 절대 안 건드림 — 관리자 전용 update 정책과 분리된 좁은 함수로 처리.
-- 주의: 예전 버전들은 new_photo/new_name 파라미터가 있었음. create or replace는 파라미터 목록이
-- 다르면 "새 함수를 추가"하는 것과 같아서(오버로드), 옛 버전이 DB에 남아있을 수 있어 명시적으로 지움
drop function if exists update_own_member(int, text, int, int, text[], text);
drop function if exists update_own_member(int, text, int, int, text[]);

create or replace function update_own_member(
  target_id int,
  new_number int,
  new_birth_year int,
  new_positions text[]
)
returns void as $$
begin
  update members
  set number = new_number,
      birth_year = new_birth_year,
      positions = new_positions
  where id = target_id and user_id = auth.uid();
  if not found then
    raise exception 'not your member or not found';
  end if;
end;
$$ language plpgsql security definer;

-- 10) posts / comments 테이블
-- author_email은 auth.users를 다른 유저 기준으로 조회할 권한이 anon key에는 없어서,
-- 작성 시점의 표시용 이메일을 그대로 스냅샷해두는 용도 (멤버 연결이 안 된 계정의 폴백 표시용)
create table if not exists posts (
  id bigint generated by default as identity primary key,
  author_id uuid not null references auth.users (id),
  author_email text not null,
  title text not null,
  content text not null,
  is_notice boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id bigint generated by default as identity primary key,
  post_id bigint not null references posts (id) on delete cascade,
  author_id uuid not null references auth.users (id),
  author_email text not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table posts enable row level security;
alter table comments enable row level security;

create policy "posts are viewable by everyone"
  on posts for select using (true);
-- is_notice=true는 관리자만 실어 보낼 수 있음 (일반 글쓰기 권한은 그대로 열려있음)
create policy "logged in users can create posts"
  on posts for insert
  with check (
    auth.uid() = author_id
    and (is_notice = false or exists (select 1 from admin_users where user_id = auth.uid()))
  );
create policy "authors can update their own posts"
  on posts for update using (auth.uid() = author_id);
create policy "authors or admins can delete posts"
  on posts for delete
  using (auth.uid() = author_id or exists (select 1 from admin_users where user_id = auth.uid()));

create policy "comments are viewable by everyone"
  on comments for select using (true);
create policy "logged in users can create comments"
  on comments for insert with check (auth.uid() = author_id);
create policy "authors can update their own comments"
  on comments for update using (auth.uid() = author_id);
create policy "authors or admins can delete comments"
  on comments for delete
  using (auth.uid() = author_id or exists (select 1 from admin_users where user_id = auth.uid()));

-- =============================================================
-- Phase 2-1: 같은 티어 안 수동 등수 폐지 — 이제 종합 점수(OVR) 높은 순으로만 정렬
-- =============================================================
alter table members drop column if exists rank;

-- =============================================================
-- Phase 3: 계정 목록/권한 부여 + 경기 일정 + 관리자 멤버 삭제
-- =============================================================

-- 11) "경기 일정 등록" 권한을 부여받은 계정 목록 (admin_users와 같은 패턴)
create table if not exists event_managers (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table event_managers enable row level security;

create policy "users can check their own event manager status"
  on event_managers for select
  using (auth.uid() = user_id);
create policy "admins can view all event managers"
  on event_managers for select
  using (exists (select 1 from admin_users where user_id = auth.uid()));
create policy "only admins can grant event manager"
  on event_managers for insert
  with check (exists (select 1 from admin_users where user_id = auth.uid()));
create policy "only admins can revoke event manager"
  on event_managers for delete
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- 12) 관리자이거나 event_managers에 있으면 일정 관리 가능 — 정책마다 반복하지 않도록 함수로 뺌
create or replace function is_event_manager()
returns boolean as $$
  select exists (select 1 from admin_users where user_id = auth.uid())
      or exists (select 1 from event_managers where user_id = auth.uid());
$$ language sql security definer stable;

-- 13) 관리자 전용: 가입된 계정 목록(이메일 + 연결된 멤버 이름 + 일정 권한 여부) 조회.
--    anon key로는 auth.users를 직접 못 보므로 security definer 함수로 우회하되,
--    함수 안에서 호출자가 관리자인지 직접 검사함 (RLS가 적용 안 되는 함수라 필수)
create or replace function admin_list_accounts()
returns table (
  user_id uuid,
  email text,
  member_id int,
  member_name text,
  is_event_manager boolean
) as $$
begin
  if not exists (select 1 from admin_users where user_id = auth.uid()) then
    raise exception 'admin only';
  end if;

  return query
    select
      u.id,
      u.email::text,
      m.id,
      m.name,
      exists (select 1 from event_managers em where em.user_id = u.id)
    from auth.users u
    left join members m on m.user_id = u.id
    order by u.created_at;
end;
$$ language plpgsql security definer;

-- 14) 동호회 일정 + 참석자. 참석자는 로스터 멤버든 용병이든 그냥 이름 문자열로 기록
--    (팀 짜기와 달리 능력치 계산에 안 쓰이고 참석 기록 목적이라 구분이 필요 없음)
create table if not exists events (
  id bigint generated by default as identity primary key,
  event_date date not null,
  start_time time,
  end_time time,
  confirmed boolean not null default false,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

-- tier는 용병 참석자 밸런싱용 스냅샷(로스터 멤버는 members.tier를 그대로 씀).
-- team_index는 "팀 짜기" 결과를 저장해두는 컬럼 (null이면 아직 팀 안 나눔)
create table if not exists event_attendees (
  id bigint generated by default as identity primary key,
  event_id bigint not null references events (id) on delete cascade,
  name text not null,
  member_id int references members (id) on delete set null,
  tier text,
  team_index int
);

alter table events enable row level security;
alter table event_attendees enable row level security;

create policy "events are viewable by everyone"
  on events for select using (true);
create policy "event managers can create events"
  on events for insert with check (is_event_manager());
create policy "event managers can update events"
  on events for update using (is_event_manager());
create policy "event managers can delete events"
  on events for delete using (is_event_manager());

create policy "event attendees are viewable by everyone"
  on event_attendees for select using (true);
create policy "event managers can add attendees"
  on event_attendees for insert with check (is_event_manager());
create policy "event managers can remove attendees"
  on event_attendees for delete using (is_event_manager());
-- update 정책은 Phase 4 섹션에서 추가 (원래 이 테이블을 만들 때는 team_index 수정이 필요 없었음)

-- 15) 관리자의 멤버 삭제는 Phase 1의 "only admins can delete members" 정책으로 이미 허용되어 있음
--     (프론트에서 그동안 안 쓰고 있었을 뿐 — 새 정책 불필요)

-- =============================================================
-- Phase 3-1: 경기 성사 여부 + 참석 횟수 카운팅
-- =============================================================

-- 16) 이미 events/event_attendees를 만든 뒤라면 새 컬럼만 추가 (신규 설치면 위 create table에 이미 포함됨)
alter table events add column if not exists confirmed boolean not null default false;
alter table event_attendees add column if not exists member_id int references members (id) on delete set null;

-- 17) "경기 성사됨" 표시는 관리자만 — event_managers는 일정/참석자 등록까지만 가능하고
--    참석 횟수에 실제로 반영되는 성사 확정은 관리자 전용 좁은 함수로 분리
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

-- 참석 횟수는 event_attendees.member_id가 채워진 행 중 events.confirmed = true인 것만 세면 되므로
-- 별도 카운터 컬럼 없이 프론트에서 그때그때 집계함 (멤버 26명 규모라 뷰/캐시 없이도 충분히 가벼움)

-- =============================================================
-- Phase 4: 개인 사진 제거, 일정 시간 범위, 일정에서 바로 팀 짜기 + 저장, 팀별 베스트 플레이어 투표, 공지사항
-- =============================================================

-- 18) 개인 사진 기능 제거
alter table members drop column if exists photo;

-- 19) 일정 시간을 "19:00 ~ 22:00" 같은 시작~종료 범위로 변경 (30분 단위는 프론트에서 강제)
alter table events add column if not exists start_time time;
alter table events add column if not exists end_time time;
alter table events drop column if exists event_time;

-- 20) 참석자별 팀 배정 결과 저장 + 용병 밸런싱용 티어 스냅샷
--    (이미 16번에서 member_id는 추가했으니 여기서는 tier/team_index만 추가)
alter table event_attendees add column if not exists tier text;
alter table event_attendees add column if not exists team_index int;
create policy "event managers can update attendees"
  on event_attendees for update using (is_event_manager());

-- 21) 팀별 베스트 플레이어 투표. 투표자/후보 모두 "그 경기 그 팀 참석자"인지는
--    좁은 함수(cast_best_player_vote) 안에서만 검증 — 일반 insert 정책은 열어주지 않음
create table if not exists event_best_player_votes (
  id bigint generated by default as identity primary key,
  event_id bigint not null references events (id) on delete cascade,
  team_index int not null,
  voter_id uuid not null references auth.users (id),
  voted_attendee_id bigint not null references event_attendees (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, voter_id)
);

alter table event_best_player_votes enable row level security;

create policy "best player votes are viewable by everyone"
  on event_best_player_votes for select using (true);

create or replace function cast_best_player_vote(target_event_id bigint, target_attendee_id bigint)
returns void as $$
declare
  voter_attendee_id bigint;
  voter_team_index int;
  candidate_team_index int;
  event_confirmed boolean;
begin
  select confirmed into event_confirmed from events where id = target_event_id;
  if not found or event_confirmed is not true then
    raise exception 'event not confirmed yet';
  end if;

  select ea.id, ea.team_index into voter_attendee_id, voter_team_index
    from event_attendees ea
    join members m on m.id = ea.member_id
    where ea.event_id = target_event_id and m.user_id = auth.uid();
  if not found or voter_team_index is null then
    raise exception 'you were not an attendee of this event';
  end if;

  if voter_attendee_id = target_attendee_id then
    raise exception 'cannot vote for yourself';
  end if;

  select team_index into candidate_team_index
    from event_attendees
    where id = target_attendee_id and event_id = target_event_id;
  if not found or candidate_team_index is distinct from voter_team_index then
    raise exception 'candidate is not on your team';
  end if;

  insert into event_best_player_votes (event_id, team_index, voter_id, voted_attendee_id)
  values (target_event_id, voter_team_index, auth.uid(), target_attendee_id)
  on conflict (event_id, voter_id)
  do update set voted_attendee_id = excluded.voted_attendee_id, team_index = excluded.team_index, created_at = now();
end;
$$ language plpgsql security definer;

-- 투표를 취소하면 "아무도 안 줌" 상태가 됨 — 본인 표만 지우므로 auth.uid()로 스스로 범위를 좁혀 안전함
create or replace function retract_best_player_vote(target_event_id bigint)
returns void as $$
begin
  delete from event_best_player_votes
  where event_id = target_event_id and voter_id = auth.uid();
end;
$$ language plpgsql security definer;

-- 22) 게시판 공지사항 — is_notice=true인 글은 항상 상단에 고정 표시 (프론트에서 정렬).
--    관리자 또는 관리자가 권한을 준 계정만 공지로 등록 가능 (event_managers와 같은 패턴)
alter table posts add column if not exists is_notice boolean not null default false;

create table if not exists notice_managers (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table notice_managers enable row level security;

create policy "users can check their own notice manager status"
  on notice_managers for select
  using (auth.uid() = user_id);
create policy "admins can view all notice managers"
  on notice_managers for select
  using (exists (select 1 from admin_users where user_id = auth.uid()));
create policy "only admins can grant notice manager"
  on notice_managers for insert
  with check (exists (select 1 from admin_users where user_id = auth.uid()));
create policy "only admins can revoke notice manager"
  on notice_managers for delete
  using (exists (select 1 from admin_users where user_id = auth.uid()));

create or replace function is_notice_manager()
returns boolean as $$
  select exists (select 1 from admin_users where user_id = auth.uid())
      or exists (select 1 from notice_managers where user_id = auth.uid());
$$ language sql security definer stable;

alter policy "logged in users can create posts"
  on posts
  with check (
    auth.uid() = author_id
    and (is_notice = false or is_notice_manager())
  );

-- 23) admin_list_accounts에 공지 작성 권한 여부도 같이 내려주도록 갱신.
--    반환 컬럼이 늘어나서 create or replace로는 안 되고 drop 후 재생성해야 함
drop function if exists admin_list_accounts();

create function admin_list_accounts()
returns table (
  user_id uuid,
  email text,
  member_id int,
  member_name text,
  is_event_manager boolean,
  is_notice_manager boolean
) as $$
begin
  -- returns table의 컬럼명도 user_id라서 admin_users.user_id를 명시하지 않으면
  -- "column reference user_id is ambiguous" 에러가 나서 이 함수가 항상 실패했음
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
      exists (select 1 from notice_managers nm where nm.user_id = u.id)
    from auth.users u
    left join members m on m.user_id = u.id
    order by u.created_at;
end;
$$ language plpgsql security definer;

-- =============================================================
-- Phase 4-1: "팀 다시 짜기" 말고 팀 배정을 그냥 초기화만 하는 기능
-- =============================================================

-- 24) 팀 배정을 지우면 그 팀 기준으로 쌓인 베스트 플레이어 투표도 같이 의미가 없어지므로 같이 삭제.
--    event_best_player_votes는 select 정책만 있고 일반 delete 정책이 없어서(투표는 항상 함수를 통해서만
--    쓰게 하려는 의도) 이 초기화도 좁은 함수로 처리
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

-- =============================================================
-- Phase 4-2: 게시글/댓글 좋아요, 본인 글 수정
-- =============================================================

-- 25) 좋아요는 단순히 "user_id가 이 글/댓글에 좋아요를 눌렀다"는 행 하나 = 좋아요 하나라서
--    본인 것만 넣고 뺄 수 있게 열어주면 되고, 좁은 함수가 따로 필요 없음
create table if not exists post_likes (
  post_id bigint not null references posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists comment_likes (
  comment_id bigint not null references comments (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table post_likes enable row level security;
alter table comment_likes enable row level security;

create policy "post likes are viewable by everyone"
  on post_likes for select using (true);
create policy "users can like posts as themselves"
  on post_likes for insert with check (auth.uid() = user_id);
create policy "users can unlike their own post likes"
  on post_likes for delete using (auth.uid() = user_id);

create policy "comment likes are viewable by everyone"
  on comment_likes for select using (true);
create policy "users can like comments as themselves"
  on comment_likes for insert with check (auth.uid() = user_id);
create policy "users can unlike their own comment likes"
  on comment_likes for delete using (auth.uid() = user_id);

-- 26) 본인 글 수정 허용. update 정책에 with check를 안 넣으면 using이 그대로 재사용되는데,
--    그러면 작성자가 본인 글을 고치면서 is_notice를 몰래 true로 바꿔버릴 수 있어서
--    insert 정책과 똑같은 조건을 with check에도 명시해야 함
alter policy "authors can update their own posts"
  on posts
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id and (is_notice = false or is_notice_manager()));

-- =============================================================
-- Phase 4-3: 보안 점검에서 발견된 구멍 막기
-- =============================================================

-- 27) "event managers can update events" 정책에 with check가 없어서 using이 그대로 재사용되는데,
--    그러면 관리자 전용이어야 할 confirmed 값을 일정 권한만 있는 계정도 직접 update 호출로
--    바꿔버릴 수 있었음(성사 확정은 admin_set_event_confirmed 함수로만 하게 만든 의도가 깨짐).
--    RLS의 with check는 new 행만 보고 old 값과 비교를 못 하므로, old/new를 직접 비교할 수 있는
--    트리거로 confirmed 값 자체가 바뀌는 요청만 관리자 여부를 다시 검사해서 막음
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

-- =============================================================
-- Phase 5: 등급/능력치 수정 권한을 관리자가 따로 부여 가능하게
-- =============================================================

-- 28) "등급/능력치 수정" 권한을 부여받은 계정 목록 (event_managers/notice_managers와 같은 패턴)
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

-- 29) 등급(tier)/능력치(stats)만 건드리는 좁은 함수 — 관리자의 "수정" 폼처럼 이름/포지션/한줄평 등
--    다른 필드는 이 경로로 못 건드리게 함으로써, 이 권한만 받은 계정이 손댈 수 있는 범위를 좁혀둠
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

-- 30) admin_list_accounts에 능력치 권한 여부도 같이 내려주도록 갱신.
--    반환 컬럼이 늘어나서 create or replace로는 안 되고 drop 후 재생성해야 함
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

-- =============================================================
-- Phase 6: 일정 장소
-- =============================================================
alter table events add column if not exists location text;

-- 한 번 등록된 장소는 서버에 저장해서, 다음 일정 등록할 때 드롭다운으로 재사용할 수 있게 함
create table if not exists event_locations (
  id bigint generated always as identity primary key,
  name text unique not null
);
alter table event_locations enable row level security;
create policy "anyone can view event locations" on event_locations for select using (true);
create policy "event managers can add event locations" on event_locations for insert with check (is_event_manager());

insert into event_locations (name) values ('PEC'), ('고려대'), ('경기대')
  on conflict (name) do nothing;

-- =============================================================
-- 관리자 등록 방법 (이 SQL을 실행한 뒤, 별도로 진행하세요)
-- =============================================================
-- 1. Supabase 대시보드 > Authentication > Users > Add user 에서
--    관리자로 쓸 이메일/비밀번호로 유저를 만드세요.
-- 2. 그 유저의 UUID를 Users 목록에서 복사한 뒤, 아래 SQL의 '여기에-UUID-붙여넣기'를
--    실제 UUID로 바꿔서 SQL Editor에서 따로 실행하세요.
--
-- insert into admin_users (user_id) values ('여기에-UUID-붙여넣기');
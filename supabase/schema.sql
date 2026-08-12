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
  rank int not null,
  photo text default '',
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
insert into members (id, name, number, birth_year, positions, tier, rank, photo, intro, role, stats)
values
(1, '고태현', 7, 1999, ARRAY['MF','FW','DF']::text[], 'S', 1, '', 'GOATㅐ현', NULL, '{"passing":98,"dribbling":94,"physical":90,"defense":95,"stamina":97,"finishing":96}'::jsonb),
(2, '김다훈', 17, 1999, ARRAY['MF','FW','DF']::text[], 'S', 2, '', '같은 팀하고 싶은 남자 1위', NULL, '{"passing":97,"dribbling":96,"physical":89,"defense":94,"stamina":93,"finishing":95}'::jsonb),
(3, '최현규', 6, 1998, ARRAY['MF','DF']::text[], 'S', 3, '', '뚫을 수 없는 플레이어', NULL, '{"passing":87,"dribbling":87,"physical":98,"defense":99,"stamina":99,"finishing":88}'::jsonb),
(4, '한상혁', 8, 1998, ARRAY['MF','FW','DF']::text[], 'S', 4, '', '육각형 플레이어', 'viceCaptain', '{"passing":98,"dribbling":96,"physical":82,"defense":93,"stamina":97,"finishing":85}'::jsonb),
(5, '송정성', 21, 1998, ARRAY['DF']::text[], 'S', 5, '', '수비의 천재', NULL, '{"passing":86,"dribbling":84,"physical":96,"defense":98,"stamina":97,"finishing":85}'::jsonb),
(6, '송지우', 11, 2000, ARRAY['FW','GK']::text[], 'S', 6, '', '미친 골 결정능력 보유자', NULL, '{"passing":87,"dribbling":97,"physical":84,"defense":86,"stamina":88,"finishing":98}'::jsonb),
(7, '진시영', 1, 1999, ARRAY['FW']::text[], 'A', 1, '', '주사위형 플레이어', 'creator', '{"passing":75,"dribbling":86,"physical":92,"defense":84,"stamina":86,"finishing":93}'::jsonb),
(8, '박주성', 10, 1999, ARRAY['MF','DF']::text[], 'A', 2, '', 'S급 서포터', 'captain', '{"passing":94,"dribbling":79,"physical":76,"defense":91,"stamina":90,"finishing":80}'::jsonb),
(9, '김진호', 66, 1999, ARRAY['MF','FW']::text[], 'A', 3, '', '성장형 괴물', NULL, '{"passing":82,"dribbling":87,"physical":81,"defense":80,"stamina":86,"finishing":88}'::jsonb),
(10, '안무힐', NULL, 1999, ARRAY['FW']::text[], 'A', 4, '', '이름부터 무힐 ㄷㄷ', NULL, '{"passing":88,"dribbling":89,"physical":78,"defense":77,"stamina":76,"finishing":90}'::jsonb),
(11, '최찬영', 3, 1999, ARRAY['DF']::text[], 'A', 5, '', '수비? 쉽다..', NULL, '{"passing":85,"dribbling":78,"physical":79,"defense":88,"stamina":82,"finishing":80}'::jsonb),
(12, '김진웅', 13, 2003, ARRAY['MF','FW']::text[], 'A', 6, '', '성장형 괴물 추격자', NULL, '{"passing":79,"dribbling":82,"physical":80,"defense":78,"stamina":83,"finishing":84}'::jsonb),
(13, '이승준', NULL, 1999, ARRAY['FW']::text[], 'B', 1, '', '예술가', NULL, '{"passing":85,"dribbling":84,"physical":73,"defense":72,"stamina":74,"finishing":86}'::jsonb),
(14, '서승찬', NULL, 1998, ARRAY['MF']::text[], 'B', 2, '', '다리가 정말 길다', NULL, '{"passing":75,"dribbling":82,"physical":79,"defense":78,"stamina":74,"finishing":80}'::jsonb),
(15, '최종범', NULL, 1999, ARRAY['MF']::text[], 'B', 3, '', '중원의 정령', 'manager', '{"passing":85,"dribbling":74,"physical":73,"defense":84,"stamina":75,"finishing":71}'::jsonb),
(16, '장천명', 0, 1999, ARRAY['DF']::text[], 'B', 4, '', '자아를 찾아가는자', NULL, '{"passing":85,"dribbling":84,"physical":70,"defense":75,"stamina":73,"finishing":69}'::jsonb),
(17, '박준서', 9, 2003, ARRAY['MF']::text[], 'B', 5, '', '플레이메이커', NULL, '{"passing":85,"dribbling":71,"physical":72,"defense":75,"stamina":74,"finishing":73}'::jsonb),
(18, '윤준영', 27, 2000, ARRAY['MF','GK']::text[], 'B', 6, '', '사춘기 아이', NULL, '{"passing":71,"dribbling":72,"physical":68,"defense":70,"stamina":81,"finishing":82}'::jsonb),
(19, '편현재', 4, 1999, ARRAY['MF']::text[], 'C', 1, '', '슛돌이', NULL, '{"passing":71,"dribbling":69,"physical":70,"defense":73,"stamina":74,"finishing":75}'::jsonb),
(20, '한민석', 5, 1999, ARRAY['DF','GK']::text[], 'C', 2, '', '개그맨', NULL, '{"passing":81,"dribbling":71,"physical":70,"defense":67,"stamina":68,"finishing":69}'::jsonb),
(21, '이민녕', NULL, 1999, ARRAY['MF']::text[], 'C', 3, '', 'SRG-FC 유니콘', NULL, '{"passing":68,"dribbling":66,"physical":67,"defense":72,"stamina":73,"finishing":74}'::jsonb),
(22, '박형진', NULL, 1998, ARRAY['MF']::text[], 'C', 4, '', '신규 플레이어', NULL, '{"passing":63,"dribbling":77,"physical":65,"defense":66,"stamina":76,"finishing":67}'::jsonb),
(23, '김형석', 26, 1999, ARRAY['DF']::text[], 'C', 5, '', '1게임은 잘함', NULL, '{"passing":78,"dribbling":75,"physical":63,"defense":66,"stamina":62,"finishing":64}'::jsonb),
(24, '장경우', 77, 1999, ARRAY['DF']::text[], 'C', 6, '', '탁병과는 다른 티어', NULL, '{"passing":69,"dribbling":59,"physical":70,"defense":73,"stamina":71,"finishing":60}'::jsonb),
(25, '조병찬', 22, 1999, ARRAY['GK','DF']::text[], 'D', 1, '', '절대적 플레이어 라이벌', NULL, '{"passing":64,"dribbling":63,"physical":62,"defense":75,"stamina":61,"finishing":65}'::jsonb),
(26, '탁성원', 99, 1999, ARRAY['DF']::text[], 'D', 2, '', '99번 절대적 플레이어', NULL, '{"passing":63,"dribbling":62,"physical":61,"defense":74,"stamina":60,"finishing":64}'::jsonb)
on conflict (id) do nothing;

-- =============================================================
-- 관리자 등록 방법 (이 SQL을 실행한 뒤, 별도로 진행하세요)
-- =============================================================
-- 1. Supabase 대시보드 > Authentication > Users > Add user 에서
--    관리자로 쓸 이메일/비밀번호로 유저를 만드세요.
-- 2. 그 유저의 UUID를 Users 목록에서 복사한 뒤, 아래 SQL의 '여기에-UUID-붙여넣기'를
--    실제 UUID로 바꿔서 SQL Editor에서 따로 실행하세요.
--
-- insert into admin_users (user_id) values ('여기에-UUID-붙여넣기');
-- 개발/데모용 샘플 데이터. 이름과 소개 문구는 모두 가상의 값이다.
-- migrations 를 순서대로 실행한 뒤에 실행한다.

insert into members (id, name, number, birth_year, positions, tier, intro, role, stats)
values
(1, '강민재', 7, 1999, ARRAY['MF','FW','DF']::text[], 'S', 'GOAT 그 자체', NULL, '{"passing":94,"dribbling":93,"physical":90,"defense":90,"stamina":92,"finishing":93}'::jsonb),
(2, '문도윤', 17, 1999, ARRAY['MF','FW','DF']::text[], 'S', '같은 팀하고 싶은 남자 1위', NULL, '{"passing":97,"dribbling":94,"physical":86,"defense":89,"stamina":87,"finishing":94}'::jsonb),
(3, '도경민', 6, 1998, ARRAY['MF','DF']::text[], 'S', '뚫을 수 없는 플레이어', NULL, '{"passing":90,"dribbling":86,"physical":91,"defense":94,"stamina":97,"finishing":90}'::jsonb),
(4, '천성우', 8, 1998, ARRAY['MF','FW','DF']::text[], 'S', '육각형 플레이어', 'viceCaptain', '{"passing":94,"dribbling":92,"physical":87,"defense":91,"stamina":91,"finishing":84}'::jsonb),
(5, '남기현', 21, 1998, ARRAY['DF']::text[], 'S', '수비의 천재', NULL, '{"passing":89,"dribbling":86,"physical":87,"defense":98,"stamina":93,"finishing":85}'::jsonb),
(6, '유건우', 11, 2000, ARRAY['FW','GK']::text[], 'S', '미친 골 결정능력 보유자', NULL, '{"passing":89,"dribbling":95,"physical":89,"defense":86,"stamina":85,"finishing":98}'::jsonb),
(7, '백시온', 1, 1999, ARRAY['FW']::text[], 'A', '주사위형 플레이어', 'creator', '{"passing":75,"dribbling":90,"physical":90,"defense":87,"stamina":87,"finishing":91}'::jsonb),
(8, '신우진', 10, 1999, ARRAY['MF','DF']::text[], 'A', 'S급 서포터', 'captain', '{"passing":95,"dribbling":84,"physical":81,"defense":90,"stamina":89,"finishing":84}'::jsonb),
(9, '임하준', 66, 1999, ARRAY['MF','FW']::text[], 'B', '성장형 괴물', NULL, '{"passing":83,"dribbling":86,"physical":81,"defense":79,"stamina":74,"finishing":88}'::jsonb),
(10, '차무진', NULL, 1999, ARRAY['FW']::text[], 'B', '이름부터 무진 ㄷㄷ', NULL, '{"passing":86,"dribbling":85,"physical":82,"defense":80,"stamina":79,"finishing":83}'::jsonb),
(11, '봉진우', 3, 1999, ARRAY['DF']::text[], 'A', '수비? 쉽다..', NULL, '{"passing":87,"dribbling":83,"physical":85,"defense":94,"stamina":84,"finishing":82}'::jsonb),
(12, '배서진', 13, 2003, ARRAY['MF','FW']::text[], 'A', '성장형 괴물 추격자', NULL, '{"passing":75,"dribbling":87,"physical":86,"defense":86,"stamina":90,"finishing":86}'::jsonb),
(13, '구본혁', NULL, 1999, ARRAY['FW']::text[], 'B', '예술가', NULL, '{"passing":83,"dribbling":84,"physical":80,"defense":79,"stamina":75,"finishing":95}'::jsonb),
(14, '권예준', NULL, 1998, ARRAY['MF']::text[], 'A', '다리가 정말 길다', NULL, '{"passing":87,"dribbling":88,"physical":92,"defense":92,"stamina":79,"finishing":83}'::jsonb),
(15, '곽동하', NULL, 1999, ARRAY['MF']::text[], 'B', '중원의 정령', 'manager', '{"passing":90,"dribbling":87,"physical":78,"defense":84,"stamina":73,"finishing":80}'::jsonb),
(16, '석태민', 0, 1999, ARRAY['DF']::text[], 'B', '자아를 찾아가는자', NULL, '{"passing":91,"dribbling":78,"physical":76,"defense":88,"stamina":76,"finishing":77}'::jsonb),
(17, '류태오', 9, 2003, ARRAY['MF']::text[], 'B', '플레이메이커', NULL, '{"passing":84,"dribbling":81,"physical":82,"defense":83,"stamina":80,"finishing":74}'::jsonb),
(18, '전승현', 27, 2000, ARRAY['MF','GK']::text[], 'C', '사춘기 아이', NULL, '{"passing":76,"dribbling":77,"physical":76,"defense":77,"stamina":79,"finishing":82}'::jsonb),
(19, '육상현', 4, 1999, ARRAY['MF']::text[], 'C', '슛돌이', NULL, '{"passing":77,"dribbling":77,"physical":78,"defense":76,"stamina":80,"finishing":80}'::jsonb),
(20, '변재원', 5, 1999, ARRAY['DF','GK']::text[], 'C', '개그맨', NULL, '{"passing":93,"dribbling":81,"physical":72,"defense":79,"stamina":73,"finishing":73}'::jsonb),
(21, '표지성', NULL, 1999, ARRAY['MF']::text[], 'C', 'SRG-FC 유니콘', NULL, '{"passing":83,"dribbling":81,"physical":78,"defense":76,"stamina":74,"finishing":69}'::jsonb),
(22, '황도현', NULL, 1998, ARRAY['MF']::text[], 'A', '신규 플레이어', NULL, '{"passing":81,"dribbling":89,"physical":80,"defense":85,"stamina":87,"finishing":89}'::jsonb),
(23, '노지환', 26, 1999, ARRAY['DF']::text[], 'C', '1게임은 잘함', NULL, '{"passing":84,"dribbling":81,"physical":78,"defense":77,"stamina":70,"finishing":72}'::jsonb),
(24, '하윤석', 77, 1999, ARRAY['DF']::text[], 'C', '막내과는 다른 티어', NULL, '{"passing":75,"dribbling":75,"physical":77,"defense":77,"stamina":80,"finishing":72}'::jsonb),
(25, '엄재희', 22, 1999, ARRAY['GK','DF']::text[], 'D', '절대적 플레이어 라이벌', NULL, '{"passing":79,"dribbling":77,"physical":75,"defense":73,"stamina":71,"finishing":69}'::jsonb),
(26, '피성준', 99, 1999, ARRAY['DF']::text[], 'D', '99번 절대적 플레이어', NULL, '{"passing":80,"dribbling":78,"physical":75,"defense":73,"stamina":71,"finishing":66}'::jsonb)
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('members', 'id'), (select max(id) from members));

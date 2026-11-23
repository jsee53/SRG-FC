-- 작성자/연결 계정 이메일이 anon 조회로 노출되던 문제 수정
-- 테이블 SELECT 권한이 있으면 컬럼 단위 revoke가 적용되지 않아서, 테이블 권한을 회수하고 공개할 컬럼만 다시 grant

revoke select on posts from anon, authenticated;
grant select (id, author_id, title, content, is_notice, created_at) on posts to anon, authenticated;

revoke select on comments from anon, authenticated;
grant select (id, post_id, author_id, content, created_at) on comments to anon, authenticated;

revoke select on members from anon, authenticated;
grant select (id, name, number, birth_year, positions, tier, intro, role, stats, user_id, updated_at) on members to anon, authenticated;

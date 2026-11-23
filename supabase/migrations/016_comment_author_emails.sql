-- 015 적용 후 게시판 댓글 수 조회가 실패하던 문제 수정
-- count(*) 집계는 컬럼 단위 권한으로 동작하지 않아서, 댓글 작성자 이메일을 별도 테이블로 분리하고
-- comments 테이블 SELECT 권한을 원복

create table if not exists comment_author_emails (
  comment_id bigint primary key references comments (id) on delete cascade,
  author_email text not null
);
alter table comment_author_emails enable row level security;

insert into comment_author_emails (comment_id, author_email)
select id, author_email from comments where author_email is not null
on conflict (comment_id) do nothing;

alter table comments drop column if exists author_email;

grant select on comments to anon, authenticated;

create policy "only admins can view comment author emails"
  on comment_author_emails for select
  using (exists (select 1 from admin_users where user_id = auth.uid()));
create policy "comment authors can record their own email"
  on comment_author_emails for insert
  with check (exists (select 1 from comments where id = comment_id and author_id = auth.uid()));

-- 게시글/댓글 좋아요, 본인 글 수정

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

-- with check가 없으면 글을 수정하면서 is_notice를 true로 바꿀 수 있어서 insert와 같은 조건을 넣음
alter policy "authors can update their own posts"
  on posts
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id and (is_notice = false or is_notice_manager()));

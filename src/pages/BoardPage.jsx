import { useEffect, useState } from 'react'
import { usePosts } from '../hooks/usePosts'
import { resolveAuthorName } from '../utils/authorName'
import PostForm from '../components/PostForm'
import PostDetail from '../components/PostDetail'

export default function BoardPage({ members, session, isAdmin, canPostNotice, onRequireLogin }) {
  const { posts, loading, error, createPost, updatePost, deletePost, toggleLike } = usePosts()
  const [showForm, setShowForm] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [editingPost, setEditingPost] = useState(null)

  // 좋아요/수정 후 posts가 새로 로드되면 열려있는 상세보기도 최신 값으로 갱신.
  // 삭제됐다면(더 이상 목록에 없으면) 상세보기를 닫음
  useEffect(() => {
    if (!selectedPost) return
    const updated = posts.find((p) => p.id === selectedPost.id)
    setSelectedPost(updated ?? null)
  }, [posts])

  function handleWriteClick() {
    if (!session) {
      onRequireLogin()
      return
    }
    setShowForm(true)
  }

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center justify-between py-2">
        <h2 className="text-sm font-semibold text-slate-400">게시판</h2>
        <button
          type="button"
          onClick={handleWriteClick}
          className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-emerald-950 transition-colors hover:bg-emerald-300"
        >
          글쓰기
        </button>
      </div>

      {loading && <p className="py-16 text-center text-slate-400">불러오는 중...</p>}
      {error && <p className="py-16 text-center text-red-400">게시글을 불러오지 못했어요.</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelectedPost(post)}
              className={`rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:brightness-110 ${
                post.isNotice
                  ? 'bg-amber-400/10 ring-2 ring-amber-400/60 shadow-[0_0_0_4px_rgba(251,191,36,0.15)]'
                  : 'bg-slate-800/60 ring-1 ring-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                {post.isNotice && (
                  <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                    공지
                  </span>
                )}
                <p className="font-semibold text-white">{post.title}</p>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {resolveAuthorName(members, post.authorId, post.authorEmail)} ·{' '}
                {new Date(post.createdAt).toLocaleDateString('ko-KR')} · 댓글 {post.commentCount} · 좋아요{' '}
                {post.likedUserIds.length}
              </p>
            </button>
          ))}
          {posts.length === 0 && <p className="py-16 text-center text-slate-400">아직 글이 없어요.</p>}
        </div>
      )}

      {showForm && (
        <PostForm
          canPostNotice={canPostNotice}
          onClose={() => setShowForm(false)}
          onSubmit={(title, content, isNotice) => createPost(session, title, content, isNotice)}
        />
      )}

      {editingPost && (
        <PostForm
          post={editingPost}
          canPostNotice={canPostNotice}
          onClose={() => setEditingPost(null)}
          onSubmit={(title, content, isNotice) => updatePost(editingPost.id, title, content, isNotice)}
        />
      )}

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          members={members}
          session={session}
          isAdmin={isAdmin}
          onClose={() => setSelectedPost(null)}
          onDeletePost={deletePost}
          onEditPost={(post) => {
            setSelectedPost(null)
            setEditingPost(post)
          }}
          onToggleLike={toggleLike}
          onRequireLogin={onRequireLogin}
        />
      )}
    </div>
  )
}

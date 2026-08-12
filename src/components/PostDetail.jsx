import { useRef, useState } from 'react'
import { resolveAuthorName } from '../utils/authorName'
import { useComments } from '../hooks/useComments'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useDismissAnimation } from '../hooks/useDismissAnimation'
import { inputClass } from './memberFormFields'
import CommentList from './CommentList'

export default function PostDetail({
  post,
  members,
  session,
  isAdmin,
  onClose,
  onDeletePost,
  onEditPost,
  onToggleLike,
  onRequireLogin,
}) {
  const { comments, loading, createComment, deleteComment, toggleLike } = useComments(post.id)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const sheetRef = useRef(null)
  const touchStart = useRef(null)

  useLockBodyScroll()
  const { closing, requestClose } = useDismissAnimation(onClose)

  function handleTouchStart(e) {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY, scrollTop: sheetRef.current?.scrollTop ?? 0 }
  }

  function handleTouchEnd(e) {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    const startScrollTop = touchStart.current.scrollTop
    touchStart.current = null

    // 맨 위까지 스크롤된 상태에서 아래로 당기면 닫기
    if (dy > 80 && dy > Math.abs(dx) * 1.5 && startScrollTop <= 0) {
      requestClose()
    }
  }

  const canDeletePost = isAdmin || session?.user.id === post.authorId
  const canEditPost = session?.user.id === post.authorId
  const isLiked = Boolean(session) && post.likedUserIds.includes(session.user.id)

  function handleTogglePostLike() {
    if (!session) {
      onRequireLogin()
      return
    }
    onToggleLike(session, post.id, isLiked)
  }

  async function handleSubmitComment(e) {
    e.preventDefault()
    if (!session) {
      onRequireLogin()
      return
    }
    setSubmitting(true)
    await createComment(session, content)
    setSubmitting(false)
    setContent('')
  }

  async function handleDeletePost() {
    const { error } = await onDeletePost(post.id)
    if (!error) requestClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 ${
        closing ? '[animation:overlay-out_0.2s_ease-out_forwards]' : '[animation:overlay-in_0.15s_ease-out]'
      }`}
      onClick={requestClose}
    >
      <div
        ref={sheetRef}
        className={`max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-slate-800 p-5 pb-8 ${
          closing ? '[animation:sheet-out_0.2s_ease-out_forwards]' : '[animation:sheet-in_0.2s_ease-out]'
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{post.title}</h2>
          <button
            type="button"
            onClick={requestClose}
            className="flex-none rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            닫기
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {resolveAuthorName(members, post.authorId, post.authorEmail)} ·{' '}
            {new Date(post.createdAt).toLocaleDateString('ko-KR')}
          </p>
          <div className="flex flex-none gap-2 text-xs">
            {canEditPost && (
              <button type="button" onClick={() => onEditPost(post)} className="text-slate-400 hover:text-white">
                수정
              </button>
            )}
            {canDeletePost && (
              <button type="button" onClick={handleDeletePost} className="text-slate-500 hover:text-red-400">
                글 삭제
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-200">{post.content}</p>

        <button
          type="button"
          onClick={handleTogglePostLike}
          className={`mt-2 text-sm transition-colors ${isLiked ? 'text-rose-400' : 'text-slate-500 hover:text-rose-300'}`}
        >
          {isLiked ? '♥' : '♡'} 좋아요 {post.likedUserIds.length}
        </button>

        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="mb-2 text-sm font-semibold text-slate-300">댓글 {comments.length}</p>
          {loading ? (
            <p className="py-4 text-center text-sm text-slate-400">불러오는 중...</p>
          ) : (
            <CommentList
              comments={comments}
              members={members}
              session={session}
              isAdmin={isAdmin}
              onDelete={deleteComment}
              onToggleLike={toggleLike}
              onRequireLogin={onRequireLogin}
            />
          )}

          {session ? (
            <form onSubmit={handleSubmitComment} className="mt-3 flex gap-2">
              <input
                required
                placeholder="댓글을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex-none rounded-full bg-emerald-400 px-4 py-1.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-40"
              >
                등록
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={onRequireLogin}
              className="mt-3 w-full rounded-full bg-white/10 py-2 text-sm text-slate-300 transition-colors hover:bg-white/20"
            >
              로그인하고 댓글 쓰기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

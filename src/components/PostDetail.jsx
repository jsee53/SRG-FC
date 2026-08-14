import { useRef, useState } from 'react'
import { resolveAuthorName } from '../utils/authorName'
import { useComments } from '../hooks/useComments'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useDismissAnimation } from '../hooks/useDismissAnimation'
import { useSwipeToClose } from '../hooks/useSwipeToClose'
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

  useLockBodyScroll()
  const { closing, requestClose } = useDismissAnimation(onClose)
  const { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel } = useSwipeToClose(sheetRef, requestClose)

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
      className={`fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-backdrop)] ${
        closing ? '[animation:overlay-out_0.22s_ease-in_forwards]' : '[animation:overlay-in_0.2s_ease-out]'
      }`}
      onClick={requestClose}
    >
      <div
        ref={sheetRef}
        className={`max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[var(--color-sheet)] p-5 pb-8 ${
          closing
            ? '[animation:sheet-out_0.22s_cubic-bezier(0.32,0.72,0,1)_forwards]'
            : '[animation:sheet-in_0.32s_cubic-bezier(0.32,0.72,0,1)]'
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{post.title}</h2>
          <button
            type="button"
            onClick={requestClose}
            className="flex-none rounded-full bg-[var(--color-surface-soft)] px-3.5 py-1.5 text-base text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)] hover:text-[var(--color-text)]"
          >
            닫기
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)]">
            {resolveAuthorName(members, post.authorId, post.authorEmail)} ·{' '}
            {new Date(post.createdAt).toLocaleDateString('ko-KR')}
          </p>
          <div className="flex flex-none gap-2 text-sm">
            {canEditPost && (
              <button type="button" onClick={() => onEditPost(post)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                수정
              </button>
            )}
            {canDeletePost && (
              <button type="button" onClick={handleDeletePost} className="text-[var(--color-text-faint)] hover:text-red-400">
                글 삭제
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-base text-[var(--color-text-soft)]">{post.content}</p>

        <button
          type="button"
          onClick={handleTogglePostLike}
          className={`mt-2 text-sm transition-colors ${isLiked ? 'text-rose-400' : 'text-[var(--color-text-faint)] hover:text-rose-300'}`}
        >
          {isLiked ? '♥' : '♡'} 좋아요 {post.likedUserIds.length}
        </button>

        <div className="mt-6 border-t border-[var(--color-border)] pt-4">
          <p className="mb-2 text-sm font-semibold text-[var(--color-text-soft)]">댓글 {comments.length}</p>
          {loading ? (
            <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">불러오는 중...</p>
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
                className="flex-none rounded-full bg-accent-400 px-4 py-1.5 text-sm font-semibold text-accent-950 transition-colors hover:bg-accent-300 disabled:opacity-40"
              >
                등록
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={onRequireLogin}
              className="mt-3 w-full rounded-full bg-[var(--color-surface-soft)] py-2 text-sm text-[var(--color-text-soft)] transition-colors hover:bg-[var(--color-surface-soft-hover)]"
            >
              로그인하고 댓글 쓰기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

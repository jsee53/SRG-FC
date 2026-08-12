import { resolveAuthorName } from '../utils/authorName'

export default function CommentList({ comments, members, session, isAdmin, onDelete, onToggleLike, onRequireLogin }) {
  if (comments.length === 0) {
    return <p className="py-4 text-center text-sm text-slate-400">아직 댓글이 없어요.</p>
  }

  function handleToggleLike(comment, isLiked) {
    if (!session) {
      onRequireLogin()
      return
    }
    onToggleLike(session, comment.id, isLiked)
  }

  return (
    <div className="flex flex-col gap-2">
      {comments.map((comment) => {
        const canDelete = isAdmin || session?.user.id === comment.authorId
        const isLiked = Boolean(session) && comment.likedUserIds.includes(session.user.id)
        return (
          <div key={comment.id} className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-emerald-300">
                {resolveAuthorName(members, comment.authorId, comment.authorEmail)}
              </p>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="text-xs text-slate-500 hover:text-red-400"
                >
                  삭제
                </button>
              )}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-200">{comment.content}</p>
            <button
              type="button"
              onClick={() => handleToggleLike(comment, isLiked)}
              className={`mt-1 text-xs transition-colors ${isLiked ? 'text-rose-400' : 'text-slate-500 hover:text-rose-300'}`}
            >
              {isLiked ? '♥' : '♡'} {comment.likedUserIds.length > 0 ? comment.likedUserIds.length : ''}
            </button>
          </div>
        )
      })}
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function mapRow(row) {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    content: row.content,
    createdAt: row.created_at,
    likedUserIds: (row.comment_likes ?? []).map((l) => l.user_id),
  }
}

export function useComments(postId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!postId) return
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('comments')
      .select('id, post_id, author_id, content, created_at, comment_likes(user_id)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      setError(fetchError)
    } else {
      setComments(data.map(mapRow))
    }
    setLoading(false)
  }, [postId])

  useEffect(() => {
    refetch()
  }, [refetch])

  // author_email은 comments 테이블이 아니라 별도 관리자 전용 테이블에 저장함(Phase 19) —
  // 댓글 자체는 성공했는데 이메일 기록만 실패하는 경우가 있어도(드묾) 댓글 작성 자체는
  // 이미 끝난 뒤라 사용자에게 보이는 동작에는 영향 없음
  const createComment = useCallback(async (session, content) => {
    const { data: inserted, error: insertError } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: session.user.id, content })
      .select('id')
      .single()

    if (insertError) return { error: insertError }

    await supabase.from('comment_author_emails').insert({ comment_id: inserted.id, author_email: session.user.email })
    await refetch()
    return { error: null }
  }, [postId, refetch])

  const deleteComment = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from('comments').delete().eq('id', id)
    if (!deleteError) {
      await refetch()
    }
    return { error: deleteError }
  }, [refetch])

  const toggleLike = useCallback(async (session, commentId, isLiked) => {
    const { error: likeError } = isLiked
      ? await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', session.user.id)
      : await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: session.user.id })

    if (!likeError) {
      await refetch()
    }
    return { error: likeError }
  }, [refetch])

  return { comments, loading, error, refetch, createComment, deleteComment, toggleLike }
}

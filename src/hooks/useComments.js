import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function mapRow(row) {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorEmail: row.author_email,
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
      .select('*, comment_likes(user_id)')
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

  const createComment = useCallback(async (session, content) => {
    const { error: insertError } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: session.user.id,
      author_email: session.user.email,
      content,
    })

    if (!insertError) {
      await refetch()
    }
    return { error: insertError }
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

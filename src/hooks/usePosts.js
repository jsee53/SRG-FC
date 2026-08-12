import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function mapRow(row) {
  return {
    id: row.id,
    authorId: row.author_id,
    authorEmail: row.author_email,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    isNotice: row.is_notice,
    commentCount: row.comments?.[0]?.count ?? 0,
    likedUserIds: (row.post_likes ?? []).map((l) => l.user_id),
  }
}

export function usePosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('*, comments(count), post_likes(user_id)')
      .order('is_notice', { ascending: false })
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError)
    } else {
      setPosts(data.map(mapRow))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const createPost = useCallback(async (session, title, content, isNotice) => {
    const { error: insertError } = await supabase.from('posts').insert({
      author_id: session.user.id,
      author_email: session.user.email,
      title,
      content,
      is_notice: isNotice,
    })

    if (!insertError) {
      await refetch()
    }
    return { error: insertError }
  }, [refetch])

  const updatePost = useCallback(async (id, title, content, isNotice) => {
    const { error: updateError } = await supabase
      .from('posts')
      .update({ title, content, is_notice: isNotice })
      .eq('id', id)

    if (!updateError) {
      await refetch()
    }
    return { error: updateError }
  }, [refetch])

  const deletePost = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from('posts').delete().eq('id', id)
    if (!deleteError) {
      await refetch()
    }
    return { error: deleteError }
  }, [refetch])

  const toggleLike = useCallback(async (session, postId, isLiked) => {
    const { error: likeError } = isLiked
      ? await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', session.user.id)
      : await supabase.from('post_likes').insert({ post_id: postId, user_id: session.user.id })

    if (!likeError) {
      await refetch()
    }
    return { error: likeError }
  }, [refetch])

  return { posts, loading, error, refetch, createPost, updatePost, deletePost, toggleLike }
}

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [canManageEvents, setCanManageEvents] = useState(false)
  const [canPostNotice, setCanPostNotice] = useState(false)
  const [canManageStats, setCanManageStats] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setIsAdmin(false)
      setCanManageEvents(false)
      setCanPostNotice(false)
      setCanManageStats(false)
      return
    }

    let cancelled = false
    supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(Boolean(data))
      })

    supabase
      .from('event_managers')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setCanManageEvents(Boolean(data))
      })

    supabase
      .from('notice_managers')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setCanPostNotice(Boolean(data))
      })

    supabase
      .from('stats_managers')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setCanManageStats(Boolean(data))
      })

    return () => {
      cancelled = true
    }
  }, [session])

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { session: null, error }

    // 이미 가입된 이메일이면 에러 없이 identities가 빈 가짜 유저를 반환함 (열거 공격 방지)
    if (data.user && data.user.identities?.length === 0) {
      return { session: null, error: { message: 'duplicate_email' } }
    }

    return { session: data.session ?? null, error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    session,
    authLoading,
    isAdmin,
    canManageEvents: isAdmin || canManageEvents,
    canPostNotice: isAdmin || canPostNotice,
    canManageStats: isAdmin || canManageStats,
    signIn,
    signUp,
    signOut,
  }
}

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [canManageEvents, setCanManageEvents] = useState(false)
  const [canPostNotice, setCanPostNotice] = useState(false)

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

    // 이미 가입된(확인 완료) 이메일로 다시 가입하면 supabase가 열거 공격 방지를 위해
    // 에러 없이 "가짜" 유저를 돌려주는데, identities가 빈 배열인 것으로만 구분 가능함
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
    signIn,
    signUp,
    signOut,
  }
}

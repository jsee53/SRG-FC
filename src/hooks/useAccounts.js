import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function mapRow(row) {
  return {
    userId: row.user_id,
    email: row.email,
    memberId: row.member_id,
    memberName: row.member_name,
    isEventManager: row.is_event_manager,
    isNoticeManager: row.is_notice_manager,
    isStatsManager: row.is_stats_manager,
  }
}

// 관리자 전용: 가입된 계정 목록 + 연결된 멤버 이름 + 일정 등록 권한 여부.
// admin_list_accounts RPC가 호출자 관리자 여부를 직접 검사하므로 여기서 따로 막을 필요 없음
export function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase.rpc('admin_list_accounts')
    if (fetchError) {
      setError(fetchError)
    } else {
      setAccounts(data.map(mapRow))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const grantEventManager = useCallback(async (userId) => {
    const { error: grantError } = await supabase.from('event_managers').insert({ user_id: userId })
    if (!grantError) {
      await refetch()
    }
    return { error: grantError }
  }, [refetch])

  const revokeEventManager = useCallback(async (userId) => {
    const { error: revokeError } = await supabase.from('event_managers').delete().eq('user_id', userId)
    if (!revokeError) {
      await refetch()
    }
    return { error: revokeError }
  }, [refetch])

  const grantNoticeManager = useCallback(async (userId) => {
    const { error: grantError } = await supabase.from('notice_managers').insert({ user_id: userId })
    if (!grantError) {
      await refetch()
    }
    return { error: grantError }
  }, [refetch])

  const revokeNoticeManager = useCallback(async (userId) => {
    const { error: revokeError } = await supabase.from('notice_managers').delete().eq('user_id', userId)
    if (!revokeError) {
      await refetch()
    }
    return { error: revokeError }
  }, [refetch])

  const grantStatsManager = useCallback(async (userId) => {
    const { error: grantError } = await supabase.from('stats_managers').insert({ user_id: userId })
    if (!grantError) {
      await refetch()
    }
    return { error: grantError }
  }, [refetch])

  const revokeStatsManager = useCallback(async (userId) => {
    const { error: revokeError } = await supabase.from('stats_managers').delete().eq('user_id', userId)
    if (!revokeError) {
      await refetch()
    }
    return { error: revokeError }
  }, [refetch])

  return {
    accounts,
    loading,
    error,
    refetch,
    grantEventManager,
    revokeEventManager,
    grantNoticeManager,
    revokeNoticeManager,
    grantStatsManager,
    revokeStatsManager,
  }
}

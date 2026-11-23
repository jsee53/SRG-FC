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

// 관리자 전용. 권한 검사는 admin_list_accounts RPC에서 함
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

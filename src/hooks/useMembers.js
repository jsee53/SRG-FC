import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    number: row.number,
    birthYear: row.birth_year,
    positions: row.positions ?? [],
    tier: row.tier,
    intro: row.intro ?? '',
    role: row.role ?? undefined,
    stats: row.stats,
    userId: row.user_id ?? null,
    linkedEmail: row.linked_email ?? null,
  }
}

export function useMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const retryCountRef = useRef(0)

  // useCallback으로 고정된 함수라 아래 useEffect 의존성 배열이 매 렌더마다 바뀌지 않음
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase.from('members').select('*')
    if (fetchError) {
      setError(fetchError)
    } else {
      setMembers(data.map(mapRow))
      retryCountRef.current = 0
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  // PWA로 열었을 때 세션 복구보다 이 요청이 먼저 나가는 등 타이밍 문제로 최초 로딩이
  // 실패하는 경우가 있어서, 잠깐 기다렸다가 몇 번 자동으로 다시 시도함(무한 재시도는 방지)
  useEffect(() => {
    if (!error || retryCountRef.current >= 3) return
    retryCountRef.current += 1
    const timer = setTimeout(() => refetch(), retryCountRef.current * 1500)
    return () => clearTimeout(timer)
  }, [error, refetch])

  const updateMember = useCallback(async (id, updates) => {
    const { error: updateError } = await supabase
      .from('members')
      .update({
        name: updates.name,
        number: updates.number,
        birth_year: updates.birthYear,
        positions: updates.positions,
        tier: updates.tier,
        intro: updates.intro,
        role: updates.role,
        stats: updates.stats,
      })
      .eq('id', id)

    if (!updateError) {
      await refetch()
    }
    return { error: updateError }
  }, [refetch])

  const addMember = useCallback(async (newMember) => {
    const { error: insertError } = await supabase.from('members').insert({
      name: newMember.name,
      number: newMember.number,
      birth_year: newMember.birthYear,
      positions: newMember.positions,
      tier: newMember.tier,
      intro: newMember.intro,
      role: newMember.role,
      stats: newMember.stats,
    })

    if (!insertError) {
      await refetch()
    }
    return { error: insertError }
  }, [refetch])

  const updateOwnMember = useCallback(async (id, updates) => {
    const { error: rpcError } = await supabase.rpc('update_own_member', {
      target_id: id,
      new_number: updates.number,
      new_birth_year: updates.birthYear,
      new_positions: updates.positions,
    })

    if (!rpcError) {
      await refetch()
    }
    return { error: rpcError }
  }, [refetch])

  // "등급/능력치 수정" 권한만 있는 계정용 — tier/stats만 건드리는 좁은 함수를 통해서만 저장
  const updateMemberStats = useCallback(async (id, tier, stats) => {
    const { error: rpcError } = await supabase.rpc('update_member_stats', {
      target_id: id,
      new_tier: tier,
      new_stats: stats,
    })

    if (!rpcError) {
      await refetch()
    }
    return { error: rpcError }
  }, [refetch])

  const claimMember = useCallback(async (id) => {
    const { error: rpcError } = await supabase.rpc('claim_member', { target_id: id })
    if (!rpcError) {
      await refetch()
    }
    return { error: rpcError }
  }, [refetch])

  // 관리자가 계정-멤버 연결을 끊음 (관리자는 members를 자유롭게 수정할 수 있는 기존 RLS 정책을 그대로 씀)
  const unlinkMember = useCallback(async (id) => {
    const { error: unlinkError } = await supabase
      .from('members')
      .update({ user_id: null, linked_email: null })
      .eq('id', id)

    if (!unlinkError) {
      await refetch()
    }
    return { error: unlinkError }
  }, [refetch])

  const deleteMember = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from('members').delete().eq('id', id)
    if (!deleteError) {
      await refetch()
    }
    return { error: deleteError }
  }, [refetch])

  return {
    members,
    loading,
    error,
    refetch,
    updateMember,
    addMember,
    updateOwnMember,
    updateMemberStats,
    claimMember,
    unlinkMember,
    deleteMember,
  }
}

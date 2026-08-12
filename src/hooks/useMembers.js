import { useCallback, useEffect, useState } from 'react'
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

  // useCallback으로 고정된 함수라 아래 useEffect 의존성 배열이 매 렌더마다 바뀌지 않음
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase.from('members').select('*')
    if (fetchError) {
      setError(fetchError)
    } else {
      setMembers(data.map(mapRow))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

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
    claimMember,
    unlinkMember,
    deleteMember,
  }
}

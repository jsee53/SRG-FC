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
    rank: row.rank,
    photo: row.photo ?? '',
    intro: row.intro ?? '',
    role: row.role ?? undefined,
    stats: row.stats,
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
        rank: updates.rank,
        photo: updates.photo,
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

  return { members, loading, error, refetch, updateMember }
}

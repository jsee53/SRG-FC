import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function mapRow(row) {
  return {
    id: row.id,
    eventId: row.event_id,
    matchId: row.match_id,
    teamIndex: row.team_index,
    voterId: row.voter_id,
    votedAttendeeId: row.voted_attendee_id,
  }
}

// 전체 투표를 한 번에 들고 있음 (클럽 규모가 작아 이벤트별로 나눠 불러올 필요가 없음) —
// 개인정보 화면의 "베스트 플레이어 받은 횟수" 집계와 일정 탭의 경기별 투표 UI가 이 데이터를 같이 씀
export function useBestPlayerVotes() {
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase.from('event_best_player_votes').select('*')
    if (fetchError) {
      setError(fetchError)
    } else {
      setVotes(data.map(mapRow))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const castVote = useCallback(async (matchId, attendeeId) => {
    const { error: rpcError } = await supabase.rpc('cast_best_player_vote', {
      target_match_id: matchId,
      target_attendee_id: attendeeId,
    })
    if (!rpcError) {
      await refetch()
    }
    return { error: rpcError }
  }, [refetch])

  const retractVote = useCallback(async (matchId) => {
    const { error: rpcError } = await supabase.rpc('retract_best_player_vote', { target_match_id: matchId })
    if (!rpcError) {
      await refetch()
    }
    return { error: rpcError }
  }, [refetch])

  return { votes, loading, error, refetch, castVote, retractVote }
}

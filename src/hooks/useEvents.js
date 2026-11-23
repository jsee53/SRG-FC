import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

function mapRow(row) {
  return {
    id: row.id,
    eventDate: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    confirmed: row.confirmed,
    createdBy: row.created_by,
    attendees: (row.event_attendees ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      memberId: a.member_id,
      tier: a.tier,
    })),
    matches: (row.event_matches ?? [])
      .map((m) => ({
        id: m.id,
        matchNumber: m.match_number,
        assignments: (m.match_team_assignments ?? []).map((t) => ({
          attendeeId: t.attendee_id,
          teamIndex: t.team_index,
        })),
      }))
      .sort((a, b) => a.matchNumber - b.matchNumber),
  }
}

async function saveLocationIfNew(location) {
  if (!location) return
  await supabase.from('event_locations').upsert({ name: location }, { onConflict: 'name', ignoreDuplicates: true })
}

// attendees: [{ name, memberId, tier }] (용병은 memberId null, tier로 밸런싱)
// 통째로 재생성하면 cascade로 팀 배정/투표가 지워지므로 빠진 사람만 삭제, 새 사람만 추가함
// 동일인 판정: 멤버는 member_id, 용병은 이름
async function syncAttendees(eventId, attendees) {
  const { data: existing, error: fetchError } = await supabase
    .from('event_attendees')
    .select('id, member_id, name, tier')
    .eq('event_id', eventId)
  if (fetchError) return { error: fetchError }

  const keyOfInput = (a) => (a.memberId != null ? `m:${a.memberId}` : `x:${a.name}`)
  const keyOfRow = (row) => (row.member_id != null ? `m:${row.member_id}` : `x:${row.name}`)

  const existingByKey = new Map(existing.map((row) => [keyOfRow(row), row]))
  const nextKeys = new Set(attendees.map(keyOfInput))

  const toDelete = existing.filter((row) => !nextKeys.has(keyOfRow(row))).map((row) => row.id)
  const toInsert = []
  const toUpdate = []
  for (const a of attendees) {
    const row = existingByKey.get(keyOfInput(a))
    if (!row) {
      toInsert.push(a)
    } else if ((a.tier ?? null) !== (row.tier ?? null)) {
      toUpdate.push({ id: row.id, tier: a.tier ?? null })
    }
  }

  if (toDelete.length > 0) {
    const { error } = await supabase.from('event_attendees').delete().in('id', toDelete)
    if (error) return { error }
  }
  if (toInsert.length > 0) {
    const { error } = await supabase.from('event_attendees').insert(
      toInsert.map((a) => ({ event_id: eventId, name: a.name, member_id: a.memberId ?? null, tier: a.tier ?? null }))
    )
    if (error) return { error }
  }
  for (const u of toUpdate) {
    const { error } = await supabase.from('event_attendees').update({ tier: u.tier }).eq('id', u.id)
    if (error) return { error }
  }
  return { error: null }
}

export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // refetch마다 loading을 켜면 목록이 다시 그려져 펼친 카드 state가 초기화됨. 최초 로딩에만 씀
  const hasLoadedOnce = useRef(false)
  const retryCountRef = useRef(0)

  const refetch = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true)
    setError(null)
    // 종료 시간이 지난 경기 자동 성사 처리. 실패해도 무시
    await supabase.rpc('auto_confirm_passed_events')
    const { data, error: fetchError } = await supabase
      .from('events')
      .select(
        '*, event_attendees(id, name, member_id, tier), event_matches(id, match_number, match_team_assignments(attendee_id, team_index))'
      )
      .order('event_date', { ascending: false })

    if (fetchError) {
      setError(fetchError)
    } else {
      setEvents(data.map(mapRow))
      hasLoadedOnce.current = true
      retryCountRef.current = 0
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  // PWA 진입 시 최초 로딩이 실패하는 경우가 있어 몇 번 재시도함 (useMembers와 동일)
  useEffect(() => {
    if (!error || retryCountRef.current >= 3) return
    retryCountRef.current += 1
    const timer = setTimeout(() => refetch(), retryCountRef.current * 1500)
    return () => clearTimeout(timer)
  }, [error, refetch])

  const createEvent = useCallback(async (session, eventDate, startTime, endTime, location, attendees) => {
    const { data: event, error: insertError } = await supabase
      .from('events')
      .insert({
        event_date: eventDate,
        start_time: startTime || null,
        end_time: endTime || null,
        location: location || null,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (insertError) return { error: insertError }

    const { error: attendeesError } = await syncAttendees(event.id, attendees)
    if (attendeesError) return { error: attendeesError }

    await saveLocationIfNew(location)
    await refetch()
    return { error: null }
  }, [refetch])

  const updateEvent = useCallback(async (id, eventDate, startTime, endTime, location, attendees) => {
    const { error: updateError } = await supabase
      .from('events')
      .update({ event_date: eventDate, start_time: startTime || null, end_time: endTime || null, location: location || null })
      .eq('id', id)

    if (updateError) return { error: updateError }

    const { error: attendeesError } = await syncAttendees(id, attendees)
    if (attendeesError) return { error: attendeesError }

    await saveLocationIfNew(location)
    await refetch()
    return { error: null }
  }, [refetch])

  const deleteEvent = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from('events').delete().eq('id', id)
    if (!deleteError) {
      await refetch()
    }
    return { error: deleteError }
  }, [refetch])

  const setEventConfirmed = useCallback(async (id, confirmed) => {
    const { error: rpcError } = await supabase.rpc('admin_set_event_confirmed', {
      target_event_id: id,
      is_confirmed: confirmed,
    })
    if (!rpcError) {
      await refetch()
    }
    return { error: rpcError }
  }, [refetch])

  // 경기가 없으면 1경기, 있으면 다음 번호 경기 생성
  const addMatch = useCallback(async (eventId) => {
    const { data, error: rpcError } = await supabase.rpc('add_event_match', { target_event_id: eventId })
    if (!rpcError) {
      await refetch()
    }
    return { matchId: data, error: rpcError }
  }, [refetch])

  // 한 명만 다른 팀으로 수동 이동
  const moveAttendeeTeam = useCallback(async (matchId, attendeeId, teamIndex) => {
    const { error } = await supabase
      .from('match_team_assignments')
      .update({ team_index: teamIndex })
      .eq('match_id', matchId)
      .eq('attendee_id', attendeeId)
    if (!error) {
      await refetch()
    }
    return { error }
  }, [refetch])

  // assignments: [{ attendeeId, teamIndex }], attendeeId는 기존 event_attendees 행
  const saveMatchTeams = useCallback(async (matchId, assignments) => {
    const { error: deleteError } = await supabase.from('match_team_assignments').delete().eq('match_id', matchId)
    if (deleteError) return { error: deleteError }

    if (assignments.length > 0) {
      const { error: insertError } = await supabase.from('match_team_assignments').insert(
        assignments.map((a) => ({ match_id: matchId, attendee_id: a.attendeeId, team_index: a.teamIndex }))
      )
      if (insertError) return { error: insertError }
    }

    await refetch()
    return { error: null }
  }, [refetch])

  // participants: [{ attendeeId?, name, memberId?, tier?, teamIndex }]
  // attendeeId가 없으면 event_attendees에 먼저 등록하고 받은 id로 배정 (경기별로 참석자가 다를 수 있음)
  const saveMatchParticipants = useCallback(async (eventId, matchId, participants) => {
    const toInsert = participants.filter((p) => p.attendeeId == null)
    let insertedRows = []
    if (toInsert.length > 0) {
      const { data, error: insertError } = await supabase
        .from('event_attendees')
        .insert(toInsert.map((p) => ({ event_id: eventId, name: p.name, member_id: p.memberId ?? null, tier: p.tier ?? null })))
        .select('id')
      if (insertError) return { error: insertError }
      insertedRows = data
    }

    let insertIndex = 0
    const assignments = participants.map((p) => {
      if (p.attendeeId != null) return { attendeeId: p.attendeeId, teamIndex: p.teamIndex }
      const row = insertedRows[insertIndex]
      insertIndex += 1
      return { attendeeId: row.id, teamIndex: p.teamIndex }
    })

    return saveMatchTeams(matchId, assignments)
  }, [saveMatchTeams])

  const resetMatchTeams = useCallback(async (matchId) => {
    const { error: rpcError } = await supabase.rpc('reset_match_teams', { target_match_id: matchId })
    if (!rpcError) {
      await refetch()
    }
    return { error: rpcError }
  }, [refetch])

  // 팀 배정/투표는 cascade로 삭제되고 남은 경기 번호는 RPC에서 다시 매김
  const deleteMatch = useCallback(async (matchId) => {
    const { error: rpcError } = await supabase.rpc('delete_event_match', { target_match_id: matchId })
    if (!rpcError) {
      await refetch()
    }
    return { error: rpcError }
  }, [refetch])

  return {
    events,
    loading,
    error,
    refetch,
    createEvent,
    updateEvent,
    deleteEvent,
    setEventConfirmed,
    addMatch,
    saveMatchParticipants,
    moveAttendeeTeam,
    resetMatchTeams,
    deleteMatch,
  }
}

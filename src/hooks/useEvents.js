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

// attendees: [{ name, memberId, tier }] — memberId는 로스터 멤버면 채워지고, 용병 자유 입력이면 null(+ 밸런싱용 tier)
// 주의: 이 함수는 기존 참석자 행을 지우고 새로 만들기 때문에, 이미 저장된 팀 배정/베스트 플레이어 투표는
// event_attendees 삭제에 cascade로 같이 지워짐(경기도 마찬가지)
async function saveLocationIfNew(location) {
  if (!location) return
  await supabase.from('event_locations').upsert({ name: location }, { onConflict: 'name', ignoreDuplicates: true })
}

async function replaceAttendees(eventId, attendees) {
  const { error: deleteError } = await supabase.from('event_attendees').delete().eq('event_id', eventId)
  if (deleteError) return { error: deleteError }

  if (attendees.length === 0) return { error: null }

  const { error: insertError } = await supabase.from('event_attendees').insert(
    attendees.map((a) => ({ event_id: eventId, name: a.name, member_id: a.memberId ?? null, tier: a.tier ?? null }))
  )
  return { error: insertError }
}

export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // 팀 짜기/경기 추가처럼 카드가 펼쳐진 채로 일어나는 동작들도 내부적으로 refetch를 도는데,
  // 매번 loading을 true로 켰다 끄면 그 사이 목록 전체가 잠깐 사라졌다가 다시 그려지면서
  // 펼쳐둔 카드의 로컬 state(펼침 여부 등)가 초기화돼버림 — 최초 로딩 때만 loading을 씀
  const hasLoadedOnce = useRef(false)
  const retryCountRef = useRef(0)

  const refetch = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('events')
      .select(
        '*, event_attendees(id, name, member_id, tier), event_matches(id, match_number, match_team_assignments(attendee_id, team_index))'
      )
      .order('event_date', { ascending: true })

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

  // PWA로 열었을 때 타이밍 문제로 최초 로딩이 실패하는 경우가 있어서, 잠깐 기다렸다가
  // 몇 번 자동으로 다시 시도함(무한 재시도는 방지) — useMembers.js와 같은 패턴
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

    const { error: attendeesError } = await replaceAttendees(event.id, attendees)
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

    const { error: attendeesError } = await replaceAttendees(id, attendees)
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

  // 아직 경기가 하나도 없는 이벤트에서 "팀 짜기"를 처음 누르면 1경기를 여기로 만들고,
  // 이미 경기가 있으면 "+ 경기추가"로 다음 번호의 경기를 만듦
  const addMatch = useCallback(async (eventId) => {
    const { data, error: rpcError } = await supabase.rpc('add_event_match', { target_event_id: eventId })
    if (!rpcError) {
      await refetch()
    }
    return { matchId: data, error: rpcError }
  }, [refetch])

  // assignments: [{ attendeeId, teamIndex }]
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

  const resetMatchTeams = useCallback(async (matchId) => {
    const { error: rpcError } = await supabase.rpc('reset_match_teams', { target_match_id: matchId })
    if (!rpcError) {
      await refetch()
    }
    return { error: rpcError }
  }, [refetch])

  // 경기 자체를 삭제 (팀 초기화와 달리 경기 탭 자체가 없어짐) — cascade로 팀 배정/투표도 같이 삭제되고,
  // 남은 경기 번호는 RPC 안에서 순서대로 다시 매겨짐(예: 2경기 삭제하면 3경기가 2경기로)
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
    saveMatchTeams,
    resetMatchTeams,
    deleteMatch,
  }
}

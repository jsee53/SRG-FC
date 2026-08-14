import { useCallback, useEffect, useState } from 'react'
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
      teamIndex: a.team_index,
    })),
  }
}

// attendees: [{ name, memberId, tier }] — memberId는 로스터 멤버면 채워지고, 용병 자유 입력이면 null(+ 밸런싱용 tier)
// 주의: 이 함수는 기존 참석자 행을 지우고 새로 만들기 때문에, 이미 저장된 team_index/베스트 플레이어 투표는 초기화됨
// 다음 일정 등록 때 드롭다운으로 재사용할 수 있게, 새 장소 이름이면 저장해둠
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

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('events')
      .select('*, event_attendees(id, name, member_id, tier, team_index)')
      .order('event_date', { ascending: true })

    if (fetchError) {
      setError(fetchError)
    } else {
      setEvents(data.map(mapRow))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

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

  // assignments: [{ attendeeId, teamIndex }]
  const saveEventTeams = useCallback(async (assignments) => {
    const results = await Promise.all(
      assignments.map(({ attendeeId, teamIndex }) =>
        supabase.from('event_attendees').update({ team_index: teamIndex }).eq('id', attendeeId)
      )
    )
    const failed = results.find((r) => r.error)
    if (!failed) {
      await refetch()
    }
    return { error: failed?.error ?? null }
  }, [refetch])

  const resetEventTeams = useCallback(async (eventId) => {
    const { error: rpcError } = await supabase.rpc('reset_event_teams', { target_event_id: eventId })
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
    saveEventTeams,
    resetEventTeams,
  }
}

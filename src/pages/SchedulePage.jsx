import { useState } from 'react'
import EventForm from '../components/EventForm'
import EventCard from '../components/EventCard'
import EventTeamBuilderModal from '../components/EventTeamBuilderModal'

export default function SchedulePage({
  members,
  session,
  myMemberId,
  isAdmin,
  canManageEvents,
  events,
  loading,
  error,
  votes,
  locations,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  onSetEventConfirmed,
  onSaveEventTeams,
  onResetEventTeams,
  onCastVote,
  onRetractVote,
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [buildingTeamsFor, setBuildingTeamsFor] = useState(null)

  async function handleDelete(id) {
    if (!window.confirm('이 일정을 삭제할까요?')) return
    await onDeleteEvent(id)
  }

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center justify-between py-2">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)]">경기 일정</h2>
        {canManageEvents && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-full bg-accent-400 px-3 py-1 text-xs font-semibold text-accent-950 transition-colors hover:bg-accent-300"
          >
            일정 등록
          </button>
        )}
      </div>

      {loading && <p className="py-16 text-center text-[var(--color-text-muted)]">불러오는 중...</p>}
      {error && <p className="py-16 text-center text-red-400">일정을 불러오지 못했어요.</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              session={session}
              myMemberId={myMemberId}
              isAdmin={isAdmin}
              canManageEvents={canManageEvents}
              votes={votes}
              onEdit={setEditingEvent}
              onDelete={handleDelete}
              onToggleConfirmed={(ev) => onSetEventConfirmed(ev.id, !ev.confirmed)}
              onBuildTeams={setBuildingTeamsFor}
              onResetTeams={onResetEventTeams}
              onCastVote={onCastVote}
              onRetractVote={onRetractVote}
            />
          ))}
          {events.length === 0 && <p className="py-16 text-center text-[var(--color-text-muted)]">등록된 일정이 없어요.</p>}
        </div>
      )}

      {showForm && (
        <EventForm
          members={members}
          locations={locations}
          onClose={() => setShowForm(false)}
          onSubmit={(date, start, end, location, attendees) =>
            onCreateEvent(session, date, start, end, location, attendees)
          }
        />
      )}

      {editingEvent && (
        <EventForm
          members={members}
          locations={locations}
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSubmit={(date, start, end, location, attendees) =>
            onUpdateEvent(editingEvent.id, date, start, end, location, attendees)
          }
        />
      )}

      {buildingTeamsFor && (
        <EventTeamBuilderModal
          event={buildingTeamsFor}
          members={members}
          onClose={() => setBuildingTeamsFor(null)}
          onSave={onSaveEventTeams}
        />
      )}
    </div>
  )
}

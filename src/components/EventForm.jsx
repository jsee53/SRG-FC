import { useRef, useState } from 'react'
import { inputClass, Select } from './memberFormFields'
import { TIME_OPTIONS, toHHMM } from '../utils/time'
import { TIER_ORDER, TIER_NAMES } from '../utils/tier'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { useDismissAnimation } from '../hooks/useDismissAnimation'
import { useSwipeToClose } from '../hooks/useSwipeToClose'
import AttendeeChip from './AttendeeChip'

const DEFAULT_MERC_TIER = 'C'

export default function EventForm({ members, locations, event, onClose, onSubmit }) {
  useLockBodyScroll()
  const { closing, requestClose } = useDismissAnimation(onClose)
  const sheetRef = useRef(null)
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeToClose(sheetRef, requestClose)
  const [eventDate, setEventDate] = useState(event?.eventDate ?? '')
  const [startTime, setStartTime] = useState(toHHMM(event?.startTime))
  const [endTime, setEndTime] = useState(toHHMM(event?.endTime))
  const [location, setLocation] = useState(event?.location ?? '')
  const [attendingIds, setAttendingIds] = useState(
    new Set((event?.attendees ?? []).filter((a) => a.memberId != null).map((a) => a.memberId))
  )
  const [extraName, setExtraName] = useState('')
  const [extraTier, setExtraTier] = useState(DEFAULT_MERC_TIER)
  const [extras, setExtras] = useState(
    (event?.attendees ?? [])
      .filter((a) => a.memberId == null)
      .map((a) => ({ name: a.name, tier: a.tier ?? DEFAULT_MERC_TIER }))
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name, 'ko'))

  function toggleMember(id) {
    setAttendingIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function addExtra() {
    const name = extraName.trim()
    if (!name) return
    setExtras((prev) => [...prev, { name, tier: extraTier }])
    setExtraName('')
  }

  function removeExtra(index) {
    setExtras((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const memberAttendees = members
      .filter((m) => attendingIds.has(m.id))
      .map((m) => ({ name: m.name, memberId: m.id }))
    const extraAttendees = extras.map(({ name, tier }) => ({ name, memberId: null, tier }))
    const { error: submitError } = await onSubmit(eventDate, startTime, endTime, location, [
      ...memberAttendees,
      ...extraAttendees,
    ])

    setSubmitting(false)
    if (submitError) {
      setError('저장에 실패했어요. 다시 시도해주세요.')
      return
    }
    requestClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/60 ${
        closing ? '[animation:overlay-out_0.22s_ease-in_forwards]' : '[animation:overlay-in_0.2s_ease-out]'
      }`}
      onClick={requestClose}
    >
      <div
        ref={sheetRef}
        className={`max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-slate-800 p-5 pb-8 ${
          closing
            ? '[animation:sheet-out_0.22s_cubic-bezier(0.32,0.72,0,1)_forwards]'
            : '[animation:sheet-in_0.32s_cubic-bezier(0.32,0.72,0,1)]'
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{event ? '일정 수정' : '일정 등록'}</h2>
          <div className="flex flex-none items-center gap-2">
            <button
              type="submit"
              form="event-form"
              disabled={submitting}
              className="rounded-full bg-emerald-400 px-3 py-1 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-40"
            >
              {submitting ? '저장 중...' : event ? '수정 완료' : '등록'}
            </button>
            <button
              type="button"
              onClick={requestClose}
              className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
            >
              닫기
            </button>
          </div>
        </div>

        <form id="event-form" onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            날짜
            <input
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-slate-400">
            장소 (선택, 목록에서 고르거나 직접 입력)
            <input
              list="event-location-options"
              placeholder="예: PEC"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            />
            <datalist id="event-location-options">
              {(locations ?? []).map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs text-slate-400">
              시작 시간 (선택)
              <Select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                <option value="">선택 안 함</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-400">
              종료 시간 (선택)
              <Select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                <option value="">선택 안 함</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div>
            <p className="mb-2 text-xs text-slate-400">
              참석자 선택 ({attendingIds.size}명{extras.length > 0 && ` + 용병 ${extras.length}명`})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {sortedMembers.map((member) => (
                <AttendeeChip
                  key={member.id}
                  member={member}
                  selected={attendingIds.has(member.id)}
                  onToggle={() => toggleMember(member.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-slate-400">용병 추가 (로스터에 없는 참석자)</p>
            <div className="flex gap-2">
              <input
                placeholder="이름"
                value={extraName}
                onChange={(e) => setExtraName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addExtra()
                  }
                }}
                className={`flex-1 ${inputClass}`}
              />
              <div className="w-20 flex-none">
                <Select value={extraTier} onChange={(e) => setExtraTier(e.target.value)}>
                  {TIER_ORDER.map((t) => (
                    <option key={t} value={t}>
                      {TIER_NAMES[t]}
                    </option>
                  ))}
                </Select>
              </div>
              <button
                type="button"
                onClick={addExtra}
                className="flex-none rounded-lg bg-white/10 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:bg-white/20"
              >
                추가
              </button>
            </div>
            {extras.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {extras.map((extra, i) => (
                  <button
                    key={`${extra.name}-${i}`}
                    type="button"
                    onClick={() => removeExtra(i)}
                    className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300 ring-1 ring-emerald-400/50"
                  >
                    {extra.name} ({TIER_NAMES[extra.tier]}) ✕
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-full bg-emerald-400 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-40"
          >
            {submitting ? '저장 중...' : event ? '수정 완료' : '등록'}
          </button>
        </form>
      </div>
    </div>
  )
}

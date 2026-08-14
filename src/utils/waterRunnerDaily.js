import { pickWaterRunner } from './waterRunner'

const DAILY_LOCAL_KEY = 'srgfc-water-runner-daily-v1'

function getKstDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function normalizeCandidates(candidates) {
  return (candidates ?? [])
    .filter(Boolean)
    .map((m) => ({
      id: String(m.id),
      name: m.name ?? m.label ?? `멤버 ${m.id}`,
    }))
}

function getApiBase() {
  const base = import.meta.env.VITE_WATER_RUNNER_API_BASE
  return typeof base === 'string' && base.trim() ? base.trim().replace(/\/$/, '') : ''
}

function readLocalDailyMap() {
  try {
    const raw = window.localStorage.getItem(DAILY_LOCAL_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeLocalDailyMap(map) {
  try {
    window.localStorage.setItem(DAILY_LOCAL_KEY, JSON.stringify(map))
  } catch {
    // ignore storage failures
  }
}

function toClientRecord(record, mode) {
  if (!record) return null
  return {
    dateKey: record.dateKey,
    winnerId: String(record.winnerId),
    winnerName: record.winnerName,
    attendeeIds: Array.isArray(record.attendeeIds) ? record.attendeeIds.map((id) => String(id)) : [],
    createdAt: record.createdAt,
    mode,
  }
}

async function getTodayFromRemote(apiBase, dateKey) {
  const res = await fetch(`${apiBase}/water-runner/today?dateKey=${encodeURIComponent(dateKey)}`)
  if (!res.ok) {
    throw new Error('오늘 결과 조회 실패')
  }

  const data = await res.json()
  return data?.record ? toClientRecord(data.record, 'remote') : null
}

async function drawTodayFromRemote(apiBase, dateKey, candidates) {
  const res = await fetch(`${apiBase}/water-runner/draw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateKey,
      candidates,
    }),
  })

  if (!res.ok) {
    throw new Error('오늘 추천 생성 실패')
  }

  const data = await res.json()
  return toClientRecord(data.record, 'remote')
}

function getTodayFromLocal(dateKey) {
  const map = readLocalDailyMap()
  return toClientRecord(map[dateKey] ?? null, 'local')
}

function drawTodayFromLocal(dateKey, candidates) {
  const map = readLocalDailyMap()
  const existing = map[dateKey]
  if (existing) {
    return toClientRecord(existing, 'local')
  }

  const picked = pickWaterRunner(candidates)
  if (!picked) {
    return null
  }

  const record = {
    dateKey,
    winnerId: picked.id,
    winnerName: picked.name,
    attendeeIds: candidates.map((c) => c.id),
    createdAt: new Date().toISOString(),
  }

  map[dateKey] = record
  writeLocalDailyMap(map)
  return toClientRecord(record, 'local')
}

export async function getTodayWaterRunner() {
  const dateKey = getKstDateKey()
  const apiBase = getApiBase()

  if (apiBase) {
    try {
      return await getTodayFromRemote(apiBase, dateKey)
    } catch {
      return getTodayFromLocal(dateKey)
    }
  }

  return getTodayFromLocal(dateKey)
}

export async function drawTodayWaterRunner(rawCandidates) {
  const dateKey = getKstDateKey()
  const candidates = normalizeCandidates(rawCandidates)
  if (candidates.length === 0) {
    return null
  }

  const apiBase = getApiBase()
  if (apiBase) {
    try {
      return await drawTodayFromRemote(apiBase, dateKey, candidates)
    } catch {
      return drawTodayFromLocal(dateKey, candidates)
    }
  }

  return drawTodayFromLocal(dateKey, candidates)
}

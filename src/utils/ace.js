import { members } from '../data/members'
import { calcOvr } from './calcOvr'

// 종합 능력치(OVR)가 가장 높은 멤버 — 스탯이 바뀌면 자동으로 갈아탐
export const aceMemberId = members.reduce(
  (best, m) => (calcOvr(m) > calcOvr(best) ? m : best),
  members[0],
).id

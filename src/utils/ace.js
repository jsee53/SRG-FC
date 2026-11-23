import { calcOvr } from './calcOvr'

// OVR 1위 멤버 id
export function getAceMemberId(members) {
  if (!members?.length) return null
  return members.reduce((best, m) => (calcOvr(m) > calcOvr(best) ? m : best), members[0]).id
}

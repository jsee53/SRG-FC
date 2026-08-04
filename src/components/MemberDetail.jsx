import { calcOvr } from '../utils/calcOvr'
import { calcAge } from '../utils/age'
import { TIER_STYLES } from '../utils/tierStyles'
import Avatar from './Avatar'
import RadarChart from './RadarChart'

export default function MemberDetail({ member, onClose }) {
  if (!member) return null
  const tier = TIER_STYLES[member.tier] ?? TIER_STYLES.D
  const ovr = calcOvr(member)
  const meta = [member.positions.join('/'), `${calcAge(member.birthYear)}세`, `OVR ${ovr}`]
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 [animation:overlay-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-slate-800 p-5 pb-8 [animation:sheet-in_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            닫기
          </button>
        </div>

        <div className="mt-2 flex items-center gap-4">
          <Avatar name={member.name} photo={member.photo} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{member.name}</h2>
              {member.number != null && <span className="text-slate-400">No.{member.number}</span>}
              <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${tier.badge}`}>{member.tier}</span>
            </div>
            <p className="mt-0.5 text-sm text-slate-400">{meta}</p>
          </div>
        </div>

        {member.intro && (
          <div className="mt-4 rounded-xl bg-white/5 px-4 py-3 text-center">
            <p className="text-base font-semibold italic" style={{ color: tier.accent }}>
              “{member.intro}”
            </p>
          </div>
        )}

        <div className="mt-4">
          <RadarChart stats={member.stats} color={tier.accent} />
        </div>
      </div>
    </div>
  )
}

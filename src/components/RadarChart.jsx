import { STAT_LABELS } from '../utils/tierStyles'

const AXES = Object.keys(STAT_LABELS)
const SIZE = 240
const CENTER = SIZE / 2
const RADIUS = 80

function pointAt(index, radius) {
  const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2
  return [CENTER + radius * Math.cos(angle), CENTER + radius * Math.sin(angle)]
}

function polygonAt(radius) {
  return AXES.map((_, i) => pointAt(i, radius).join(',')).join(' ')
}

export default function RadarChart({ stats, color = '#34d399' }) {
  const dataPoints = AXES.map((key, i) => pointAt(i, (stats[key] / 99) * RADIUS).join(',')).join(' ')

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-[280px]">
      {[0.25, 0.5, 0.75, 1].map((fraction) => (
        <polygon
          key={fraction}
          points={polygonAt(fraction * RADIUS)}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
        />
      ))}
      {AXES.map((key, i) => {
        const [x, y] = pointAt(i, RADIUS)
        return <line key={key} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      })}
      <polygon
        points={dataPoints}
        fill={color}
        fillOpacity="0.35"
        stroke={color}
        strokeWidth="2"
        style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        className="[animation:radar-in_0.5s_ease-out]"
      />
      {AXES.map((key, i) => {
        const [x, y] = pointAt(i, RADIUS + 24)
        return (
          <text key={key} x={x} y={y} fontSize="11" fill="#cbd5e1" textAnchor="middle" dominantBaseline="middle">
            {STAT_LABELS[key]} {stats[key]}
          </text>
        )
      })}
    </svg>
  )
}

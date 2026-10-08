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

// locked: 평등 모드에서 S급 외 멤버의 실제 능력치를 가리는 용도. 모양(육각형 격자)은 그대로 두고
// 데이터 다각형만 안개 낀 느낌의 점선으로, 축 라벨도 숫자 대신 "?"로 바꾸고 중앙에 자물쇠를 둠
export default function RadarChart({ stats, color = '#34d399', locked = false }) {
  const dataPoints = locked
    ? polygonAt(RADIUS * 0.55)
    : AXES.map((key, i) => pointAt(i, (stats[key] / 99) * RADIUS).join(',')).join(' ')
  const maxStat = locked ? null : Math.max(...AXES.map((key) => stats[key]))

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
        fillOpacity={locked ? 0.12 : 0.35}
        stroke={color}
        strokeWidth="2"
        strokeDasharray={locked ? '4 3' : undefined}
        style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        className={locked ? '' : '[animation:radar-in_0.35s_ease-out]'}
      />
      {locked && (
        <g transform={`translate(${CENTER - 12}, ${CENTER - 12})`} fill={color} opacity="0.9">
          <path d="M6 10V8a6 6 0 1 1 12 0v2h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1Zm2 0h8V8a4 4 0 1 0-8 0v2Z" />
        </g>
      )}
      {AXES.map((key, i) => {
        const [x, y] = pointAt(i, RADIUS + 24)
        const isTop = !locked && stats[key] === maxStat
        return (
          <text
            key={key}
            x={x}
            y={y}
            fontSize="11"
            fontWeight={isTop ? 'bold' : 'normal'}
            fill={isTop ? '#ef4444' : '#cbd5e1'}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {STAT_LABELS[key]} {locked ? '?' : stats[key]}
          </text>
        )
      })}
    </svg>
  )
}

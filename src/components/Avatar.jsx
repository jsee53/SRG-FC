// Tailwind는 클래스 문자열을 정적으로 스캔하므로 치수는 리터럴로 매핑해서 사용
const SIZE_CLASSES = {
  xs: 'h-8 w-8 text-xs',
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-lg',
  lg: 'h-20 w-20 text-xl',
}

export default function Avatar({ name, size = 'md' }) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

  return (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-full bg-[var(--color-surface-soft)] font-bold ring-2 ring-[var(--color-border-strong)]`}
    >
      {name.slice(-2)}
    </div>
  )
}

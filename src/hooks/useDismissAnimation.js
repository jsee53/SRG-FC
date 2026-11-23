import { useState } from 'react'

// sheet-out/overlay-out 애니메이션(index.css)과 지속시간을 맞춰야 함
const EXIT_DURATION_MS = 220

// 닫힘 애니메이션이 끝난 뒤 onClose 호출
export function useDismissAnimation(onClose) {
  const [closing, setClosing] = useState(false)

  function requestClose() {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, EXIT_DURATION_MS)
  }

  return { closing, requestClose }
}

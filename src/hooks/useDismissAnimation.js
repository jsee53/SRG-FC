import { useState } from 'react'

// sheet-out/overlay-out 애니메이션(index.css)과 지속시간을 맞춰야 함
const EXIT_DURATION_MS = 220

// 바텀시트를 닫을 때 즉시 사라지는 대신 위→아래로 슬라이드아웃하는 애니메이션을 보여주고,
// 그 애니메이션이 끝난 뒤에야 실제 onClose(언마운트)를 호출함
export function useDismissAnimation(onClose) {
  const [closing, setClosing] = useState(false)

  function requestClose() {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, EXIT_DURATION_MS)
  }

  return { closing, requestClose }
}

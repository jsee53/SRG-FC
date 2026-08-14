import { useRef } from 'react'

const CLOSE_THRESHOLD_PX = 80
const SNAP_BACK_MS = 200

// 아래로 당기는 동안 손가락을 그대로 따라가도록 실시간으로 translateY를 적용하고,
// 손을 뗐을 때 CLOSE_THRESHOLD_PX 이상 당겼으면 닫힘 확정, 아니면 원위치로 튕겨 돌아옴
export function useSwipeToClose(sheetRef, requestClose) {
  const touchStart = useRef(null)
  const dragging = useRef(false)

  function handleTouchStart(e) {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY, scrollTop: sheetRef.current?.scrollTop ?? 0 }
    dragging.current = false
  }

  function handleTouchMove(e) {
    if (!touchStart.current || !sheetRef.current) return
    const t = e.touches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y

    if (dy > 0 && dy > Math.abs(dx) * 1.5 && touchStart.current.scrollTop <= 0) {
      dragging.current = true
      sheetRef.current.style.transition = 'none'
      sheetRef.current.style.transform = `translateY(${dy}px)`
    }
  }

  function handleTouchEnd(e) {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dy = t.clientY - touchStart.current.y
    const wasDragging = dragging.current
    touchStart.current = null
    dragging.current = false

    if (!wasDragging || !sheetRef.current) return

    if (dy > CLOSE_THRESHOLD_PX) {
      // 지금 당긴 위치에서 그대로 이어서 CSS 닫힘 애니메이션이 시작되도록,
      // 인라인 스타일을 지우는 것과 requestClose 호출을 같은 틱에서 처리해 튐 없이 이어지게 함
      sheetRef.current.style.transition = ''
      sheetRef.current.style.transform = ''
      requestClose()
    } else {
      const node = sheetRef.current
      node.style.transition = `transform ${SNAP_BACK_MS}ms cubic-bezier(0.32,0.72,0,1)`
      node.style.transform = 'translateY(0px)'
      setTimeout(() => {
        if (node) {
          node.style.transition = ''
          node.style.transform = ''
        }
      }, SNAP_BACK_MS)
    }
  }

  return { handleTouchStart, handleTouchMove, handleTouchEnd }
}

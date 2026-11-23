import { useRef } from 'react'

const CLOSE_THRESHOLD_PX = 80
const SNAP_BACK_MS = 200

// 드래그 중 translateY를 따라가고, CLOSE_THRESHOLD_PX 이상 당기면 닫힘, 아니면 원위치
export function useSwipeToClose(sheetRef, requestClose) {
  const touchStart = useRef(null)
  const dragging = useRef(false)

  function handleTouchStart(e) {
    // 모달 스와이프가 뒤 페이지의 탭 전환 스와이프로 전파되지 않게 함
    e.stopPropagation()
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY, scrollTop: sheetRef.current?.scrollTop ?? 0 }
    dragging.current = false
  }

  function handleTouchMove(e) {
    e.stopPropagation()
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

  // 카카오톡 인앱 브라우저 등에서 touchend 없이 touchcancel로 끝나는 경우가 있어 여기서도 정리
  function handleTouchCancel(e) {
    e.stopPropagation()
    touchStart.current = null
    if (dragging.current && sheetRef.current) {
      sheetRef.current.style.transition = ''
      sheetRef.current.style.transform = ''
    }
    dragging.current = false
  }

  function handleTouchEnd(e) {
    e.stopPropagation()
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dy = t.clientY - touchStart.current.y
    const wasDragging = dragging.current
    touchStart.current = null
    dragging.current = false

    if (!wasDragging || !sheetRef.current) return

    if (dy > CLOSE_THRESHOLD_PX) {
      // 인라인 스타일 제거와 requestClose를 같은 틱에 해야 현재 위치에서 튐 없이 닫힘 애니메이션이 이어짐
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

  return { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel }
}

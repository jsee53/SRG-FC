import { useEffect } from 'react'

// 모달이 열린 동안 뒤 페이지 overscroll 잠금. 실제 스크롤은 body가 아니라 [data-scroll-page]에서 일어남
// active=false면 잠그지 않음 (항상 마운트돼 있는 MemberDetail 등)
export function useLockBodyScroll(active = true) {
  useEffect(() => {
    if (!active) return
    const containers = document.querySelectorAll('[data-scroll-page]')
    const prevValues = [...containers].map((el) => el.style.overflow)
    containers.forEach((el) => {
      el.style.overflow = 'hidden'
    })
    return () => {
      containers.forEach((el, i) => {
        el.style.overflow = prevValues[i]
      })
    }
  }, [active])
}

import { useEffect } from 'react'

// fixed 오버레이 모달이 열려있는 동안, 모달 안쪽 스크롤이 끝에 닿았을 때
// 뒤에 있는 페이지 본문까지 같이 스크롤(overscroll)되는 걸 막음.
// active=false를 넘기면 잠그지 않음 — MemberDetail처럼 부모가 항상 마운트해두고
// member prop으로만 표시 여부를 결정하는 컴포넌트에서 필요함 (없으면 평소에도 스크롤이 잠겨버림)
export function useLockBodyScroll(active = true) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])
}

import { useEffect } from 'react'

// fixed 오버레이 모달이 열려있는 동안, 모달 안쪽 스크롤이 끝에 닿았을 때
// 뒤에 있는 페이지 본문까지 같이 스크롤(overscroll)되는 걸 막음.
// 탭 전환 시 스크롤 위치가 다른 탭으로 새는 걸 막기 위해 실제 스크롤은 document.body가 아니라
// 각 탭 슬롯(App.jsx의 [data-scroll-page])에서 일어나므로, 그 컨테이너들을 직접 잠금.
// active=false를 넘기면 잠그지 않음 — MemberDetail처럼 부모가 항상 마운트해두고
// member prop으로만 표시 여부를 결정하는 컴포넌트에서 필요함 (없으면 평소에도 스크롤이 잠겨버림)
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

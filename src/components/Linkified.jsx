const URL_PATTERN = /(https?:\/\/[^\s]+)/g

// 게시글 본문의 URL을 눌러서 바로 이동할 수 있는 링크로 바꿔줌
export default function Linkified({ text }) {
  return text.split(URL_PATTERN).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
        onClick={(e) => e.stopPropagation()}
      >
        {part}
      </a>
    ) : (
      part
    )
  )
}

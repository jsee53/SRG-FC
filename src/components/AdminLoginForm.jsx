import { useState } from 'react'

export default function AdminLoginForm({ onClose, onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const { error: signInError } = await onSignIn(email, password)
    setSubmitting(false)
    if (signInError) {
      setError('이메일 또는 비밀번호가 올바르지 않아요.')
      return
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 [animation:overlay-in_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-slate-800 p-5 pb-8 [animation:sheet-in_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          >
            닫기
          </button>
        </div>

        <h2 className="mt-2 text-lg font-bold">관리자 로그인</h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            type="password"
            required
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-full bg-emerald-400 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-40"
          >
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}

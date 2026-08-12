import { useState } from 'react'
import { inputClass, Select } from './memberFormFields'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'

export const PENDING_CLAIM_KEY = 'srgfc_pending_claim'

// Supabase 프로젝트 기본(무료) 이메일 발송 한도는 시간당 몇 통 수준으로 아주 낮아서,
// 짧은 시간에 여러 명이 가입하면 확인 메일 발송이 막혀 가입 자체가 실패한 것처럼 보임.
// 원인을 바로 알 수 있게 이 경우만 따로 안내함 (해결책: SMTP 커스텀 설정 또는 이메일 확인 끄기)
function describeSignUpError(signUpError) {
  if (signUpError.message === 'duplicate_email') {
    return '이미 가입된 이메일이에요. 로그인해주세요.'
  }
  if (signUpError.status === 429 || signUpError.code === 'over_email_send_rate_limit') {
    return '이메일 발송 제한에 걸렸어요. 잠시 후(1시간 이내) 다시 시도해주세요.'
  }
  return '가입에 실패했어요. 다시 시도해주세요.'
}

export default function AuthForm({ members, onClose, onSignIn, onSignUp }) {
  useLockBodyScroll()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [memberId, setMemberId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const unclaimedMembers = members.filter((m) => !m.userId)

  function switchMode(next) {
    setMode(next)
    setNotice('')
    setError('')
  }

  async function handleLogin(e) {
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

  async function handleSignUp(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (memberId) {
      localStorage.setItem(PENDING_CLAIM_KEY, memberId)
    }

    const { session, error: signUpError } = await onSignUp(email, password)
    setSubmitting(false)

    if (signUpError) {
      localStorage.removeItem(PENDING_CLAIM_KEY)
      setError(describeSignUpError(signUpError))
      return
    }

    if (session) {
      onClose()
      return
    }

    setNotice('가입 신청 완료! 이메일함에서 확인 링크를 눌러주세요. 확인 후 로그인하면 자동으로 연결돼요.')
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

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
              mode === 'login' ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10 text-slate-300'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
              mode === 'signup' ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10 text-slate-300'
            }`}
          >
            회원가입
          </button>
        </div>

        {notice ? (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm text-emerald-300">{notice}</p>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="rounded-full bg-emerald-400 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300"
            >
              로그인 화면으로
            </button>
          </div>
        ) : (
          <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="mt-4 flex flex-col gap-3">
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              name="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />

            {mode === 'signup' && (
              <label className="flex flex-col gap-1 text-xs text-slate-400">
                내 이름 선택 (없으면 연결 안 함)
                <Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  <option value="">연결 안 함</option>
                  {unclaimedMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </label>
            )}

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-full bg-emerald-400 py-2.5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:opacity-40"
            >
              {submitting ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

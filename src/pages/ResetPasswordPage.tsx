import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { clearAuthError, resetPasswordRequest } from '../redux/action/authAction'
import type { AppDispatch, RootState } from '../redux/store'

interface ResetPasswordLocationState {
  email?: string
  otp?: string
}

const maskEmail = (email: string) => {
  const [name, domain] = email.split('@')

  if (!name || !domain) {
    return ''
  }

  const visibleChars = name.slice(0, 2)
  return `${visibleChars}${'*'.repeat(Math.max(name.length - 2, 1))}@${domain}`
}

function ResetPasswordPage() {
  useDocumentTitle('Reset Password')

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = (location.state as ResetPasswordLocationState | null) ?? null
  const email = locationState?.email?.trim() ?? ''
  const otp = locationState?.otp?.trim() ?? ''
  const { resetPasswordError, resetPasswordLoading, resetPasswordMessage } = useSelector(
    (state: RootState) => state.auth,
  )
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  const description = useMemo(() => {
    if (!email) {
      return 'Create a new password for your account. Use at least 8 characters.'
    }

    return `Create a new password for ${maskEmail(email)} after OTP verification.`
  }, [email])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (resetPasswordMessage) {
      navigate('/signin', { replace: true })
      return
    }

    setLocalError(null)

    if (!email || !otp) {
      setLocalError('Verify your OTP again before resetting the password.')
      return
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    dispatch(
      resetPasswordRequest({
        email,
        otp,
        password,
      }),
    )
  }

  return (
    <AuthLayout
      brand=""
      title="Reset Password"
      titleClassName="text-center text-[1.85rem] font-medium leading-[1.12] text-white sm:text-[2.2rem]"
      description={description}
      footerText="Need to restart recovery?"
      footerLinkLabel="Forgot Password"
      footerTo="/forgot-password"
    >
      <div className="mb-6 rounded-[18px] border border-white/8 bg-slate-950/70 p-4 text-left shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
        <p className="text-sm font-medium text-white">Password requirements</p>
        <div className="mt-3 grid gap-2 text-xs text-slate-400">
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2">
            <span>Minimum length</span>
            <span className="font-medium tracking-[0.18em] text-brand-amber">8+ CHARS</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2">
            <span>Verification</span>
            <span className="font-medium tracking-[0.18em] text-cyan-200">OTP PASSED</span>
          </div>
        </div>
      </div>

      <form autoComplete="off" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="sr-only" htmlFor="new-password">
            New password
          </label>
          <input
            autoComplete="new-password"
            id="new-password"
            className="auth-dark-input"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setLocalError(null)
            }}
            placeholder="New Password"
            required
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="confirm-new-password">
            Confirm new password
          </label>
          <input
            autoComplete="new-password"
            id="confirm-new-password"
            className="auth-dark-input"
            type="password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value)
              setLocalError(null)
            }}
            placeholder="Confirm New Password"
            required
          />
        </div>

        {localError || resetPasswordError ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {localError ?? resetPasswordError}
          </div>
        ) : null}

        {resetPasswordMessage ? (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {resetPasswordMessage}
          </div>
        ) : null}

        <button className="auth-cta-button" disabled={resetPasswordLoading} type="submit">
          {resetPasswordLoading
            ? 'Resetting password...'
            : resetPasswordMessage
              ? 'Continue to sign in'
              : 'Reset password'}
        </button>

        <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
          <Link
            className="font-medium text-brand-amber transition hover:text-orange-300"
            to="/forgot-password"
          >
            Start over
          </Link>
          <Link
            className="font-medium text-slate-300 underline underline-offset-4 transition hover:text-white"
            to="/signin"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default ResetPasswordPage
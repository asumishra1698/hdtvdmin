import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {
  clearAuthError,
  forgotPasswordRequest,
  verifyOtpRequest,
} from '../redux/action/authAction'
import type { AppDispatch, RootState } from '../redux/store'

const OTP_LENGTH = 6
const RESEND_INTERVAL_SECONDS = 30

interface OtpLocationState {
  email?: string
}

const createEmptyOtp = () => Array.from({ length: OTP_LENGTH }, () => '')

const maskEmail = (email: string) => {
  const [name, domain] = email.split('@')

  if (!name || !domain) {
    return ''
  }

  const visibleChars = name.slice(0, 2)
  return `${visibleChars}${'*'.repeat(Math.max(name.length - 2, 1))}@${domain}`
}

function OtpVerificationPage() {
  useDocumentTitle('OTP Verification')

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const locationState = (location.state as OtpLocationState | null) ?? null
  const email = locationState?.email?.trim() ?? ''
  const {
    forgotPasswordLoading,
    otpVerificationError,
    otpVerificationLoading,
    otpVerificationMessage,
  } = useSelector((state: RootState) => state.auth)
  const [otpDigits, setOtpDigits] = useState<string[]>(createEmptyOtp)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_INTERVAL_SECONDS)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    if (!otpVerificationMessage) {
      return
    }

    navigate('/reset-password', {
      state: {
        email,
        otp: otpDigits.join(''),
      },
    })
  }, [email, navigate, otpDigits, otpVerificationMessage])

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  const focusInput = (index: number) => {
    const target = inputRefs.current[index]

    if (target) {
      target.focus()
      target.select()
    }
  }

  const populateDigits = (startIndex: number, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, OTP_LENGTH - startIndex)

    if (!digits) {
      return
    }

    setOtpDigits((current) => {
      const next = [...current]

      digits.split('').forEach((digit, offset) => {
        next[startIndex + offset] = digit
      })

      return next
    })

    const nextIndex = Math.min(startIndex + digits.length, OTP_LENGTH - 1)
    window.requestAnimationFrame(() => {
      focusInput(nextIndex)
    })
  }

  const handleDigitChange = (index: number, value: string) => {
    setLocalError(null)

    const normalized = value.replace(/\D/g, '')

    if (!normalized) {
      setOtpDigits((current) => {
        const next = [...current]
        next[index] = ''
        return next
      })
      return
    }

    populateDigits(index, normalized)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      event.preventDefault()
      focusInput(index - 1)
      return
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      focusInput(index - 1)
      return
    }

    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault()
      focusInput(index + 1)
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>, index: number) => {
    event.preventDefault()
    setLocalError(null)
    populateDigits(index, event.clipboardData.getData('text'))
  }

  const handleResend = () => {
    if (!email) {
      setLocalError('Request a new OTP from the forgot-password page first.')
      return
    }

    setOtpDigits(createEmptyOtp())
    setSecondsLeft(RESEND_INTERVAL_SECONDS)
    setLocalError(null)
    dispatch(forgotPasswordRequest({ email }))
    focusInput(0)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email) {
      setLocalError('Start the recovery flow again to verify a valid email address.')
      return
    }

    if (otpDigits.some((digit) => digit.length !== 1)) {
      setLocalError('Enter the full 6-digit code to continue.')
      return
    }

    setLocalError(null)
    dispatch(
      verifyOtpRequest({
        email,
        otp: otpDigits.join(''),
      }),
    )
  }

  const helperText = email
    ? `We sent a 6-digit security code to ${maskEmail(email)}.`
    : 'Enter the 6-digit security code from your email or phone.'

  return (
    <AuthLayout
      brand=""
      title="OTP Verification"
      titleClassName="text-center text-[1.85rem] font-medium leading-[1.12] text-white sm:text-[2.25rem]"
      description={helperText}
      footerText="Entered the wrong destination?"
      footerLinkLabel="Go back"
      footerTo="/forgot-password"
    >
      <div className="mb-6 rounded-[18px] border border-cyan-400/15 bg-slate-950/70 p-4 text-left shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-sm font-semibold tracking-[0.25em] text-cyan-200">
            6X
          </div>
          <div>
            <p className="text-sm font-medium text-white">Secure verification step</p>
            <p className="text-xs leading-5 text-slate-400">
              Type the code one digit at a time or paste the full OTP.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
          <span>Code length</span>
          <span className="font-medium tracking-[0.28em] text-brand-amber">6 DIGITS</span>
        </div>
      </div>

      <form autoComplete="off" className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-6 gap-2.5 sm:gap-3">
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              className="h-14 rounded-2xl border border-white/10 bg-[#030712] text-center text-xl font-semibold tracking-[0.18em] text-white outline-none transition focus:border-brand-amber/60 focus:ring-2 focus:ring-brand-amber/15 sm:h-16 sm:text-2xl"
              type="text"
              value={digit}
              onChange={(event) => handleDigitChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onPaste={(event) => handlePaste(event, index)}
              onFocus={(event) => event.target.select()}
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Use all six digits to complete verification.</span>
          <span className="font-medium text-slate-300">00:{String(secondsLeft).padStart(2, '0')}</span>
        </div>

        {localError || otpVerificationError ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {localError ?? otpVerificationError}
          </div>
        ) : null}

        <button className="auth-cta-button" disabled={otpVerificationLoading} type="submit">
          {otpVerificationLoading ? 'Verifying code...' : 'Verify code'}
        </button>

        <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
          <button
            className="font-medium text-brand-amber transition hover:text-orange-300 disabled:cursor-not-allowed disabled:text-slate-500"
            disabled={secondsLeft > 0 || forgotPasswordLoading}
            type="button"
            onClick={handleResend}
          >
            {forgotPasswordLoading ? 'Sending...' : 'Resend code'}
          </button>
          <Link
            className="font-medium text-slate-300 underline underline-offset-4 transition hover:text-white"
            to="/forgot-password"
          >
            Change email
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default OtpVerificationPage
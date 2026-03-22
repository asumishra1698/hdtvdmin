import { useEffect, useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { clearAuthError, signInRequested } from '../redux/action/authAction'
import type { AppDispatch, RootState } from '../redux/store'

function SignInPage() {
  useDocumentTitle('Sign In')

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { error, status, user } = useSelector((state: RootState) => state.auth)
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, user])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    dispatch(
      signInRequested({
        email: credentials.email,
        mobile: '',
        password: credentials.password,
        role: '',
        navigate,
      }),
    )
  }

  return (
    <AuthLayout
      title="Sign In to"
      description=""
      titleClassName="text-[1.5rem] font-medium leading-[1.12] text-white sm:text-[2.2rem]"
      footerText="Don't have an account?"
      footerLinkLabel="Sign Up"
      footerTo="/signup"
    >
      <form autoComplete="off" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="sr-only" htmlFor="email">
            Username or email
          </label>
          <input
            autoComplete="off"
            id="email"
            className="auth-dark-input"
            type="text"
            value={credentials.email}
            onChange={(event) =>
              setCredentials((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="Username or email"
            required
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <input
            autoComplete="new-password"
            id="password"
            className="auth-dark-input"
            type="password"
            value={credentials.password}
            onChange={(event) =>
              setCredentials((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Enter your password"
            required
          />
      <div className="mt-3 text-right">
      <Link
        className="text-sm font-medium text-brand-amber underline underline-offset-2 transition hover:text-orange-300"
        to="/forgot-password"
      >
        Forgot password?
      </Link>
      </div>
    </div>

          {error ? (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
            </div>
          ) : null}

        <button className="auth-cta-button" disabled={status === 'loading'} type="submit">
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default SignInPage
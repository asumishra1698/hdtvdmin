import { useEffect, useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { clearAuthError, signUpRequested } from '../redux/action/authAction'
import type { AppDispatch, RootState } from '../redux/store'

function SignUpPage() {
  useDocumentTitle('Sign Up')

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { error, status, user } = useSelector((state: RootState) => state.auth)
  const [localError, setLocalError] = useState<string | null>(null)
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    number: '',
    role: 'user',
    password: '',
    confirmPassword: '',
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
    setLocalError(null)

    if (formValues.password.length < 8) {
      setLocalError('Password must be at least 8 characters long.')
      return
    }

    if (formValues.password !== formValues.confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    dispatch(
      signUpRequested({
        name: formValues.name,
        email: formValues.email,
        number: formValues.number,
        role: formValues.role,
        password: formValues.password,
        navigate,
      }),
    )
  }

  return (
    <AuthLayout
      brand=""
      title="Create Your Account"
      titleClassName="text-center text-[2.05rem] font-medium leading-[1.15] text-white sm:text-[2.25rem]"
      description=""
      footerText="Already have access?"
      footerLinkLabel="Sign In"
      footerTo="/signin"
    >
      <form autoComplete="off" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="sr-only" htmlFor="name">
            Full name
          </label>
          <input
            autoComplete="off"
            id="name"
            className="auth-dark-input"
            type="text"
            value={formValues.name}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Full Name"
            required
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="signup-email">
            Work email
          </label>
          <input
            autoComplete="off"
            id="signup-email"
            className="auth-dark-input"
            type="email"
            value={formValues.email}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="Email Address"
            required
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="phone-number">
            Phone number
          </label>
          <input
            autoComplete="off"
            id="phone-number"
            className="auth-dark-input"
            type="tel"
            value={formValues.number}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, number: event.target.value }))
            }
            placeholder="Phone Number"
            required
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="signup-role">
            Role
          </label>
          <select
            id="signup-role"
            className="auth-dark-input"
            value={formValues.role}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, role: event.target.value }))
            }
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="Superadmin">Super Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div>
          <label className="sr-only" htmlFor="signup-password">
            Password
          </label>
          <input
            autoComplete="new-password"
            id="signup-password"
            className="auth-dark-input"
            type="password"
            value={formValues.password}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Create Password"
            required
          />
        </div>

        <div>
          <label className="sr-only" htmlFor="confirm-password">
            Confirm password
          </label>
          <input
            autoComplete="new-password"
            id="confirm-password"
            className="auth-dark-input"
            type="password"
            value={formValues.confirmPassword}
            onChange={(event) =>
              setFormValues((current) => ({ ...current, confirmPassword: event.target.value }))
            }
            placeholder="Confirm Password"
            required
          />
        </div>

        {localError || error ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {localError ?? error}
          </div>
        ) : null}

        <button
          className="auth-cta-button mt-1"
          disabled={status === 'loading'}
          type="submit"
        >
          {status === 'loading' ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default SignUpPage
import { useEffect, useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { clearAuthError, forgotPasswordRequest } from '../redux/action/authAction'
import type { AppDispatch, RootState } from '../redux/store'

function ForgotPasswordPage() {
	useDocumentTitle('Forgot Password')

	const dispatch = useDispatch<AppDispatch>()
	const navigate = useNavigate()
	const { forgotPasswordError, forgotPasswordLoading, forgotPasswordMessage } = useSelector(
		(state: RootState) => state.auth,
	)
	const [email, setEmail] = useState('')

	useEffect(() => {
		dispatch(clearAuthError())
	}, [dispatch])

	useEffect(() => {
		if (!forgotPasswordMessage || !email) {
			return
		}

		navigate('/otp-verification', {
			state: { email },
		})
	}, [email, forgotPasswordMessage, navigate])

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		dispatch(forgotPasswordRequest({ email }))
	}

	return (
		<AuthLayout
			brand=""
			title="Forgot Password"
			titleClassName="text-center text-[1.7rem] font-medium leading-[1.15] text-white sm:text-[2.1rem]"
			description="Enter your email address and we will send you a 6-digit OTP for password recovery."
			footerText="Remembered your password?"
			footerLinkLabel="Sign In"
			footerTo="/signin"
		>
			<form autoComplete="off" className="space-y-4" onSubmit={handleSubmit}>
				<div>
					<label className="sr-only" htmlFor="forgot-email">
						Email address
					</label>
					<input
						autoComplete="off"
						id="forgot-email"
						className="auth-dark-input"
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						placeholder="Email Address"
						required
					/>
				</div>

				{forgotPasswordMessage ? (
					<div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
						{forgotPasswordMessage}
					</div>
				) : null}

				{forgotPasswordError ? (
					<div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
						{forgotPasswordError}
					</div>
				) : null}

				<button className="auth-cta-button" disabled={forgotPasswordLoading} type="submit">
					{forgotPasswordLoading ? 'Sending OTP...' : 'Send OTP'}
				</button>
			</form>
		</AuthLayout>
	)
}

export default ForgotPasswordPage
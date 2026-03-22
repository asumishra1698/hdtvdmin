import {
	CLEAR_AUTH_ERROR,
	FORGOT_PASSWORD_FAILURE,
	FORGOT_PASSWORD_REQUEST,
	FORGOT_PASSWORD_SUCCESS,
	GET_ALL_USERS_FAILURE,
	GET_ALL_USERS_REQUEST,
	GET_ALL_USERS_SUCCESS,
	LOGIN_FAILURE,
	LOGIN_REQUEST,
	LOGIN_SUCCESS,
	RESET_PASSWORD_FAILURE,
	RESET_PASSWORD_REQUEST,
	RESET_PASSWORD_SUCCESS,
	REGISTER_FAILURE,
	REGISTER_REQUEST,
	REGISTER_SUCCESS,
	SIGN_OUT,
	VERIFY_OTP_FAILURE,
	VERIFY_OTP_REQUEST,
	VERIFY_OTP_SUCCESS,
} from '../action/actionType'

interface UserProfile {
	id: string
	name: string
	email: string
	phone?: string
	company: string
	role: string
	status?: string
}

interface AuthSession {
	token: string | null
	user: UserProfile | null
}

interface UsersPagination {
	total: number
	page: number
	limit: number
	totalPages: number
}

interface AuthState {
	user: UserProfile | null
	token: string | null
	status: 'idle' | 'loading' | 'authenticated' | 'error'
	error: string | null
	forgotPasswordLoading: boolean
	forgotPasswordMessage: string | null
	forgotPasswordError: string | null
	otpVerificationLoading: boolean
	otpVerificationMessage: string | null
	otpVerificationError: string | null
	resetPasswordLoading: boolean
	resetPasswordMessage: string | null
	resetPasswordError: string | null
	users: UserProfile[]
	usersPagination: UsersPagination
	usersLoading: boolean
	usersError: string | null
	usersLastFetched: number | null
}

type AuthAction =
	| { type: typeof LOGIN_REQUEST }
	| { type: typeof REGISTER_REQUEST }
	| { type: typeof LOGIN_SUCCESS; payload: AuthSession }
	| { type: typeof REGISTER_SUCCESS; payload: AuthSession }
	| { type: typeof LOGIN_FAILURE; payload: string }
	| { type: typeof REGISTER_FAILURE; payload: string }
	| { type: typeof FORGOT_PASSWORD_REQUEST }
	| { type: typeof FORGOT_PASSWORD_SUCCESS; payload: string }
	| { type: typeof FORGOT_PASSWORD_FAILURE; payload: string }
	| { type: typeof VERIFY_OTP_REQUEST }
	| { type: typeof VERIFY_OTP_SUCCESS; payload: string }
	| { type: typeof VERIFY_OTP_FAILURE; payload: string }
	| { type: typeof RESET_PASSWORD_REQUEST }
	| { type: typeof RESET_PASSWORD_SUCCESS; payload: string }
	| { type: typeof RESET_PASSWORD_FAILURE; payload: string }
	| { type: typeof GET_ALL_USERS_REQUEST }
	| {
			type: typeof GET_ALL_USERS_SUCCESS
			payload: {
				users: UserProfile[]
				pagination: UsersPagination
			}
		}
	| { type: typeof GET_ALL_USERS_FAILURE; payload: string }
	| { type: typeof CLEAR_AUTH_ERROR }
	| { type: typeof SIGN_OUT }

const SESSION_KEY = 'hdtv-admin-session'

const loadSession = (): AuthSession | null => {
	if (typeof window === 'undefined') {
		return null
	}

	const value = localStorage.getItem(SESSION_KEY)

	if (!value) {
		return null
	}

	try {
		return JSON.parse(value) as AuthSession
	} catch {
		return null
	}
}

const existingSession = loadSession()

const initialState: AuthState = {
	user: existingSession?.user ?? null,
	token: existingSession?.token ?? null,
	status: existingSession ? 'authenticated' : 'idle',
	error: null,
	forgotPasswordLoading: false,
	forgotPasswordMessage: null,
	forgotPasswordError: null,
	otpVerificationLoading: false,
	otpVerificationMessage: null,
	otpVerificationError: null,
	resetPasswordLoading: false,
	resetPasswordMessage: null,
	resetPasswordError: null,
	users: [],
	usersPagination: {
		total: 0,
		page: 1,
		limit: 20,
		totalPages: 1,
	},
	usersLoading: false,
	usersError: null,
	usersLastFetched: null,
}

function authReducer(state: AuthState = initialState, action: AuthAction): AuthState {
	switch (action.type) {
		case LOGIN_REQUEST:
		case REGISTER_REQUEST:
			return {
				...state,
				status: 'loading',
				error: null,
			}

		case GET_ALL_USERS_REQUEST:
			return {
				...state,
				usersLoading: true,
				usersError: null,
			}

		case FORGOT_PASSWORD_REQUEST:
			return {
				...state,
				forgotPasswordLoading: true,
				forgotPasswordMessage: null,
				forgotPasswordError: null,
				otpVerificationMessage: null,
				otpVerificationError: null,
				resetPasswordMessage: null,
				resetPasswordError: null,
			}

		case VERIFY_OTP_REQUEST:
			return {
				...state,
				otpVerificationLoading: true,
				otpVerificationMessage: null,
				otpVerificationError: null,
			}

		case RESET_PASSWORD_REQUEST:
			return {
				...state,
				resetPasswordLoading: true,
				resetPasswordMessage: null,
				resetPasswordError: null,
			}

		case LOGIN_SUCCESS:
		case REGISTER_SUCCESS:
			return {
				...state,
				user: action.payload.user,
				token: action.payload.token,
				status:
					action.payload.user && action.payload.token ? 'authenticated' : 'idle',
				error: null,
			}

		case LOGIN_FAILURE:
		case REGISTER_FAILURE:
			return {
				...state,
				user: null,
				token: null,
				status: 'error',
				error: action.payload,
			}

		case GET_ALL_USERS_SUCCESS:
			return {
				...state,
				users: action.payload.users,
				usersPagination: action.payload.pagination,
				usersLoading: false,
				usersError: null,
				usersLastFetched: Date.now(),
			}

		case GET_ALL_USERS_FAILURE:
			return {
				...state,
				usersLoading: false,
				usersError: action.payload,
			}

		case FORGOT_PASSWORD_SUCCESS:
			return {
				...state,
				forgotPasswordLoading: false,
				forgotPasswordMessage: action.payload,
				forgotPasswordError: null,
			}

		case FORGOT_PASSWORD_FAILURE:
			return {
				...state,
				forgotPasswordLoading: false,
				forgotPasswordMessage: null,
				forgotPasswordError: action.payload,
			}

		case VERIFY_OTP_SUCCESS:
			return {
				...state,
				otpVerificationLoading: false,
				otpVerificationMessage: action.payload,
				otpVerificationError: null,
			}

		case VERIFY_OTP_FAILURE:
			return {
				...state,
				otpVerificationLoading: false,
				otpVerificationMessage: null,
				otpVerificationError: action.payload,
			}

		case RESET_PASSWORD_SUCCESS:
			return {
				...state,
				resetPasswordLoading: false,
				resetPasswordMessage: action.payload,
				resetPasswordError: null,
			}

		case RESET_PASSWORD_FAILURE:
			return {
				...state,
				resetPasswordLoading: false,
				resetPasswordMessage: null,
				resetPasswordError: action.payload,
			}

		case CLEAR_AUTH_ERROR:
			return {
				...state,
				status: state.status === 'error' ? 'idle' : state.status,
				error: null,
				forgotPasswordMessage: null,
				forgotPasswordError: null,
				otpVerificationMessage: null,
				otpVerificationError: null,
				resetPasswordMessage: null,
				resetPasswordError: null,
			}

		case SIGN_OUT:
			return {
				...state,
				user: null,
				token: null,
				status: 'idle',
				error: null,
				forgotPasswordLoading: false,
				forgotPasswordMessage: null,
				forgotPasswordError: null,
				otpVerificationLoading: false,
				otpVerificationMessage: null,
				otpVerificationError: null,
				resetPasswordLoading: false,
				resetPasswordMessage: null,
				resetPasswordError: null,
				users: [],
				usersPagination: {
					total: 0,
					page: 1,
					limit: 20,
					totalPages: 1,
				},
				usersLoading: false,
				usersError: null,
				usersLastFetched: null,
			}

		default:
			return state
	}
}

export default authReducer

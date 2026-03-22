const DEFAULT_API_BASE_URL = 'https://hdtvbharat-ee20b.web.app/api'
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL

export const API_ROUTES = {
  AUTH: {
    SIGN_IN: '/users/signin',
    SIGN_UP: '/users/signup',
    FORGOT_PASSWORD: '/users/forgot-password',
    FORGOT_PASSWORD_VERIFY_OTP: '/users/forgot-password/verify-otp',
    FORGOT_PASSWORD_RESET_PASSWORD: '/users/forgot-password/reset-password',
  },
  USERS: {
    LIST: '/users/',
  },
} as const
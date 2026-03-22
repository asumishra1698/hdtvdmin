import {
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  VERIFY_OTP_REQUEST,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  GET_ALL_USERS_REQUEST,
  GET_ALL_USERS_SUCCESS,
  GET_ALL_USERS_FAILURE,
  CLEAR_AUTH_ERROR,
  SIGN_OUT,
} from "./actionType";

export const registerRequest = (payload: {
  name: string;
  email: string;
  password: string;
  number?: string;
  role?: string;
  navigate?: (path: string) => void;
}) => ({
  type: REGISTER_REQUEST,
  payload,
} as const);

export const registerSuccess = (data: any) => ({
  type: REGISTER_SUCCESS,
  payload: data,
} as const);

export const registerFailure = (error: string) => ({
  type: REGISTER_FAILURE,
  payload: error,
} as const);

export const loginRequest = (payload: {
  email: string;
  mobile: string;
  password: string;
  role: string;
  navigate?: (path: string, options?: { replace?: boolean }) => void;
}) => ({
  type: LOGIN_REQUEST,
  payload,
} as const);

export const loginSuccess = (data: any) => ({
  type: LOGIN_SUCCESS,
  payload: data,
} as const);

export const loginFailure = (error: string) => ({
  type: LOGIN_FAILURE,
  payload: error,
} as const);

export const forgotPasswordRequest = (payload: {
  email: string;
}) => ({
  type: FORGOT_PASSWORD_REQUEST,
  payload,
} as const);

export const forgotPasswordSuccess = (message: string) => ({
  type: FORGOT_PASSWORD_SUCCESS,
  payload: message,
} as const);

export const forgotPasswordFailure = (error: string) => ({
  type: FORGOT_PASSWORD_FAILURE,
  payload: error,
} as const);

export const verifyOtpRequest = (payload: {
  email: string;
  otp: string;
}) => ({
  type: VERIFY_OTP_REQUEST,
  payload,
} as const);

export const verifyOtpSuccess = (message: string) => ({
  type: VERIFY_OTP_SUCCESS,
  payload: message,
} as const);

export const verifyOtpFailure = (error: string) => ({
  type: VERIFY_OTP_FAILURE,
  payload: error,
} as const);

export const resetPasswordRequest = (payload: {
  email: string;
  otp: string;
  password: string;
}) => ({
  type: RESET_PASSWORD_REQUEST,
  payload,
} as const);

export const resetPasswordSuccess = (message: string) => ({
  type: RESET_PASSWORD_SUCCESS,
  payload: message,
} as const);

export const resetPasswordFailure = (error: string) => ({
  type: RESET_PASSWORD_FAILURE,
  payload: error,
} as const);

export const getAllUsersRequest = (payload?: {
  page?: number;
  limit?: number;
  search?: string;
}) => ({
  type: GET_ALL_USERS_REQUEST,
  payload,
} as const);

export const getAllUsersSuccess = (data: {
  users: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}) => ({
  type: GET_ALL_USERS_SUCCESS,
  payload: data,
} as const);

export const getAllUsersFailure = (error: string) => ({
  type: GET_ALL_USERS_FAILURE,
  payload: error,
} as const);

export const clearAuthError = () => ({
  type: CLEAR_AUTH_ERROR,
} as const);

export const signOut = () => ({
  type: SIGN_OUT,
} as const);

export const signInRequested = loginRequest;
export const signUpRequested = registerRequest;
export const verifyOtpRequested = verifyOtpRequest;

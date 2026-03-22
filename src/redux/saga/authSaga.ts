import { call, put, takeLatest } from "redux-saga/effects";
import {
	DEFAULT_API_CACHE_TTL_MS,
	clearApiCache,
	getRequest,
	invalidateApiCache,
	postRequest,
} from "../../api/apiHelper";
import { API_ROUTES } from "../../api/apiRoutes";
import { toast } from "react-toastify";
import {
	FORGOT_PASSWORD_FAILURE,
	FORGOT_PASSWORD_REQUEST,
	FORGOT_PASSWORD_SUCCESS,
	GET_ALL_USERS_FAILURE,
	GET_ALL_USERS_REQUEST,
	GET_ALL_USERS_SUCCESS,
	REGISTER_REQUEST,
	REGISTER_SUCCESS,
	REGISTER_FAILURE,
	LOGIN_REQUEST,
	LOGIN_SUCCESS,
	LOGIN_FAILURE,
	RESET_PASSWORD_FAILURE,
	RESET_PASSWORD_REQUEST,
	RESET_PASSWORD_SUCCESS,
	SIGN_OUT,
	VERIFY_OTP_FAILURE,
	VERIFY_OTP_REQUEST,
	VERIFY_OTP_SUCCESS,
} from "../action/actionType";

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function generateId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}

	return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionFromResponse(response: any, payload: any) {
	const responseData = response?.data || response?.result || response || {};
	const apiUser = responseData.user || response.user || {};
	const token =
		apiUser.token ||
		responseData.token ||
		responseData.authToken ||
		responseData.accessToken ||
		response.token ||
		response.authToken ||
		response.accessToken ||
		`session-${normalizeEmail(payload.email)}-${Date.now()}`;

	return {
		token,
		user: {
			id: apiUser.id || responseData.userId || responseData.id || generateId(),
			name: apiUser.name || responseData.name || "Admin User",
			email: apiUser.email || responseData.email || normalizeEmail(payload.email),
			company: apiUser.company || responseData.company || "HDTV Network",
			role: apiUser.role || responseData.role || payload.role || "superadmin",
		},
	};
}

function getRequestMeta(response: any) {
	const responseData = response?.data || response?.result || response || {};
	const requestSucceeded = responseData.success ?? response?.success;
	const responseMessage = responseData.message ?? response?.message;

	return {
		responseData,
		requestSucceeded,
		responseMessage,
	};
}

function* registerSaga(action: any): any {
	try {
		const response = yield call(postRequest, API_ROUTES.AUTH.SIGN_UP, {
			name: (action.payload?.name || "").trim(),
			number: (action.payload?.number || "").trim(),
			email: normalizeEmail(action.payload?.email || ""),
			role: (action.payload?.role || "user").trim(),
			password: action.payload?.password || "",
		});

		const responseData = response?.data || response?.result || response || {};
		const requestSucceeded = responseData.success ?? response?.success;
		const responseMessage = responseData.message ?? response?.message;

		if (requestSucceeded === false) {
			throw new Error(responseMessage || "Registration failed");
		}

		invalidateApiCache(API_ROUTES.USERS.LIST);

		yield put({
			type: REGISTER_SUCCESS,
			payload: {
				token: null,
				user: null,
			},
		});
		toast.success(responseMessage || "Registration successful");

		if (action.payload?.navigate) {
			action.payload.navigate("/signin");
		}
	} catch (error: any) {
		toast.error(error?.message || "Registration failed");
		yield put({
			type: REGISTER_FAILURE,
			payload: error?.message || "Registration failed",
		});
	}
}

function mapUserList(response: any) {
	const responseData = response?.data || response?.result || response || {};
	const list =
		(responseData.users as any[]) ||
		(responseData.data as any[]) ||
		(responseData.items as any[]) ||
		(Array.isArray(responseData) ? responseData : []);

	return list.map((user: any) => ({
		id: user.id || user._id || generateId(),
		name: user.name || user.fullName || user.username || "Unknown User",
		email: user.email || "",
		phone: user.phone || user.number || user.mobile || "",
		company: user.company || "HDTV Network",
		role: user.role || "user",
		status: user.status || (user.isActive ? "Active" : "Inactive"),
	}));
}

function getUserPagination(response: any, fallbackPage: number, fallbackLimit: number) {
	const responseData = response?.data || response?.result || response || {};
	const pagination = responseData.pagination || response.pagination || {};

	return {
		total: Number(pagination.total ?? responseData.total ?? 0),
		page: Number(pagination.page ?? fallbackPage),
		limit: Number(pagination.limit ?? fallbackLimit),
		totalPages: Math.max(
			1,
			Number(
				pagination.totalPages ??
					(responseData.total && (pagination.limit ?? fallbackLimit)
						? Math.ceil(Number(responseData.total) / Number(pagination.limit ?? fallbackLimit))
						: 1),
			),
		),
	};
}

function* loginSaga(action: any): any {
	try {
		const response = yield call(postRequest, API_ROUTES.AUTH.SIGN_IN, {
			email: normalizeEmail(action.payload?.email || ""),
			password: action.payload?.password || "",
			mobile: action.payload?.mobile || "",
			role: action.payload?.role || "",
		});

		const responseData = response?.data || response?.result || response || {};
		const requestSucceeded = responseData.success ?? response?.success;
		const responseMessage = responseData.message ?? response?.message;

		if (requestSucceeded === false) {
			throw new Error(responseMessage || "Login failed");
		}

		const session = getSessionFromResponse(response, action.payload || {});

		if (typeof window !== "undefined") {
			localStorage.setItem("authToken", session.token);
			localStorage.setItem("hdtv-admin-session", JSON.stringify(session));
		}

		yield put({ type: LOGIN_SUCCESS, payload: session });
		toast.success(responseMessage || "Login successful");

		if (action.payload?.navigate) {
			action.payload.navigate("/dashboard");
		}
	} catch (error: any) {
		toast.error(error?.message || "Login failed");
		yield put({
			type: LOGIN_FAILURE,
			payload: error?.message || "Login failed",
		});
	}
}

function* forgotPasswordSaga(action: any): any {
	try {
		const response = yield call(postRequest, API_ROUTES.AUTH.FORGOT_PASSWORD, {
			email: normalizeEmail(action.payload?.email || ""),
		});

		const { requestSucceeded, responseMessage } = getRequestMeta(response);

		if (requestSucceeded === false) {
			throw new Error(responseMessage || "Failed to send reset email");
		}

		yield put({
			type: FORGOT_PASSWORD_SUCCESS,
			payload: responseMessage || "Password reset email sent successfully",
		});
		toast.success(responseMessage || "Password reset email sent successfully");
	} catch (error: any) {
		const message = error?.message || "Failed to send reset email";
		yield put({
			type: FORGOT_PASSWORD_FAILURE,
			payload: message,
		});
		toast.error(message);
	}
}

function* verifyOtpSaga(action: any): any {
	try {
		const response = yield call(postRequest, API_ROUTES.AUTH.FORGOT_PASSWORD_VERIFY_OTP, {
			email: normalizeEmail(action.payload?.email || ""),
			otp: `${action.payload?.otp || ""}`.trim(),
		});

		const { requestSucceeded, responseMessage } = getRequestMeta(response);

		if (requestSucceeded === false) {
			throw new Error(responseMessage || "OTP verification failed");
		}

		yield put({
			type: VERIFY_OTP_SUCCESS,
			payload: responseMessage || "OTP verified successfully",
		});
		toast.success(responseMessage || "OTP verified successfully");
	} catch (error: any) {
		const message = error?.message || "OTP verification failed";
		yield put({
			type: VERIFY_OTP_FAILURE,
			payload: message,
		});
		toast.error(message);
	}
}

function* resetPasswordSaga(action: any): any {
	try {
		const normalizedEmail = normalizeEmail(action.payload?.email || "");
		const normalizedOtp = `${action.payload?.otp || ""}`.trim();
		const password = action.payload?.password || "";
		const response = yield call(
			postRequest,
			API_ROUTES.AUTH.FORGOT_PASSWORD_RESET_PASSWORD,
			{
				email: normalizedEmail,
				otp: normalizedOtp,
				newPassword: password,
			}
		);

		const { requestSucceeded, responseMessage } = getRequestMeta(response);

		if (requestSucceeded === false) {
			throw new Error(responseMessage || "Password reset failed");
		}

		yield put({
			type: RESET_PASSWORD_SUCCESS,
			payload: responseMessage || "Password reset successfully",
		});
		toast.success(responseMessage || "Password reset successfully");
	} catch (error: any) {
		const message = error?.message || "Password reset failed";
		yield put({
			type: RESET_PASSWORD_FAILURE,
			payload: message,
		});
		toast.error(message);
	}
}

function* getAllUsersSaga(action: any): any {
	try {
		const params = {
			page: action.payload?.page ?? 1,
			limit: action.payload?.limit ?? 20,
			search: action.payload?.search ?? "",
		};

		const response = yield call(getRequest, API_ROUTES.USERS.LIST, params, {
			cache: {
				enabled: true,
				ttlMs: DEFAULT_API_CACHE_TTL_MS,
				storage: "local",
			},
		});
		const users = mapUserList(response);
		const pagination = getUserPagination(response, params.page, params.limit);
		yield put({
			type: GET_ALL_USERS_SUCCESS,
			payload: {
				users,
				pagination,
			},
		});
	} catch (error: any) {
		const message = error?.message || "Failed to fetch users";
		yield put({ type: GET_ALL_USERS_FAILURE, payload: message });
		toast.error(message);
	}
}

function* signOutSaga(): any {
	if (typeof window !== "undefined") {
		clearApiCache();
		localStorage.clear();
		sessionStorage.clear();
	}
}

export default function* authSaga() {
	yield takeLatest(REGISTER_REQUEST, registerSaga);
	yield takeLatest(LOGIN_REQUEST, loginSaga);
	yield takeLatest(FORGOT_PASSWORD_REQUEST, forgotPasswordSaga);
	yield takeLatest(VERIFY_OTP_REQUEST, verifyOtpSaga);
	yield takeLatest(RESET_PASSWORD_REQUEST, resetPasswordSaga);
	yield takeLatest(GET_ALL_USERS_REQUEST, getAllUsersSaga);
	yield takeLatest(SIGN_OUT, signOutSaga);
}

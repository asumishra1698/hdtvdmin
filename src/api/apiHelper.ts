import axios from 'axios'
import { BASE_URL } from './apiRoutes'

export const DEFAULT_API_CACHE_TTL_MS = 60 * 1000

type CacheStorageType = 'local' | 'session'

interface CacheOptions {
  enabled?: boolean
  ttlMs?: number
  storage?: CacheStorageType
  cacheKey?: string
  forceRefresh?: boolean
}

interface CacheEntry<TData> {
  data: TData
  expiresAt: number
}

const API_CACHE_PREFIX = 'hdtv-api-cache:'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

const getStorage = (storageType: CacheStorageType) => {
  if (typeof window === 'undefined') {
    return null
  }

  return storageType === 'session' ? window.sessionStorage : window.localStorage
}

const buildCacheKey = (url: string, params: unknown, customKey?: string) => {
  if (customKey) {
    return `${API_CACHE_PREFIX}${customKey}`
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') ?? '' : ''
  const normalizedParams = params ? JSON.stringify(params) : ''

  return `${API_CACHE_PREFIX}${url}::${token}::${normalizedParams}`
}

const readCache = <TData>(storageType: CacheStorageType, cacheKey: string) => {
  const storage = getStorage(storageType)

  if (!storage) {
    return null
  }

  const rawValue = storage.getItem(cacheKey)

  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as CacheEntry<TData>

    if (parsedValue.expiresAt <= Date.now()) {
      storage.removeItem(cacheKey)
      return null
    }

    return parsedValue.data
  } catch {
    storage.removeItem(cacheKey)
    return null
  }
}

const writeCache = <TData>(
  storageType: CacheStorageType,
  cacheKey: string,
  data: TData,
  ttlMs: number,
) => {
  const storage = getStorage(storageType)

  if (!storage) {
    return
  }

  const value: CacheEntry<TData> = {
    data,
    expiresAt: Date.now() + ttlMs,
  }

  storage.setItem(cacheKey, JSON.stringify(value))
}

export const invalidateApiCache = (matcher?: string) => {
  if (typeof window === 'undefined') {
    return
  }

  const storages = [window.localStorage, window.sessionStorage]

  storages.forEach((storage) => {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index)

      if (!key || !key.startsWith(API_CACHE_PREFIX)) {
        continue
      }

      if (!matcher || key.includes(matcher)) {
        storage.removeItem(key)
      }
    }
  })
}

export const clearApiCache = () => {
  invalidateApiCache()
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data ?? null,
      params: config.params,
    })

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      (response.data.logout || response.data.message === 'Access denied')
    ) {
      localStorage.removeItem('authToken')
      window.location.href = '/signin'

      return Promise.reject(new Error('Session expired. Redirecting to sign in.'))
    }

    return response
  },
  (error) => {
    const isUnauthorized = error.response && error.response.status === 401
    const isLogout =
      error.response && error.response.data && error.response.data.logout
    const isAccessDenied =
      error.response &&
      error.response.data &&
      error.response.data.message === 'Access denied'

    if (isUnauthorized || isLogout || isAccessDenied) {
      localStorage.removeItem('authToken')
      window.location.href = '/signin'

      return Promise.reject(new Error('Session expired. Redirecting to sign in.'))
    }

    return Promise.reject(error)
  },
)

export const postRequest = async <TResponse>(
  url: string,
  payload: unknown,
  headers: Record<string, string> = {},
) => {
  try {
    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData
    const response = await api.post<TResponse>(url, payload, {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
      },
    })

    return response.data
  } catch (error) {
    console.error('Error in postRequest:', error)

    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? 'Network error. Please try again.',
      )
    }

    throw error
  }
}

export const getRequest = async <TResponse>(
  url: string,
  params: unknown = null,
  config: Record<string, unknown> = {},
) => {
  try {
    const responseType = config.responseType as string | undefined
    const cacheConfig = (config.cache as CacheOptions | undefined) ?? {}
    const shouldUseCache = Boolean(cacheConfig.enabled) && responseType !== 'blob'
    const cacheStorage = cacheConfig.storage ?? 'local'
    const cacheTtlMs = cacheConfig.ttlMs ?? DEFAULT_API_CACHE_TTL_MS
    const cacheKey = buildCacheKey(url, params, cacheConfig.cacheKey)

    if (shouldUseCache && !cacheConfig.forceRefresh) {
      const cachedData = readCache<TResponse>(cacheStorage, cacheKey)

      if (cachedData !== null) {
        return cachedData
      }
    }

    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...((config.headers as Record<string, string> | undefined) ?? {}),
      },
      params,
      ...config,
    }

    delete (axiosConfig as { cache?: CacheOptions }).cache

    const response = await api.get<TResponse>(url, axiosConfig)

    if (responseType === 'blob') {
      return response
    }

    if (shouldUseCache) {
      writeCache(cacheStorage, cacheKey, response.data, cacheTtlMs)
    }

    return response.data
  } catch (error) {
    console.error('Error in getRequest:', error)

    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? 'Network error. Please try again.',
      )
    }

    throw error
  }
}

export const deleteRequest = async <TResponse>(
  url: string,
  config: Record<string, unknown> = {},
) => {
  try {
    const response = await api.delete<TResponse>(url, {
      headers: {
        'Content-Type': 'application/json',
        ...((config.headers as Record<string, string> | undefined) ?? {}),
      },
      ...config,
    })

    invalidateApiCache()

    return response.data
  } catch (error) {
    console.error('Error in deleteRequest:', error)

    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? 'Network error. Please try again.',
      )
    }

    throw error
  }
}

export const putRequest = async <TResponse>(
  url: string,
  data: unknown,
  config: Record<string, unknown> = {},
) => {
  try {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
    const response = await api.put<TResponse>(url, data, {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...((config.headers as Record<string, string> | undefined) ?? {}),
      },
      ...config,
    })

    invalidateApiCache()

    return response.data
  } catch (error) {
    console.error('Error in putRequest:', error)

    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? 'Network error. Please try again.',
      )
    }

    throw error
  }
}

export const patchRequest = async <TResponse>(
  url: string,
  data: unknown = {},
  config: Record<string, unknown> = {},
) => {
  try {
    const response = await api.patch<TResponse>(url, data, {
      headers: {
        'Content-Type': 'application/json',
        ...((config.headers as Record<string, string> | undefined) ?? {}),
      },
      ...config,
    })

    invalidateApiCache()

    return response.data
  } catch (error) {
    console.error('Error in patchRequest:', error)

    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ?? 'Network error. Please try again.',
      )
    }

    throw error
  }
}


import { call, put, takeLatest } from 'redux-saga/effects'
import { DEFAULT_API_CACHE_TTL_MS, getRequest } from '../../api/apiHelper'
import { API_ROUTES } from '../../api/apiRoutes'
import { toast } from 'react-toastify'
import {
  GET_VIDEOS_FAILURE,
  GET_VIDEOS_REQUEST,
  GET_VIDEOS_SUCCESS,
} from '../action/actionType'

const normalizeRole = (role: string | undefined) =>
  (role ?? '').trim().toLowerCase().replace(/[_\s-]+/g, '')

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `video-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const mapVideos = (response: any) => {
  const responseData = response?.data || response?.result || response || {}
  const list =
    (responseData.videos as any[]) ||
    (responseData.data?.videos as any[]) ||
    (responseData.data as any[]) ||
    (responseData.items as any[]) ||
    (Array.isArray(responseData) ? responseData : [])

  return list.map((video: any) => ({
    id: video.id || video._id || generateId(),
    name: video.name || 'Unknown channel owner',
    channelName: video.channelName || '',
    title: video.title || video.videoTitle || video.name || 'Untitled video',
    description:
      video.description || video.videoDescription || video.summary || 'No description available.',
    keywords: Array.isArray(video.keywords)
      ? video.keywords.filter((keyword: unknown) => typeof keyword === 'string')
      : typeof video.keywords === 'string'
        ? video.keywords.split(',').map((keyword: string) => keyword.trim()).filter(Boolean)
        : [],
    videoTitle: video.videoTitle || video.title || 'Untitled clip',
    videoDescription:
      video.videoDescription || video.description || video.summary || 'No video description available.',
    videoCategory: video.videoCategory || video.category || 'Uncategorized',
    videoPosterUrl: video.videoPosterUrl || video.posterUrl || video.thumbnailUrl || '',
    videoUrl: video.videoUrl || video.url || '',
    viewCount: Number(video.viewCount ?? video.views ?? video.totalViews ?? 0),
    uploadedBy: video.uploadedBy || '',
    uploadedByName: video.uploadedByName || video.name || 'Unknown uploader',
    uploadedByEmail: video.uploadedByEmail || '',
    createdAt: video.createdAt || video.uploadedAt || video.updatedAt || '',
  }))
}

function* getVideosSaga(action: any): any {
  try {
    const isSuperadmin = normalizeRole(action.payload?.role) === 'superadmin'
    const endpoint = isSuperadmin ? API_ROUTES.VIDEOS.ALL : API_ROUTES.VIDEOS.MY_VIDEOS

    const response = yield call(getRequest, endpoint, null, {
      cache: {
        enabled: true,
        ttlMs: DEFAULT_API_CACHE_TTL_MS,
        storage: 'local',
        cacheKey: endpoint,
      },
    })

    yield put({
      type: GET_VIDEOS_SUCCESS,
      payload: mapVideos(response),
    })
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch videos'
    yield put({ type: GET_VIDEOS_FAILURE, payload: message })
    toast.error(message)
  }
}

export default function* videoSaga() {
  yield takeLatest(GET_VIDEOS_REQUEST, getVideosSaga)
}
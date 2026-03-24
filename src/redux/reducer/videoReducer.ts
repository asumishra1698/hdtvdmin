import {
  DELETE_VIDEO_FAILURE,
  DELETE_VIDEO_REQUEST,
  DELETE_VIDEO_SUCCESS,
  GET_VIDEOS_FAILURE,
  GET_VIDEOS_REQUEST,
  GET_VIDEOS_SUCCESS,
  SIGN_OUT,
} from '../action/actionType'
import type { VideoRecord } from '../action/videoAction'

interface VideosState {
  items: VideoRecord[]
  loading: boolean
  error: string | null
  lastFetched: number | null
  deletingIds: string[]
}

type VideosAction =
  | { type: typeof GET_VIDEOS_REQUEST }
  | { type: typeof GET_VIDEOS_SUCCESS; payload: VideoRecord[] }
  | { type: typeof GET_VIDEOS_FAILURE; payload: string }
  | { type: typeof DELETE_VIDEO_REQUEST; payload: { videoId: string } }
  | { type: typeof DELETE_VIDEO_SUCCESS; payload: string }
  | { type: typeof DELETE_VIDEO_FAILURE; payload: { videoId: string; error: string } }
  | { type: typeof SIGN_OUT }

const initialState: VideosState = {
  items: [],
  loading: false,
  error: null,
  lastFetched: null,
  deletingIds: [],
}

function videoReducer(
  state: VideosState = initialState,
  action: VideosAction,
): VideosState {
  switch (action.type) {
    case GET_VIDEOS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case GET_VIDEOS_SUCCESS:
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      }

    case GET_VIDEOS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case DELETE_VIDEO_REQUEST:
      return {
        ...state,
        deletingIds: state.deletingIds.includes(action.payload.videoId)
          ? state.deletingIds
          : [...state.deletingIds, action.payload.videoId],
      }

    case DELETE_VIDEO_SUCCESS:
      return {
        ...state,
        items: state.items.filter((video) => video.id !== action.payload),
        deletingIds: state.deletingIds.filter((videoId) => videoId !== action.payload),
        error: null,
        lastFetched: Date.now(),
      }

    case DELETE_VIDEO_FAILURE:
      return {
        ...state,
        deletingIds: state.deletingIds.filter(
          (videoId) => videoId !== action.payload.videoId,
        ),
        error: action.payload.error,
      }

    case SIGN_OUT:
      return initialState

    default:
      return state
  }
}

export default videoReducer
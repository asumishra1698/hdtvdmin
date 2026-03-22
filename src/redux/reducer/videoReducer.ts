import {
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
}

type VideosAction =
  | { type: typeof GET_VIDEOS_REQUEST }
  | { type: typeof GET_VIDEOS_SUCCESS; payload: VideoRecord[] }
  | { type: typeof GET_VIDEOS_FAILURE; payload: string }
  | { type: typeof SIGN_OUT }

const initialState: VideosState = {
  items: [],
  loading: false,
  error: null,
  lastFetched: null,
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

    case SIGN_OUT:
      return initialState

    default:
      return state
  }
}

export default videoReducer
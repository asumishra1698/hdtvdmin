import {
  DELETE_VIDEO_FAILURE,
  DELETE_VIDEO_REQUEST,
  DELETE_VIDEO_SUCCESS,
  GET_VIDEOS_FAILURE,
  GET_VIDEOS_REQUEST,
  GET_VIDEOS_SUCCESS,
} from './actionType'

export interface GetVideosPayload {
  role?: string
}

export interface DeleteVideoPayload {
  videoId: string
}

export interface VideoRecord {
  id: string
  name: string
  channelName: string
  title: string
  description: string
  keywords: string[]
  videoTitle: string
  videoDescription: string
  videoCategory: string
  videoPosterUrl: string
  videoUrl: string
  viewCount: number
  uploadedBy: string
  uploadedByName: string
  uploadedByEmail: string
  createdAt: string
}

export const getVideosRequest = (payload?: GetVideosPayload) => ({
  type: GET_VIDEOS_REQUEST,
  payload,
} as const)

export const getVideosSuccess = (videos: VideoRecord[]) => ({
  type: GET_VIDEOS_SUCCESS,
  payload: videos,
} as const)

export const getVideosFailure = (error: string) => ({
  type: GET_VIDEOS_FAILURE,
  payload: error,
} as const)

export const deleteVideoRequest = (payload: DeleteVideoPayload) => ({
  type: DELETE_VIDEO_REQUEST,
  payload,
} as const)

export const deleteVideoSuccess = (videoId: string) => ({
  type: DELETE_VIDEO_SUCCESS,
  payload: videoId,
} as const)

export const deleteVideoFailure = (payload: { videoId: string; error: string }) => ({
  type: DELETE_VIDEO_FAILURE,
  payload,
} as const)
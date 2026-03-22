import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { initializeApp } from 'firebase/app'
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'
import { API_ROUTES } from '../../api/apiRoutes'
import { postRequest } from '../../api/apiHelper'
import useDocumentTitle from '../../hooks/useDocumentTitle'

const firebaseConfig = {
  projectId: 'hdtvbharat-ee20b',
  appId: '1:662394641663:web:400b1f98418150ca38c0ca',
  storageBucket: 'hdtvbharat-ee20b.firebasestorage.app',
  apiKey: 'AIzaSyD5BdChJ8wwHJHncWLhUvU5Ev1PMpSB4_g',
  authDomain: 'hdtvbharat-ee20b.firebaseapp.com',
  messagingSenderId: '662394641663',
  measurementId: 'G-5QHJK4QT3G',
}

const firebaseApp = initializeApp(firebaseConfig)
const storage = getStorage(firebaseApp)

const videoCategories = [
  'Bollywood',
  'Movies',
  'Music',
  'News',
  'TV Shows',
  'Trending',
  'Live TV',
  'Web Series',
] as const

interface UploadResponse {
  message?: string
  [key: string]: unknown
}

interface UploadFormState {
  channelName: string
  name: string
  title: string
  videoTitle: string
  description: string
  videoDescription: string
  videoCategory: string
  keywords: string
}

type StatusTone = 'idle' | 'success' | 'error' | 'working'

const initialFormState: UploadFormState = {
  channelName: '',
  name: '',
  title: '',
  videoTitle: '',
  description: '',
  videoDescription: '',
  videoCategory: 'Bollywood',
  keywords: '',
}

const statusToneClass: Record<StatusTone, string> = {
  idle: 'border-white/10 bg-white/5 text-slate-300',
  working: 'border-brand-cyan/20 bg-brand-cyan/10 text-brand-cyan',
  success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  error: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
}

const progressBarClass = (value: number) => {
  if (value >= 100) {
    return 'bg-emerald-400'
  }

  if (value > 0) {
    return 'bg-brand-cyan'
  }

  return 'bg-white/10'
}

const slugifyFolderName = (value: string) => {
  const normalizedValue = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return normalizedValue || 'user'
}

const uploadFile = (
  file: File,
  storagePath: string,
  onProgress: (progress: number) => void,
) =>
  new Promise<{ url: string; path: string }>((resolve, reject) => {
    const storageRef = ref(storage, storagePath)
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    })

    task.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        )
        onProgress(progress)
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve({
          url,
          path: task.snapshot.ref.fullPath,
        })
      },
    )
  })

function UploadVideoPage() {
  useDocumentTitle('Upload Video')

  const [formState, setFormState] = useState<UploadFormState>(initialFormState)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [posterProgress, setPosterProgress] = useState(0)
  const [videoProgress, setVideoProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Ready to upload.')
  const [statusTone, setStatusTone] = useState<StatusTone>('idle')
  const [responsePayload, setResponsePayload] = useState<UploadResponse | string>(
    'No upload yet.',
  )

  const updateField = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setFormState((currentState) => ({
      ...currentState,
      [name]: value,
    }))
  }

  const updateFile = (event: ChangeEvent<HTMLInputElement>, type: 'poster' | 'video') => {
    const selectedFile = event.target.files?.[0] ?? null

    if (type === 'poster') {
      setPosterFile(selectedFile)
      setPosterProgress(0)
      return
    }

    setVideoFile(selectedFile)
    setVideoProgress(0)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const token = localStorage.getItem('authToken')?.trim() ?? ''

    if (!token) {
      setStatusTone('error')
      setStatusMessage('Your session token is missing. Sign in again before uploading.')
      return
    }

    if (!posterFile || !videoFile) {
      setStatusTone('error')
      setStatusMessage('Poster file and video file are required.')
      return
    }

    try {
      setIsSubmitting(true)
      setPosterProgress(0)
      setVideoProgress(0)
      setStatusTone('working')
      setStatusMessage('Uploading poster to Firebase Storage...')
      setResponsePayload('Upload in progress...')

      const uploaderFolder = slugifyFolderName(formState.name)
      const timestamp = Date.now()

      const uploadedPoster = await uploadFile(
        posterFile,
        `videos/${uploaderFolder}/posters/${timestamp}-${posterFile.name}`,
        setPosterProgress,
      )

      setStatusMessage('Uploading video to Firebase Storage...')

      const uploadedVideo = await uploadFile(
        videoFile,
        `videos/${uploaderFolder}/files/${timestamp}-${videoFile.name}`,
        setVideoProgress,
      )

      setStatusMessage('Registering uploaded video with backend...')

      const payload = {
        ...formState,
        videoPosterUrl: uploadedPoster.url,
        videoPosterPath: uploadedPoster.path,
        videoUrl: uploadedVideo.url,
        videoPath: uploadedVideo.path,
      }

      const response = await postRequest<UploadResponse>(API_ROUTES.VIDEOS.UPLOAD, payload)
      setResponsePayload(response)
      setStatusTone('success')
      setStatusMessage(response.message ?? 'Upload completed successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.'

      setStatusTone('error')
      setStatusMessage(message)
      setResponsePayload(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <header className="glass-panel px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brand-amber">Video pipeline</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Upload video</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Upload poster and media files directly to Firebase Storage, then send
              the final metadata to the backend API from the dashboard workflow.
            </p>
          </div>

          <Link
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            to="/dashboard/videos"
          >
            Back to all videos
          </Link>
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
        <section className="glass-panel p-6 sm:p-8">
          {/* <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-cyan">Direct upload</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Publish-ready intake</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              Session token applied
            </span>
          </div> */}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block uppercase tracking-[0.22em] text-slate-400">Channel Name</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-cyan/40 focus:bg-white/[0.07]"
                  name="channelName"
                  onChange={updateField}
                  required
                  value={formState.channelName}
                />
              </label>

              <label className="block text-sm text-slate-300">
                <span className="mb-2 block uppercase tracking-[0.22em] text-slate-400">Business Name</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-cyan/40 focus:bg-white/[0.07]"
                  name="name"
                  onChange={updateField}
                  required
                  value={formState.name}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block uppercase tracking-[0.22em] text-slate-400">Title</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-cyan/40 focus:bg-white/[0.07]"
                  name="title"
                  onChange={updateField}
                  required
                  value={formState.title}
                />
              </label>

              <label className="block text-sm text-slate-300">
                <span className="mb-2 block uppercase tracking-[0.22em] text-slate-400">Video Title</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-cyan/40 focus:bg-white/[0.07]"
                  name="videoTitle"
                  onChange={updateField}
                  required
                  value={formState.videoTitle}
                />
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block uppercase tracking-[0.22em] text-slate-400">Video Category</span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-brand-cyan/40 focus:bg-white/[0.07]"
                  name="videoCategory"
                  onChange={updateField}
                  required
                  value={formState.videoCategory}
                >
                  {videoCategories.map((category) => (
                    <option key={category} className="bg-slate-900 text-white" value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm text-slate-300">
                <span className="mb-2 block uppercase tracking-[0.22em] text-slate-400">Keywords</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-cyan/40 focus:bg-white/[0.07]"
                  name="keywords"
                  onChange={updateField}
                  value={formState.keywords}
                />
              </label>
            </div>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block uppercase tracking-[0.22em] text-slate-400">Description</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-cyan/40 focus:bg-white/[0.07]"
                name="description"
                onChange={updateField}
                required
                value={formState.description}
              />
            </label>

            <label className="block text-sm text-slate-300">
              <span className="mb-2 block uppercase tracking-[0.22em] text-slate-400">Video Description</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-cyan/40 focus:bg-white/[0.07]"
                name="videoDescription"
                onChange={updateField}
                required
                value={formState.videoDescription}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm text-slate-300">
                <span className="mb-2 block uppercase tracking-[0.22em] text-slate-400">Poster File</span>
                <input
                  accept="image/png,image/jpeg,image/webp"
                  className="block w-full rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-brand-amber file:px-4 file:py-2 file:font-semibold file:text-black hover:border-white/25"
                  onChange={(event) => updateFile(event, 'poster')}
                  required
                  type="file"
                />
                <p className="mt-2 text-xs text-slate-500">
                  {posterFile ? posterFile.name : 'PNG, JPEG, or WEBP poster image.'}
                </p>
              </label>

              <label className="block text-sm text-slate-300">
                <span className="mb-2 block uppercase tracking-[0.22em] text-slate-400">Video File</span>
                <input
                  accept="video/mp4,video/mpeg,video/quicktime,video/webm,video/x-matroska"
                  className="block w-full rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-brand-cyan file:px-4 file:py-2 file:font-semibold file:text-slate-950 hover:border-white/25"
                  onChange={(event) => updateFile(event, 'video')}
                  required
                  type="file"
                />
                <p className="mt-2 text-xs text-slate-500">
                  {videoFile ? videoFile.name : 'MP4, MPEG, MOV, WEBM, or MKV video file.'}
                </p>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>Poster upload progress</span>
                  <span>{posterProgress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${progressBarClass(posterProgress)}`}
                    style={{ width: `${posterProgress}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                  <span>Video upload progress</span>
                  <span>{videoProgress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${progressBarClass(videoProgress)}`}
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center justify-center rounded-2xl bg-brand-amber px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300 disabled:cursor-wait disabled:bg-slate-600 disabled:text-slate-300"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Now'}
              </button>

              <Link
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                to="/dashboard/videos"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-amber">Notes</p>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
              <li>Max 2 GB Video Upload Allowed.</li>
              <li>Uploads go straight to Firebase Storage using resumable SDK uploads.</li>             
              <li>Your current dashboard session token is sent automatically.</li>
            </ul>
          </section>

          <section className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-cyan">Status</p>
            <div className={`mt-5 rounded-[22px] border px-4 py-4 text-sm leading-6 ${statusToneClass[statusTone]}`}>
              {statusMessage}
            </div>
          </section>

          <section className="glass-panel p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-cyan">Response</p>
            <pre className="modern-scrollbar mt-5 overflow-auto rounded-[22px] border border-white/10 bg-black/20 p-4 text-xs leading-6 text-slate-300">
              {typeof responsePayload === 'string'
                ? responsePayload
                : JSON.stringify(responsePayload, null, 2)}
            </pre>
          </section>
        </aside>
      </section>
    </>
  )
}

export default UploadVideoPage
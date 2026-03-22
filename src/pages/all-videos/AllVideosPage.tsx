import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import { getVideosRequest } from '../../redux/action/videoAction'
import type { AppDispatch, RootState } from '../../redux/store'

const formatDate = (value: string) => {
  if (!value) {
    return 'Date unavailable'
  }

  const parsedValue = new Date(value)

  if (Number.isNaN(parsedValue.getTime())) {
    return value
  }

  return parsedValue.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const normalizeRole = (role: string | undefined) =>
  (role ?? '').trim().toLowerCase().replace(/[_\s-]+/g, '')

const formatKeywords = (keywords: string[]) => {
  if (!keywords.length) {
    return 'No keywords'
  }

  return keywords.join(', ')
}

function AllVideosPage() {
  useDocumentTitle('All Videos')

  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)
  const videos = useSelector((state: RootState) => state.videos.items)
  const videosLoading = useSelector((state: RootState) => state.videos.loading)
  const videosError = useSelector((state: RootState) => state.videos.error)

  useEffect(() => {
    if (!user?.role) {
      return
    }

    dispatch(getVideosRequest({ role: user.role }))
  }, [dispatch, user?.role])

  const isSuperadmin = normalizeRole(user?.role) === 'superadmin'
  const categoriesCount = new Set(videos.map((video) => video.videoCategory).filter(Boolean)).size
  const uploadersCount = new Set(videos.map((video) => video.uploadedBy || video.uploadedByEmail).filter(Boolean)).size

  return (
    <>
      <header className="glass-panel px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-brand-amber">Video library</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">All videos</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {isSuperadmin
                ? 'Track uploads, review readiness, and publishing status across the full catalog.'
                : 'Track uploads, review readiness, and publishing status for your assigned videos.'}
            </p>
          </div>

          <Link
            className="inline-flex items-center justify-center rounded-2xl bg-brand-amber px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300"
            to="/dashboard/videos/upload"
          >
            Upload Video
          </Link>
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Video count</p>
          <p className="mt-3 text-3xl font-semibold text-white">{videos.length}</p>
          <p className="mt-3 text-sm text-slate-300">
            {isSuperadmin ? 'Visible across all admin uploads.' : 'Visible in your personal upload scope.'}
          </p>
        </article>

        <article className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-cyan">Categories</p>
          <p className="mt-3 text-3xl font-semibold text-white">{categoriesCount}</p>
          <p className="mt-3 text-sm text-slate-300">Unique video categories returned by the API.</p>
        </article>

        <article className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-brand-amber">Uploaders</p>
          <p className="mt-3 text-3xl font-semibold text-white">{uploadersCount}</p>
          <p className="mt-3 text-sm text-slate-300">Distinct uploaders represented in the result set.</p>
        </article>
      </section>

      {videosError ? (
        <section className="glass-panel p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-rose-300">Fetch error</p>
              <p className="mt-2 text-base text-slate-200">{videosError}</p>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
              onClick={() => dispatch(getVideosRequest({ role: user?.role }))}
              type="button"
            >
              Retry
            </button>
          </div>
        </section>
      ) : null}

      <section className="glass-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/10 px-6 py-2 sm:flex-row sm:items-center sm:justify-between">          
          <p className="text-sm text-slate-400">
            {videosLoading ? 'Loading records...' : `${videos.length} rows loaded`}
          </p>
        </div>

        <div className="modern-scrollbar overflow-x-auto">
          <table className="w-max min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-[0.24em] text-slate-400">
                <th className="px-6 py-4 font-medium">Poster</th>
                <th className="min-w-[220px] px-6 py-4 font-medium">Preview</th>
                <th className="px-6 py-4 font-medium">Video Details</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Channel</th>
                <th className="px-6 py-4 font-medium">Uploader</th>
                
                <th className="px-6 py-4 font-medium">Keywords</th>
                <th className="px-6 py-4 font-medium">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {videosLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="px-6 py-5" colSpan={8}>
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 w-40 rounded bg-white/10" />
                          <div className="h-4 w-3/4 rounded bg-white/10" />
                        </div>
                      </td>
                    </tr>
                  ))
                : videos.map((video) => (
                    <tr
                      key={video.id}
                      className="border-b border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-6 py-5 align-top">
                        {video.videoPosterUrl ? (
                          <img
                            alt={`${video.title} poster`}
                            className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                            src={video.videoPosterUrl}
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                            None
                          </div>
                        )}
                      </td>
                      <td className="min-w-[220px] px-6 py-5 align-top">
                        {video.videoUrl ? (
                          <div className="w-[180px]">
                            <video
                              className="block aspect-video w-full rounded-2xl border border-white/10 bg-slate-950 object-cover"
                              controls
                              muted
                              preload="metadata"
                              src={video.videoUrl}
                            >
                              <track kind="captions" />
                            </video>
                          </div>
                        ) : (
                          <div className="flex aspect-video w-[180px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                            No video
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="min-w-[320px]">
                          <p className="font-semibold text-white">{video.title}</p>
                          <p className="mt-1 text-sm font-medium text-brand-cyan">{video.videoTitle}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                            Owner: {video.name}
                          </p>
                          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                            {video.description}
                          </p>                          
                        </div>
                      </td>
                        <td className="px-6 py-5 align-top">
                        <div className="min-w-[120px]">
                          <span className="rounded-full border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-brand-cyan">
                            {video.videoCategory}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top text-sm text-slate-300">
                        <div className="min-w-[140px]">
                          <p>{video.channelName}</p>                          
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top text-sm text-slate-300">
                        <div className="min-w-[220px]">
                          <p className="font-medium text-white">{video.uploadedByName}</p>
                          <p className="mt-2 break-all text-slate-400">{video.uploadedByEmail || 'No email'}</p>
                        </div>
                      </td>
                    
                      <td className="px-6 py-5 align-top text-sm text-slate-300">
                        <div className="min-w-[220px] leading-6">
                          {formatKeywords(video.keywords)}
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top text-sm text-slate-300">
                        <div className="min-w-[120px]">
                          <p>{formatDate(video.createdAt)}</p>
                          <p className="mt-2 break-all text-xs text-slate-500">{video.uploadedBy}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </section>

      {!videosLoading && !videosError && videos.length === 0 ? (
        <section className="glass-panel p-8 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">No videos found</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">The API returned an empty video list.</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Upload a new video or verify that your account has access to the expected records.
          </p>
        </section>
      ) : null}
    </>
  )
}

export default AllVideosPage
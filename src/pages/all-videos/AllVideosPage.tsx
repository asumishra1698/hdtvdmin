import useDocumentTitle from '../../hooks/useDocumentTitle'

const videos = [
  { title: 'Prime Time Promo Reel', duration: '02:34', quality: '4K Ready', state: 'Published' },
  { title: 'Weekend Highlights Package', duration: '08:12', quality: 'Needs review', state: 'Draft' },
  { title: 'Regional News Loop', duration: '15:22', quality: 'HD Mastered', state: 'Scheduled' },
]

function AllVideosPage() {
  useDocumentTitle('All Videos')

  return (
    <>
      <header className="glass-panel px-6 py-6 sm:px-8">
        <p className="text-sm uppercase tracking-[0.35em] text-brand-amber">Video library</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">All videos</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Track uploads, review readiness, and publishing status across your catalog.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-3">
        {videos.map((video) => (
          <article key={video.title} className="glass-panel p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-cyan">{video.state}</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{video.title}</h3>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p>Duration: {video.duration}</p>
              <p>Quality: {video.quality}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}

export default AllVideosPage
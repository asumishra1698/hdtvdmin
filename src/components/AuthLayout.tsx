import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps extends PropsWithChildren {
  brand?: string
  title: string
  description?: string
  titleClassName?: string
  footerText: string
  footerLinkLabel: string
  footerTo: string
}

function AuthLayout({
  brand = 'HdtvBharat',
  children,
  description,
  footerLinkLabel,
  footerText,
  footerTo,
  title,
  titleClassName,
}: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#01030f] px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(17,24,39,0.55),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(30,41,59,0.28),_transparent_30%)]" />
      <section className="auth-card relative z-10 w-full max-w-[390px] px-6 py-8 sm:px-8 sm:py-9">
        <div className="mb-7 text-center">
          <h1 className={titleClassName ?? 'text-4xl font-medium leading-tight text-white sm:text-[3.1rem]'}>
            {title}
            {brand ? (
              <>
                {' '}
                <span className="inline-block">{brand}</span>
              </>
            ) : null}
          </h1>
          {description ? (
            <p className="mt-4 text-sm leading-6 text-slate-400">{description}</p>
          ) : null}
        </div>

        {children}

        <p className="mt-6 text-center text-sm text-white/90">
          {footerText}{' '}
          <Link
            className="font-medium text-brand-amber underline underline-offset-2 transition hover:text-orange-300"
            to={footerTo}
          >
            {footerLinkLabel}
          </Link>
        </p>
      </section>
    </main>
  )
}

export default AuthLayout
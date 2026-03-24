import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DEFAULT_API_CACHE_TTL_MS } from '../api/apiHelper'
import usePagination from '../hooks/usePagination'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { getAllUsersRequest } from '../redux/action/authAction'
import type { AppDispatch, RootState } from '../redux/store'

const paginationButtonClassName =
  'rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 disabled:cursor-not-allowed disabled:text-slate-500'

const selectClassName =
  'rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-brand-amber/60'

const panelClassName = 'rounded-[24px] border border-white/10 bg-white/5 p-5'

const rowsPerPageOptions = [10, 20, 50]

function AllUsersPage() {
  useDocumentTitle('All Users')

  const dispatch = useDispatch<AppDispatch>()
  const { users, usersError, usersLastFetched, usersLoading, usersPagination } = useSelector(
    (state: RootState) => state.auth,
  )
  const { hasNextPage, hasPreviousPage, limit, page, setLimit, setPage } = usePagination({
    initialPage: usersPagination.page,
    initialLimit: usersPagination.limit,
    totalPages: usersPagination.totalPages,
  })
  const hasUsers = users.length > 0
  const isUsersCacheFresh =
    hasUsers &&
    usersLastFetched !== null &&
    usersPagination.page === page &&
    usersPagination.limit === limit &&
    Date.now() - usersLastFetched < DEFAULT_API_CACHE_TTL_MS

  useEffect(() => {
    if (!isUsersCacheFresh) {
      dispatch(getAllUsersRequest({ page, limit }))
    }
  }, [dispatch, isUsersCacheFresh, limit, page])

  const rangeStart =
    usersPagination.total === 0
      ? 0
      : (usersPagination.page - 1) * usersPagination.limit + 1
  const rangeEnd = usersPagination.total === 0 ? 0 : rangeStart + users.length - 1

  return (
    <>
      <header className="glass-panel px-6 py-6 sm:px-8">
        <p className="text-sm uppercase tracking-[0.35em] text-brand-cyan">User management</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">All users</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Review every account, current role assignment, and onboarding state from one list.
        </p>
      </header>

      <section className="glass-panel px-6 py-6">
        <div className="space-y-4">
          {usersLoading ? (
            <article className={`${panelClassName} text-sm text-slate-300`}>
              Loading users...
            </article>
          ) : null}

          {!usersLoading && usersError ? (
            <article className="rounded-[24px] border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-200">
              {usersError}
            </article>
          ) : null}

          {!usersLoading && !usersError && users.length === 0 ? (
            <article className={`${panelClassName} text-sm text-slate-300`}>
              No users found.
            </article>
          ) : null}

          {users.map((user) => (
            <article key={user.id || user.email} className={panelClassName}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{user.email}</p>
                  {user.phone ? <p className="mt-2 text-sm text-slate-500">{user.phone}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.24em]">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-300">
                    {user.role}
                  </span>
                  <span className="rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-2 text-brand-cyan">
                    {user.status ?? 'Active'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">User directory</p>
                <p className="mt-1 text-sm text-slate-400">
                  Showing {rangeStart}-{rangeEnd} of {usersPagination.total} users
                </p>
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-300">
                <span>Rows per page</span>
                <select
                  className={selectClassName}
                  value={limit}
                  onChange={(event) => setLimit(Number(event.target.value))}
                >
                  {rowsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                Page {usersPagination.page} of {usersPagination.totalPages}
              </p>

              <div className="flex items-center gap-3">
                <button
                  className={paginationButtonClassName}
                  disabled={!hasPreviousPage || usersLoading}
                  type="button"
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <button
                  className={paginationButtonClassName}
                  disabled={!hasNextPage || usersLoading}
                  type="button"
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default AllUsersPage
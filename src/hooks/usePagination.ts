import { useEffect, useState } from 'react'

interface UsePaginationOptions {
  initialPage?: number
  initialLimit?: number
  totalPages?: number
}

function usePagination({
  initialPage = 1,
  initialLimit = 20,
  totalPages = 1,
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  useEffect(() => {
    setPage(initialPage)
  }, [initialPage])

  useEffect(() => {
    setLimit(initialLimit)
  }, [initialLimit])

  useEffect(() => {
    setPage((current) => Math.min(Math.max(current, 1), Math.max(totalPages, 1)))
  }, [totalPages])

  const updatePage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), Math.max(totalPages, 1)))
  }

  const updateLimit = (nextLimit: number) => {
    setLimit(nextLimit)
    setPage(1)
  }

  return {
    page,
    limit,
    setPage: updatePage,
    setLimit: updateLimit,
    hasPreviousPage: page > 1,
    hasNextPage: page < Math.max(totalPages, 1),
  }
}

export default usePagination
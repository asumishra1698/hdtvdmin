import { useEffect } from 'react'

function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `HDTV Admin | ${title}`
  }, [title])
}

export default useDocumentTitle
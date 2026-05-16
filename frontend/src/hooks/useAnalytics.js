import { useEffect } from 'react'
import { trackVisit, trackClick } from '../api'

export function usePageView(page, productId = null) {
  useEffect(() => {
    trackVisit(page, productId)
  }, [page, productId])
}

export { trackClick }

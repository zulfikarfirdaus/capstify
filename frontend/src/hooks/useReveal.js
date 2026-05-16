import { useEffect, useRef } from 'react'

export default function useReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const intersect = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            intersect.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px', ...options }
    )

    const watch = (node) => {
      if (node.nodeType !== 1) return
      if (node.classList.contains('reveal') && !node.classList.contains('visible')) {
        intersect.observe(node)
      }
      node.querySelectorAll?.('.reveal:not(.visible)').forEach((el) => intersect.observe(el))
    }

    // Observe elements already in the DOM
    watch(container)

    // Pick up elements added later (async data renders)
    const mutObs = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach(watch))
    })
    mutObs.observe(container, { childList: true, subtree: true })

    return () => {
      intersect.disconnect()
      mutObs.disconnect()
    }
  }, [])

  return ref
}

/**
 * useDarkMode Hook
 * ================
 * Persists dark mode preference in localStorage and applies
 * the "dark" class to the document root.
 */

'use client'

import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Read from localStorage on mount
    const stored = localStorage.getItem('dutchguide-dark-mode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored ? stored === 'true' : prefersDark
    setIsDark(initial)
    document.documentElement.classList.toggle('dark', initial)
  }, [])

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('dutchguide-dark-mode', String(next))
      return next
    })
  }

  return { isDark, toggle }
}

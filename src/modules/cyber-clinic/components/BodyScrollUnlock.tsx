'use client'

import { useEffect } from 'react'

export default function BodyScrollUnlock() {
  useEffect(() => {
    document.body.classList.remove('mobile-menu-visible')
  }, [])

  return null
}

'use client'

import { useEffect } from 'react'

export default function AosInit() {
  useEffect(() => {
    import('aos').then((Aos) => {
      Aos.default.init({ duration: 1000 })
    })
  }, [])

  return null
}

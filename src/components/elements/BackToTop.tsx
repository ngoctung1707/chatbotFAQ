'use client'
import { useEffect, useState } from 'react'
import styles from './BackToTop.module.css'

export default function BackToTop() {
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleBackToTopClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {hasScrolled && (
        <a
          className={`scroll__top ${styles.backToTop}`}
          href="#"
          onClick={handleBackToTopClick}
          aria-label="Back to top"
        >
          <i className="fas fa-angle-up"></i>
        </a>
      )}
    </>
  )
}

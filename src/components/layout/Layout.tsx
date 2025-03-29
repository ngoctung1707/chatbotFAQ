'use client'

import Aos from 'aos'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import BackToTop from '../elements/BackToTop'
import DataBg from '../elements/DataBg'
import Breadcrumb from './Breadcrumb'
import PageHead from './PageHead'
import Header from './header/Header'

import type { WOW } from 'wowjs'
import Footer from '@/components/layout/footer/Footer'

export const metadata = {
  title: 'BK Fintech',
}

declare global {
  interface Window {
    wow?: WOW
  }
}
type LayoutProps = {
  children: React.ReactNode
  transparent?: boolean
  headTitle?: string
  breadcrumbTitle?: string
}

const Layout = ({ headTitle, breadcrumbTitle, children, transparent }: LayoutProps) => {
  const [scroll, setScroll] = useState(false)
  const [isMobileMenu, setMobileMenu] = useState(false)

  const SelectedHeader = Header
  const SelectedFooter = Footer

  const router = useRouter()

  const handleMobileMenu = () => {
    setMobileMenu(!isMobileMenu)
    document.body.classList.toggle('mobile-menu-visible', !isMobileMenu)
  }

  useEffect(() => {
    if (!window.wow) {
      import('wowjs').then((module) => {
        window.wow = new module.WOW({ live: false })
        window.wow.init()
      })
    }
    Aos.init()

    const handleScroll = () => setScroll(window.scrollY > 100)
    const debounce = (func: () => void, wait: number) => {
      let timeout: NodeJS.Timeout
      return () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(), wait)
      }
    }
    const debouncedScroll = debounce(handleScroll, 50)

    document.addEventListener('scroll', debouncedScroll)
    return () => document.removeEventListener('scroll', debouncedScroll)
  }, [])

  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenu(false)
      document.body.classList.remove('mobile-menu-visible')
    }

    handleRouteChange()
  }, [router])

  return (
    <>
      <PageHead headTitle={headTitle} />
      <DataBg />

      <SelectedHeader
        scroll={scroll}
        handleMobileMenu={handleMobileMenu}
        transparent={transparent}
      />

      <main className="fix">
        {breadcrumbTitle && <Breadcrumb breadcrumbTitle={breadcrumbTitle} />}
        {children}
      </main>

      <SelectedFooter />
      <BackToTop />
    </>
  )
}

export default Layout

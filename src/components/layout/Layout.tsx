'use client'

import Aos from 'aos'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import BackToTop from '../elements/BackToTop'
import DataBg from '../elements/DataBg'
import Breadcrumb from './Breadcrumb'
import PageHead from './PageHead'
import Footer1 from './footer/Footer1'
import Footer2 from './footer/Footer2'
import Footer3 from './footer/Footer3'
import Footer4 from './footer/Footer4'
import Footer5 from './footer/Footer5'
import Footer6 from './footer/Footer6'
import Footer7 from './footer/Footer7'
import Header from './header/Header'
import Header1 from './header/Header1'
import Header2 from './header/Header2'
import Header3 from './header/Header3'
import Header4 from './header/Header4'
import Header5 from './header/Header5'
import Header6 from './header/Header6'
import type { WOW } from 'wowjs'

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
  headerStyle: number
  footerStyle: number
  transparent?: boolean
  headTitle?: string
  breadcrumbTitle?: string
}

const Layout = ({
  headerStyle,
  footerStyle,
  headTitle,
  breadcrumbTitle,
  children,
  transparent,
}: LayoutProps) => {
  const [scroll, setScroll] = useState(false)
  const [isMobileMenu, setMobileMenu] = useState(false)
  const [isSearch, setSearch] = useState(false)
  const [isOffcanvus, setOffcanvus] = useState(false)

  const headers = [Header, Header1, Header2, Header3, Header4, Header5, Header6]
  const footers = [Footer1, Footer2, Footer3, Footer4, Footer5, Footer6, Footer7]

  const SelectedHeader = headers[headerStyle] || Header1
  const SelectedFooter = footers[footerStyle - 1] || Footer1

  const router = useRouter()

  const handleMobileMenu = () => {
    setMobileMenu(!isMobileMenu)
    document.body.classList.toggle('mobile-menu-visible', !isMobileMenu)
  }

  const handleSearch = () => setSearch(!isSearch)
  const handleOffcanvus = () => setOffcanvus(!isOffcanvus)

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
        isMobileMenu={isMobileMenu}
        handleMobileMenu={handleMobileMenu}
        isSearch={isSearch}
        handleSearch={handleSearch}
        isOffcanvus={isOffcanvus}
        handleOffcanvus={handleOffcanvus}
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

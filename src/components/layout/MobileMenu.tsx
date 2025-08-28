'use client'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { MouseEventHandler, useEffect, useState } from 'react'
import { aboutLinks, researchLinks } from './Menu'

export default function MobileMenu({
  handleMobileMenu,
}: {
  handleMobileMenu: MouseEventHandler<HTMLDivElement>
}) {
  const pathname = usePathname()
  const locale = useLocale()
  const [rdLabs, setRdLabs] = useState<{ slug: string; title: string }[]>([])
  const isActive = (path: string) => path === pathname
  const isAboutLinkActive = () => aboutLinks.some((link) => link.path === pathname)
  const isResearchLinkActive = () => researchLinks.some((link) => link.path === pathname)
  const isRdLabsLinkActive = () => pathname.startsWith('/research/r&d-labs')
  const t = useTranslations('Menu')
  const [isSubmenuAboutOpen, setIsSubmenuAboutOpen] = useState(false)
  const [isSubmenuResearchOpen, setIsSubmenuResearchOpen] = useState(false)
  const [isSubmenuRdLabsOpen, setIsSubmenuRdLabsOpen] = useState(false)

  const toggleSubmenuAbout = () => {
    setIsSubmenuAboutOpen(!isSubmenuAboutOpen)
  }

  const toggleSubmenuResearch = () => {
    setIsSubmenuResearchOpen(!isSubmenuResearchOpen)
  }

  const toggleSubmenuRdLabs = () => {
    setIsSubmenuRdLabsOpen(!isSubmenuRdLabsOpen)
  }

  useEffect(() => {
    let isMounted = true
    async function loadLabs() {
      try {
        const res = await fetch(`/api/research-labs?lang=${locale}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { labs: { slug: string; title: string }[] }
        if (isMounted) setRdLabs(data.labs)
      } catch {
        // ignore
      }
    }
    loadLabs()
    return () => {
      isMounted = false
    }
  }, [locale])

  return (
    <div className="tgmobile__menu">
      <nav className="tgmobile__menu-box">
        <div className="close-btn" onClick={handleMobileMenu}>
          <i className="fas fa-times" />
        </div>
        <div className="nav-logo">
          <Link href="/">
            <img src="/assets/img/logo/logo.png" alt="Logo" />
          </Link>
        </div>

        <div className="tgmobile__menu-outer">
          <ul className="navigation">
            <li>
              <Link href="/">{t('home')}</Link>
            </li>
            <li className="menu-item-has-children">
              <Link href="#" className={isResearchLinkActive() ? 'active' : ''}>
                {t('research')}
              </Link>
              <ul
                className="sub-menu"
                style={{ display: `${isSubmenuResearchOpen ? 'block' : 'none'}` }}
              >
                <li className="menu-item-has-children">
                  <Link href="#" className={isRdLabsLinkActive() ? 'active' : ''}>
                    {t('rdlabs')}
                  </Link>
                  <ul
                    className="sub-menu"
                    style={{ display: `${isSubmenuRdLabsOpen ? 'block' : 'none'}` }}
                  >
                    {rdLabs.map((lab) => {
                      const path = `/research/r&d-labs/${lab.slug}`
                      return (
                        <li key={lab.slug}>
                          <Link href={path} className={isActive(path) ? 'active' : ''}>
                            {lab.title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                  <div
                    className={isSubmenuRdLabsOpen ? 'dropdown-btn open' : 'dropdown-btn'}
                    onClick={toggleSubmenuRdLabs}
                  >
                    <span className="plus-line" />
                  </div>
                </li>
                {researchLinks.map((link) => {
                  return (
                    <li key={link.id}>
                      <Link href={link.path} className={isActive(link.path) ? 'active' : ''}>
                        {t(link.name)}
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <div
                className={isSubmenuResearchOpen ? 'dropdown-btn open' : 'dropdown-btn'}
                onClick={toggleSubmenuResearch}
              >
                <span className="plus-line" />
              </div>
            </li>
            <li>
              <Link href="/#solutions">{t('application')}</Link>
            </li>
            <li>
              <Link href="/academic">{t('education')}</Link>
            </li>
            <li>
              <Link href="/news">{t('news')}</Link>
            </li>
            <li className="menu-item-has-children">
              <Link href="#" className={isAboutLinkActive() ? 'active' : ''}>
                {t('about')}
              </Link>
              <ul
                className="sub-menu"
                style={{ display: `${isSubmenuAboutOpen ? 'block' : 'none'}` }}
              >
                {aboutLinks.map((link) => {
                  return (
                    <li key={link.id}>
                      <Link href={link.path} className={isActive(link.path) ? 'active' : ''}>
                        {t(link.name)}
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <div
                className={isSubmenuAboutOpen ? 'dropdown-btn open' : 'dropdown-btn'}
                onClick={toggleSubmenuAbout}
              >
                <span className="plus-line" />
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  )
}

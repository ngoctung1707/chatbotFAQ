'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { MouseEventHandler, useState } from 'react'

const aboutLinks: { id: number; name: string; path: string }[] = [
  { id: 1, name: 'Welcome to Institute', path: '/welcome-to-institute' },
  { id: 2, name: 'Vision and Operating Philosophy', path: '/vision-and-operating-philosophy' },
  { id: 3, name: 'Advisory Board', path: '/advisory-board' },
  { id: 4, name: 'Institute Council', path: '/institute-council' },
  { id: 5, name: 'Board of Deans', path: '/board-of-deans' },
  { id: 6, name: 'Researchers and Assistants', path: '/researchers-and-assistants' },
  { id: 7, name: 'Back Office', path: '/back-office' },
]

export default function MobileMenu({
  handleMobileMenu,
}: {
  handleMobileMenu: MouseEventHandler<HTMLDivElement>
}) {
  const pathname = usePathname()
  const isActive = (path: string) => path === pathname
  const isAboutLinkActive = () => aboutLinks.some((link) => link.path === pathname)
  const t = useTranslations('Menu')
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false)

  const toggleSubmenu = () => {
    setIsSubmenuOpen(!isSubmenuOpen)
  }

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
            <li>
              <Link href="/publications">{t('research')}</Link>
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
              <ul className="sub-menu" style={{ display: `${isSubmenuOpen ? 'block' : 'none'}` }}>
                {aboutLinks.map((link) => {
                  return (
                    <li key={link.id}>
                      <Link href={link.path} className={isActive(link.path) ? 'active' : ''}>
                        {link.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <div
                className={isSubmenuOpen ? 'dropdown-btn open' : 'dropdown-btn'}
                onClick={toggleSubmenu}
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

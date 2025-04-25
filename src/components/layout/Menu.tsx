'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

const aboutLinks: { id: number; name: string; path: string }[] = [
  { id: 1, name: 'Welcome to Institute', path: '/welcome-to-institute' },
  { id: 2, name: 'Vision and Operating Philosophy', path: '/vision-and-operating-philosophy' },
  { id: 3, name: 'Advisory Board', path: '/advisory-board' },
  { id: 4, name: 'Institute Council', path: '/institute-council' },
  { id: 5, name: 'Board of Deans', path: '/board-of-deans' },
  { id: 6, name: 'Researchers and Assistants', path: '/researchers-and-assistants' },
  { id: 7, name: 'Back Office', path: '/back-office' },
]

export default function Menu() {
  const pathname = usePathname()
  const isActive = (path: string) => path === pathname
  const isAboutLinkActive = () => aboutLinks.some((link) => link.path === pathname)
  const t = useTranslations('Menu')
  return (
    <>
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
          <ul className="sub-menu">
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
        </li>
      </ul>
    </>
  )
}

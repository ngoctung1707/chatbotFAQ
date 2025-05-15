'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

export const aboutLinks: { id: number; name: string; path: string }[] = [
  { id: 1, name: 'welcome', path: '/welcome-message' },
  { id: 2, name: 'vision', path: '/vision-and-operating-philosophy' },
  { id: 3, name: 'advisory', path: '/advisory-board' },
  { id: 4, name: 'council', path: '/institute-council' },
  { id: 5, name: 'deans', path: '/board-of-deans' },
  { id: 6, name: 'researchers', path: '/researchers-and-assistants' },
  { id: 7, name: 'office', path: '/back-office' },
].map(({ path, ...link }) => ({ ...link, path: `/about${path}` }))

export const researchLinks: { id: number; name: string; path: string }[] = [
  { id: 1, name: 'publications', path: '/publications' },
  { id: 2, name: 'ecotech', path: '/ecotech' },
].map(({ path, ...link }) => ({ ...link, path: `/research${path}` }))

export default function Menu() {
  const pathname = usePathname()
  const isActive = (path: string) => path === pathname
  const isAboutLinkActive = () => aboutLinks.some((link) => link.path === pathname)
  const isResearchLinkActive = () => researchLinks.some((link) => link.path === pathname)
  const t = useTranslations('Menu')
  return (
    <>
      <ul className="navigation">
        <li>
          <Link href="/">{t('home')}</Link>
        </li>
        <li className="menu-item-has-children">
          <Link href="#" className={isResearchLinkActive() ? 'active' : ''}>
            {t('research')}
          </Link>
          <ul className="sub-menu" style={{ width: '300px' }}>
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
          <ul className="sub-menu" style={{ width: '300px' }}>
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
        </li>
      </ul>
    </>
  )
}

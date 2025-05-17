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

export const rdLabsLinks: { id: number; name: string; path: string }[] = [
  { id: 1, name: 'software_engineering', path: '/software-engineering-and-decentralized-systems' },
  { id: 2, name: 'operational_efficiency', path: '/operational-efficiency-in-finance' },
  { id: 3, name: 'smart_finance', path: '/smart-finance-and-digital-banking' },
].map(({ path, ...link }) => ({ ...link, path: `/research/r&d-labs${path}` }))

export const researchLinks: { id: number; name: string; path: string }[] = [
  { id: 1, name: 'publications', path: '/publications' },
  { id: 2, name: 'ecotech', path: '/ecotech' },
  { id: 3, name: 'hackathon', path: '/hackathon' },
].map(({ path, ...link }) => ({ ...link, path: `/research${path}` }))

export default function Menu() {
  const pathname = usePathname()
  const isActive = (path: string) => path === pathname
  const isAboutLinkActive = () => aboutLinks.some((link) => link.path === pathname)
  const isResearchLinkActive = () =>
    researchLinks.some((link) => link.path === pathname) ||
    rdLabsLinks.some((link) => link.path === pathname)
  const t = useTranslations('Menu')

  return (
    <>
      <style jsx>{`
        .nested-submenu {
          position: absolute;
          left: 100%;
          top: 0;
          width: 300px;
          background-color: #fff;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
          padding: 10px 0;
          z-index: 999;
          display: none;
          list-style-type: none;
          border-radius: 8px;
        }

        .nested-parent:hover .nested-submenu {
          display: block;
        }

        .arrow-right {
          display: inline-block;
          width: 12px;
          height: 12px;
          margin-left: 6px;
          margin-right: 0;
          float: right;
          color: #f8a51c;
        }

        .nested-submenu a:hover {
          color: #f8a51c !important;
        }

        .nested-parent {
          position: relative;
        }

        .nested-parent a.active {
          color: #f8a51c !important;
        }

        .nested-submenu li {
          padding: 0 15px;
          position: relative;
          list-style-type: none;
        }
      `}</style>
      <ul className="navigation">
        <li>
          <Link href="/">{t('home')}</Link>
        </li>
        <li className="menu-item-has-children">
          <Link href="#" className={isResearchLinkActive() ? 'active' : ''}>
            {t('research')}
          </Link>
          <ul className="sub-menu" style={{ width: '300px' }}>
            <li>
              <Link
                href="/research/publications"
                className={isActive('/research/publications') ? 'active' : ''}
              >
                {t('publications')}
              </Link>
            </li>
            <li className="nested-parent">
              <Link href="#" className={isActive('/research/r&d-labs') ? 'active' : ''}>
                {t('rdlabs')}
                <svg
                  className="arrow-right"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  fill="#0E104B"
                  viewBox="0 0 330 330"
                  xmlSpace="preserve"
                >
                  <path d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606C255,161.018,253.42,157.202,250.606,154.389z" />
                </svg>
              </Link>
              <ul className="nested-submenu">
                {rdLabsLinks.map((rdLink) => (
                  <li key={rdLink.id}>
                    <Link href={rdLink.path} className={isActive(rdLink.path) ? 'active' : ''}>
                      {t(rdLink.name)}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link
                href="/research/ecotech"
                className={isActive('/research/ecotech') ? 'active' : ''}
              >
                {t('ecotech')}
              </Link>
            </li>
            <li>
              <Link
                href="/research/hackathon"
                className={isActive('/research/hackathon') ? 'active' : ''}
              >
                {t('hackathon')}
              </Link>
            </li>
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

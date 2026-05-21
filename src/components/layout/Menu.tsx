'use client'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  { id: 1, name: 'r&d-funding-projects', path: '/r&d-funding-projects' },
  { id: 2, name: 'publications', path: '/publications' },
].map(({ path, ...link }) => ({
  ...link,
  path: path.startsWith('http') ? path : `/research${path}`,
}))

export const getInvolvedLinks: { id: number; name: string; path: string }[] = [
  { id: 1, name: 'ecotech', path: '/get-involved/ecotech' },
  { id: 2, name: 'workshop_series', path: '/get-involved/workshop-series' },
  { id: 3, name: 'hackathon', path: '/get-involved/hackathon' },
  { id: 4, name: 'hackday', path: '/get-involved/hackday' },
  { id: 5, name: 'club', path: '/get-involved/club' },
].map(({ path, ...link }) => ({
  ...link,
  path: path,
}))

export const ecotechLinks = [
  {
    id: 1,
    label: '2026',
    path: 'https://ecotech.bkfin.tech/',
  },
  {
    id: 2,
    label: '2025',
    path: 'https://ecotech.bkfin.tech/ecotech2025/index.html',
  },
]

const vietnamDigitalEconomyReviewLinks = [
  {
    id: 1,
    label: '2025',
    path: '/get-involved/vietnam-digital-economy-review/2025',
  },
  {
    id: 2,
    label: '2024',
    path: '/get-involved/vietnam-digital-economy-review/2024',
  },
]

export const fundingProjectsLinks = [
  {
    id: 1,
    label: 'Cyber Clinic',
    path: '/research/r&d-funding-projects/cyber-clinic',
    target: '_self',
  },
]

export const solutionsLinks = [
  {
    id: 1,
    nameEn: 'BKOffice',
    nameVi: 'Hệ thống quản lý văn bản trực tuyến (BKOffice)',
    path: 'https://bkoffice.hust.edu.vn/',
  },
  {
    id: 2,
    nameEn: 'eDiploma',
    nameVi: 'Hệ thống tạo và xác thực văn bằng, chứng chỉ, chứng nhận số (eDiploma)',
    path: 'https://ediploma.vn/vi',
  },
  {
    id: 3,
    nameEn: 'BKSign',
    nameVi: 'Hệ thống ký số (BKSign)',
    path: 'https://bksign.hust.edu.vn/',
  },
  {
    id: 4,
    nameEn: 'AiPad',
    nameVi: 'Nền tảng hỗ trợ khởi nghiệp (AiPad)',
    path: 'https://aipad.vn/',
  },
]

export default function Menu() {
  const pathname = usePathname()
  const locale = useLocale()
  const [rdLabs, setRdLabs] = useState<{ slug: string; title: string }[]>([])
  const [courses, setCourses] = useState<{ slug: string; title: string }[]>([])
  const isActive = (path: string) => path === pathname
  const isAboutLinkActive = () => aboutLinks.some((link) => link.path === pathname)
  const isEducationLinkActive = () => pathname === '/academic' || pathname.startsWith('/courses/')
  const isGetInvolvedLinkActive = () =>
    getInvolvedLinks.some((link) => link.path === pathname) ||
    pathname.startsWith('/get-involved/vietnam-digital-economy-review')
  const isResearchLinkActive = () =>
    researchLinks.some((link) => link.path === pathname) ||
    pathname.startsWith('/research/r&d-labs') ||
    pathname.startsWith('/research/r&d-funding-projects')
  const t = useTranslations('Menu')

  const normalizeLabs = (labs: unknown): { slug: string; title: string }[] => {
    if (!Array.isArray(labs)) return []
    return labs
      .map((lab) => {
        if (!lab || typeof lab !== 'object') return null
        const slug =
          typeof (lab as { slug?: unknown }).slug === 'string'
            ? (lab as { slug: string }).slug.trim()
            : ''
        if (!slug) return null
        const rawTitle = (lab as { title?: unknown }).title
        const title = typeof rawTitle === 'string' && rawTitle.trim() ? rawTitle : slug
        return { slug, title }
      })
      .filter((lab): lab is { slug: string; title: string } => lab !== null)
  }

  const normalizeCourses = (items: unknown): { slug: string; title: string }[] => {
    if (!Array.isArray(items)) return []
    return items
      .map((course) => {
        if (!course || typeof course !== 'object') return null
        const slug =
          typeof (course as { slug?: unknown }).slug === 'string'
            ? (course as { slug: string }).slug.trim()
            : ''
        if (!slug) return null
        const rawTitle = (course as { title?: unknown }).title
        const title = typeof rawTitle === 'string' && rawTitle.trim() ? rawTitle : slug
        return { slug, title }
      })
      .filter((course): course is { slug: string; title: string } => course !== null)
  }

  useEffect(() => {
    let isMounted = true
    async function loadLabs() {
      try {
        const res = await fetch(`/api/research-labs?lang=${locale}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { labs?: unknown }
        if (isMounted) setRdLabs(normalizeLabs(data?.labs))
      } catch {
        // ignore
      }
    }
    loadLabs()
    return () => {
      isMounted = false
    }
  }, [locale])

  useEffect(() => {
    let isMounted = true
    async function loadCourses() {
      try {
        const res = await fetch(`/api/courses?lang=${locale}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { courses?: unknown }
        if (isMounted) setCourses(normalizeCourses(data?.courses))
      } catch {
        // ignore
      }
    }
    loadCourses()
    return () => {
      isMounted = false
    }
  }, [locale])

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
          padding: 15px 0;
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
          padding: 0px;
          position: relative;
          list-style-type: none;
        }

        .nested-submenu li a {
          display: block;
          transition: all 0.3s ease-out 0s;
        }

        .nested-submenu li a:hover {
          color: #f8a51c !important;
          transform: translateX(8px);
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
            <li className="nested-parent">
              <Link
                href="#"
                className={pathname.startsWith('/research/r&d-labs') ? 'active' : ''}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
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
                {rdLabs.map((lab) => {
                  const path = `/research/r&d-labs/${lab.slug}`
                  const displayTitle = lab.title.replace(/\s*Lab?$/i, '').trim() || lab.slug
                  return (
                    <li key={lab.slug}>
                      <a href={path} className={isActive(path) ? 'active' : ''}>
                        {displayTitle}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </li>
            <li className="nested-parent">
              <Link
                href="#"
                className={pathname.startsWith('/research/r&d-funding-projects') ? 'active' : ''}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {t('r&d-funding-projects')}
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
                {fundingProjectsLinks.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.path}
                      className={isActive(link.path) ? 'active' : ''}
                      target={link.target}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link
                href="/research/publications"
                className={isActive('/research/publications') ? 'active' : ''}
              >
                {t('publications')}
              </Link>
            </li>
          </ul>
        </li>
        <li className="menu-item-has-children">
          <Link href="#">{t('application')}</Link>
          <ul className="sub-menu" style={{ width: '100px' }}>
            {solutionsLinks.map((link) => (
              <li key={link.id}>
                <Link href={link.path} target="_blank">
                  {locale === 'vi' ? link.nameVi : link.nameEn}
                </Link>
              </li>
            ))}
          </ul>
        </li>
        <li className="menu-item-has-children">
          <Link href="/academic" className={isEducationLinkActive() ? 'active' : ''}>
            {t('education')}
          </Link>
          <ul className="sub-menu" style={{ width: '350px' }}>
            {courses.map((course) => {
              const path = `/courses/${course.slug}`
              return (
                <li key={course.slug}>
                  <Link href={path} className={isActive(path) ? 'active' : ''}>
                    {course.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </li>
        <li className="menu-item-has-children">
          <Link href="#" className={isGetInvolvedLinkActive() ? 'active' : ''}>
            {t('get_involved')}
          </Link>
          <ul className="sub-menu" style={{ width: '350px' }}>
            <li className="nested-parent">
              <Link
                href="/get-involved/ecotech"
                className={isActive('/get-involved/ecotech') ? 'active' : ''}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {t('ecotech')}
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
              <ul className="nested-submenu" style={{ width: '200px' }}>
                {ecotechLinks.map((link) => (
                  <li key={link.id}>
                    <a href={link.path}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </li>
            <li className="nested-parent">
              <Link
                href="#"
                className={
                  pathname.startsWith('/get-involved/vietnam-digital-economy-review')
                    ? 'active'
                    : ''
                }
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {t('vietnam_digital_economy_review')}
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
              <ul className="nested-submenu" style={{ width: '200px' }}>
                {vietnamDigitalEconomyReviewLinks.map((link) => (
                  <li key={link.id}>
                    <a href={link.path} className={isActive(link.path) ? 'active' : ''}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
            {getInvolvedLinks
              .filter((link) => link.name !== 'ecotech')
              .map((link) => {
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

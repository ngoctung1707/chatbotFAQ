'use client'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { MouseEventHandler, useEffect, useState } from 'react'
import {
  aboutLinks,
  ecotechLinks,
  fundingProjectsLinks,
  getInvolvedLinks,
  researchLinks,
  solutionsLinks,
} from './Menu'

export default function MobileMenu({
  handleMobileMenu,
}: {
  handleMobileMenu: MouseEventHandler<HTMLDivElement>
}) {
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
  const isRdLabsLinkActive = () => pathname.startsWith('/research/r&d-labs')
  const isFundingProjectsLinkActive = () => pathname.startsWith('/research/r&d-funding-projects')
  const isVietnamDigitalEconomyReviewActive = () =>
    pathname.startsWith('/get-involved/vietnam-digital-economy-review')
  const isEcotechActive = () => pathname === '/get-involved/ecotech'
  const t = useTranslations('Menu')
  const [isSubmenuAboutOpen, setIsSubmenuAboutOpen] = useState(false)
  const [isSubmenuResearchOpen, setIsSubmenuResearchOpen] = useState(false)
  const [isSubmenuRdLabsOpen, setIsSubmenuRdLabsOpen] = useState(false)
  const [isSubmenuFundingProjectsOpen, setIsSubmenuFundingProjectsOpen] = useState(false)
  const [isSubmenuEducationOpen, setIsSubmenuEducationOpen] = useState(false)
  const [isSubmenuGetInvolvedOpen, setIsSubmenuGetInvolvedOpen] = useState(false)
  const [isSubmenuEcotechOpen, setIsSubmenuEcotechOpen] = useState(false)
  const [isSubmenuSolutionsOpen, setIsSubmenuSolutionsOpen] = useState(false)
  const [isSubmenuVietnamDigitalEconomyReviewOpen, setIsSubmenuVietnamDigitalEconomyReviewOpen] =
    useState(false)

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
  const toggleSubmenuAbout = () => {
    setIsSubmenuAboutOpen(!isSubmenuAboutOpen)
  }

  const toggleSubmenuResearch = () => {
    setIsSubmenuResearchOpen(!isSubmenuResearchOpen)
  }

  const toggleSubmenuRdLabs = () => {
    setIsSubmenuRdLabsOpen(!isSubmenuRdLabsOpen)
  }

  const toggleSubmenuFundingProjects = () => {
    setIsSubmenuFundingProjectsOpen(!isSubmenuFundingProjectsOpen)
  }

  const toggleSubmenuEducation = () => {
    setIsSubmenuEducationOpen(!isSubmenuEducationOpen)
  }

  const toggleSubmenuGetInvolved = () => {
    setIsSubmenuGetInvolvedOpen(!isSubmenuGetInvolvedOpen)
  }

  const toggleSubmenuEcotech = () => {
    setIsSubmenuEcotechOpen(!isSubmenuEcotechOpen)
  }

  const toggleSubmenuSolutions = () => {
    setIsSubmenuSolutionsOpen(!isSubmenuSolutionsOpen)
  }

  const toggleSubmenuVietnamDigitalEconomyReview = () => {
    setIsSubmenuVietnamDigitalEconomyReviewOpen(!isSubmenuVietnamDigitalEconomyReviewOpen)
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
                      const displayTitle = lab.title.replace(/\s*Lab?$/i, '').trim() || lab.slug
                      return (
                        <li key={lab.slug}>
                          <Link href={path} className={isActive(path) ? 'active' : ''}>
                            {displayTitle}
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
                  if (link.path === '/research/r&d-funding-projects') {
                    return (
                      <li key={link.id} className="menu-item-has-children">
                        <Link href="#" className={isFundingProjectsLinkActive() ? 'active' : ''}>
                          {t('r&d-funding-projects')}
                        </Link>
                        <ul
                          className="sub-menu"
                          style={{ display: `${isSubmenuFundingProjectsOpen ? 'block' : 'none'}` }}
                        >
                          {fundingProjectsLinks.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={sub.path}
                                className={isActive(sub.path) ? 'active' : ''}
                                target={sub.target}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <div
                          className={
                            isSubmenuFundingProjectsOpen ? 'dropdown-btn open' : 'dropdown-btn'
                          }
                          onClick={toggleSubmenuFundingProjects}
                        >
                          <span className="plus-line" />
                        </div>
                      </li>
                    )
                  }

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
            <li className="menu-item-has-children">
              <Link href="#">{t('application')}</Link>
              <ul
                className="sub-menu"
                style={{ display: `${isSubmenuSolutionsOpen ? 'block' : 'none'}` }}
              >
                {solutionsLinks.map((link) => (
                  <li key={link.id}>
                    <Link href={link.path} target="_blank">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div
                className={isSubmenuSolutionsOpen ? 'dropdown-btn open' : 'dropdown-btn'}
                onClick={toggleSubmenuSolutions}
              >
                <span className="plus-line" />
              </div>
            </li>
            <li className="menu-item-has-children">
              <Link href="/academic" className={isEducationLinkActive() ? 'active' : ''}>
                {t('education')}
              </Link>
              <ul
                className="sub-menu"
                style={{ display: `${isSubmenuEducationOpen ? 'block' : 'none'}` }}
              >
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
              <div
                className={isSubmenuEducationOpen ? 'dropdown-btn open' : 'dropdown-btn'}
                onClick={toggleSubmenuEducation}
              >
                <span className="plus-line" />
              </div>
            </li>
            <li className="menu-item-has-children">
              <Link href="#" className={isGetInvolvedLinkActive() ? 'active' : ''}>
                {t('get_involved')}
              </Link>
              <ul
                className="sub-menu"
                style={{ display: `${isSubmenuGetInvolvedOpen ? 'block' : 'none'}` }}
              >
                <li className="menu-item-has-children">
                  <Link href="/get-involved/ecotech" className={isEcotechActive() ? 'active' : ''}>
                    {t('ecotech')}
                  </Link>
                  <ul
                    className="sub-menu"
                    style={{ display: `${isSubmenuEcotechOpen ? 'block' : 'none'}` }}
                  >
                    {ecotechLinks.map((link) => (
                      <li key={link.id}>
                        <a href={link.path}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                  <div
                    className={isSubmenuEcotechOpen ? 'dropdown-btn open' : 'dropdown-btn'}
                    onClick={toggleSubmenuEcotech}
                  >
                    <span className="plus-line" />
                  </div>
                </li>
                <li className="menu-item-has-children">
                  <Link href="#" className={isVietnamDigitalEconomyReviewActive() ? 'active' : ''}>
                    {t('vietnam_digital_economy_review')}
                  </Link>
                  <ul
                    className="sub-menu"
                    style={{
                      display: `${isSubmenuVietnamDigitalEconomyReviewOpen ? 'block' : 'none'}`,
                    }}
                  >
                    <li>
                      <Link
                        href="/get-involved/vietnam-digital-economy-review/2024"
                        className={
                          isActive('/get-involved/vietnam-digital-economy-review/2024')
                            ? 'active'
                            : ''
                        }
                      >
                        2024
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/get-involved/vietnam-digital-economy-review/2025"
                        className={
                          isActive('/get-involved/vietnam-digital-economy-review/2025')
                            ? 'active'
                            : ''
                        }
                      >
                        2025
                      </Link>
                    </li>
                  </ul>
                  <div
                    className={
                      isSubmenuVietnamDigitalEconomyReviewOpen
                        ? 'dropdown-btn open'
                        : 'dropdown-btn'
                    }
                    onClick={toggleSubmenuVietnamDigitalEconomyReview}
                  >
                    <span className="plus-line" />
                  </div>
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
              <div
                className={isSubmenuGetInvolvedOpen ? 'dropdown-btn open' : 'dropdown-btn'}
                onClick={toggleSubmenuGetInvolved}
              >
                <span className="plus-line" />
              </div>
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

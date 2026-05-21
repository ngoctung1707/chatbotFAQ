'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ArrowIconWhite from '../icons/ArrowIconWhite'
import ACFLogo from '../imgs/logos/ACF.png'
import HUSTLogo from '../imgs/logos/HUST.png'
import BKFintechLogo from '../imgs/logos/BKFintech.png'

const BASE_PATH = '/research/r&d-funding-projects/cyber-clinic'

const NAV_ITEMS = [
  { label: 'BK Fintech', href: '/' },
  { label: 'Về chương trình', href: `${BASE_PATH}/about` },
  { label: 'Tài liệu học tập', href: `${BASE_PATH}/learning-materials` },
  { label: 'Tin tức', href: '/news' },
  { label: 'Video', href: `${BASE_PATH}/video` },
  { label: 'Liên hệ', href: '#contact' },
]

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const handleNavClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="cc-header">
      <div className="cc-header__inner">
        {/* Left – ACF logo */}
        <Link href={BASE_PATH} className="cc-header__logo">
          <Image
            src={ACFLogo.src}
            alt="APAC Cybersecurity Fund – The Asia Foundation"
            width={145}
            height={28}
            className="cc-header__logo-img"
            priority
          />
        </Link>

        {/* Center – Navigation */}
        <nav className="cc-header__nav" aria-label="Điều hướng chính">
          <ul className="cc-header__nav-list">
            {NAV_ITEMS.map((item, index) => (
              <li key={index} className="cc-header__nav-item">
                <a
                  href={item.href}
                  className={`cc-header__nav-link${pathname === item.href ? ' active' : ''}`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right – Partner logos */}
        <div className="cc-header__partners" aria-label="Đối tác thực hiện">
          <Image
            src={HUSTLogo.src}
            alt="Đại học Bách khoa Hà Nội – HUST"
            width={93}
            height={28}
            className="cc-header__partner-img"
          />
          <span className="cc-header__partner-divider" aria-hidden="true" />
          <Image
            src={BKFintechLogo.src}
            alt="BK Fintech – Viện Kinh tế và Kinh tế số"
            width={110}
            height={28}
            className="cc-header__partner-img"
          />
        </div>

        {/* Mobile CTA – only shown on mobile */}
        {/* <a href={`${BASE_PATH}#contact`} className="cc-header__cta">
          Đăng ký ngay
          <span className="cc-header__cta-icon" aria-hidden="true">
            <ArrowIconWhite />
          </span>
        </a> */}

        <button
          type="button"
          className="cc-header__menu-toggle"
          aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMenuOpen}
          onClick={handleToggleMenu}
        >
          <svg width="800px" height="800px" viewBox="0 0 20 20" fill="none">
            <path
              fill="var(--cc-primary)"
              fillRule="evenodd"
              d="M19 4a1 1 0 01-1 1H2a1 1 0 010-2h16a1 1 0 011 1zm0 6a1 1 0 01-1 1H2a1 1 0 110-2h16a1 1 0 011 1zm-1 7a1 1 0 100-2H2a1 1 0 100 2h16z"
            />
          </svg>
        </button>
      </div>

      <div className={`cc-header__mobile-nav${isMenuOpen ? ' is-open' : ''}`}>
        <nav className="cc-header__mobile-nav-inner" aria-label="Điều hướng chính">
          <ul className="cc-header__mobile-nav-list">
            {NAV_ITEMS.map((item, index) => (
              <li key={index} className="cc-header__mobile-nav-item">
                <a
                  href={item.href}
                  className={`cc-header__mobile-nav-link${pathname === item.href ? ' active' : ''}`}
                  onClick={handleNavClick}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

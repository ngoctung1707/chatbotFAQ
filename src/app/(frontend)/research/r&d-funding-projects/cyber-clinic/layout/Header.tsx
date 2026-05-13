'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ArrowIconWhite from '../icons/ArrowIconWhite'

const BASE_PATH = '/research/r&d-funding-projects/cyber-clinic'

const NAV_ITEMS = [
  { label: 'Về chương trình', href: '#program-info' },
  { label: 'Đối tượng', href: '#users' },
  { label: 'Lộ trình', href: '#roadmap' },
  { label: 'Tin tức', href: '#news' },
  { label: 'Liên hệ', href: '#contact' },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="cc-header">
      <div className="cc-header__inner">
        {/* Left – ACF logo */}
        <Link href={BASE_PATH} className="cc-header__logo">
          <Image
            src="/assets/img/cyber-clinic/logos/ACF.png"
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
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="cc-header__nav-item">
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
            src="/assets/img/cyber-clinic/logos/HUST.png"
            alt="Đại học Bách khoa Hà Nội – HUST"
            width={93}
            height={28}
            className="cc-header__partner-img"
          />
          <span className="cc-header__partner-divider" aria-hidden="true" />
          <Image
            src="/assets/img/cyber-clinic/logos/BKFintech.png"
            alt="BK Fintech – Viện Kinh tế và Kinh tế số"
            width={110}
            height={28}
            className="cc-header__partner-img"
          />
        </div>

        {/* Mobile CTA – only shown on mobile */}
        <a href={`${BASE_PATH}#contact`} className="cc-header__cta">
          Đăng ký ngay
          <span className="cc-header__cta-icon" aria-hidden="true">
            <ArrowIconWhite />
          </span>
        </a>
      </div>
    </header>
  )
}

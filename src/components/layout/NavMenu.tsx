'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function NavMenu() {
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
        <li>
          <Link href="/members">{t('about')}</Link>
        </li>
      </ul>
    </>
  )
}

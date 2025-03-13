'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
export default function NavMenu() {
  const pathname = usePathname()
  const isActive = (path: string) => path === pathname
  return (
    <>
      <ul className="navigation">
        <li>
          <Link href="/" className={isActive('/') ? 'active' : ''}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/contact" className={isActive('/contact') ? 'active' : ''}>
            News
          </Link>
        </li>
        <li>
          <Link href="/contact" className={isActive('/contact') ? 'active' : ''}>
            Solutions
          </Link>
        </li>
        <li>
          <Link href="/contact" className={isActive('/contact') ? 'active' : ''}>
            Education
          </Link>
        </li>
        <li>
          <Link href="/contact" className={isActive('/contact') ? 'active' : ''}>
            Research
          </Link>
        </li>
        <li>
          <Link href="/contact" className={isActive('/contact') ? 'active' : ''}>
            Members
          </Link>
        </li>
      </ul>
    </>
  )
}

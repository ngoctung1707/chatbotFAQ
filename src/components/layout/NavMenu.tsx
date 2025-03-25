'use client'
import Link from 'next/link'

export default function NavMenu() {
  return (
    <>
      <ul className="navigation">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/publications">Research</Link>
        </li>
        <li>
          <Link href="/#solutions">Application</Link>
        </li>
        <li>
          <Link href="/academic">Education & Training</Link>
        </li>
        <li>
          <Link href="/news">News</Link>
        </li>
        <li>
          <Link href="/members">About</Link>
        </li>
      </ul>
    </>
  )
}

import React from 'react'
import ArrowIcon from '../icons/ArrowIcon'
import Link from 'next/link'

export default function ButtonGradient({
  variant,
  text,
  linkTo,
  target,
  style,
}: {
  variant: 'primary' | 'secondary'
  text: string
  linkTo?: string
  target?: string
  style?: React.CSSProperties
}) {
  return (
    <Link href={linkTo || '#'} target={target || '_blank'} style={{ textDecoration: 'none' }}>
      <div className={`button-gradient button-gradient--${variant}`} style={style}>
        <span>{text}</span>
        <span className="button-gradient__icon">
          <div className="button-gradient__icon-inner">
            <ArrowIcon />
            <ArrowIcon />
          </div>
        </span>
      </div>
    </Link>
  )
}

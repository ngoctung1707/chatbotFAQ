import type { SvgIcon } from './index'

const StoreIcon: SvgIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="#404040"
      {...props}
    >
      <mask
        id="mask0_670_1828"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="48"
        height="48"
      >
        <rect width="48" height="48" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_670_1828)">
        <path d="M8 12V8H40V12H8ZM8 40V28H6V24L8 14H40L42 24V28H40V40H36V28H28V40H8ZM12 36H24V28H12V36Z" />
      </g>
    </svg>
  )
}

export default StoreIcon

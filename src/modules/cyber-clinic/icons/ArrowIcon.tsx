import type { SvgIcon } from './index'

const ArrowIcon: SvgIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_244_61)">
        <mask
          id="mask0_244_61"
          style={{ maskType: 'alpha' }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="32"
          height="32"
        >
          <rect width="32" height="32" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_244_61)">
          <path
            d="M8.39233 23.5257L7 22.1333L20.1207 9H8.19233V7H23.5257V22.3333H21.5257V10.405L8.39233 23.5257Z"
            fill="currentColor"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_244_61">
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default ArrowIcon

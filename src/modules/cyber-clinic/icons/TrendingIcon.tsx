import type { SvgIcon } from './index'

const TrendingIcon: SvgIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="#404040"
      {...props}
    >
      <mask
        id="mask0_34_23773"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="40"
      >
        <rect width="40" height="40" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_34_23773)">
        <path d="M5.92294 29.2469L4.16669 27.4907L15.5867 15.9873L22.2534 22.654L31.6092 13.4136H26.6667V10.9136H35.8334V20.0802H33.3334V15.1702L22.2534 26.2502L15.5867 19.5836L5.92294 29.2469Z" />
      </g>
    </svg>
  )
}

export default TrendingIcon

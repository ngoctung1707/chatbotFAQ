import type { SvgIcon } from './index'

const GraduatedIcon: SvgIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      {...props}
    >
      <mask
        id="mask0_33_23734"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="40"
      >
        <rect width="40" height="40" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_33_23734)">
        <path
          d="M34.1025 26.9871V16.3846L20 24.0383L3.39752 15L20 5.96167L36.6025 15V26.9871H34.1025ZM20 33.0767L9.16669 27.1921V19.6283L20 25.5129L30.8334 19.6283V27.1921L20 33.0767Z"
          fill="#404040"
        />
      </g>
    </svg>
  )
}

export default GraduatedIcon

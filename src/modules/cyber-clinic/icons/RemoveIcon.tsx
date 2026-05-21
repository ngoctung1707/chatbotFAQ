import type { SvgIcon } from './index'

const RemoveIcon: SvgIcon = (props) => {
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
        id="mask0_354_725"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="40"
      >
        <rect width="40" height="40" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_354_725)">
        <path d="M8.33325 21.6668V18.3335H31.6666V21.6668H8.33325Z" fill="#1C1B1F" />
      </g>
    </svg>
  )
}

export default RemoveIcon

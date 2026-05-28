import type { SvgIcon } from './index'

const DoneIcon: SvgIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="54"
      height="54"
      viewBox="0 0 54 54"
      fill="none"
      {...props}
    >
      <mask
        id="mask0_625_1898"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="-1"
        width="54"
        height="55"
      >
        <rect y="-0.000732422" width="53.3333" height="53.3333" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_625_1898)">
        <path
          d="M14.8886 40.0003L2.33301 27.4447L5.49967 24.3336L18.0552 36.8892L14.8886 40.0003ZM27.4441 40.0003L14.8886 27.4447L17.9997 24.2781L27.4441 33.7225L47.8886 13.2781L50.9997 16.4447L27.4441 40.0003ZM27.4441 27.4447L24.2775 24.3336L35.2775 13.3336L38.4441 16.4447L27.4441 27.4447Z"
          fill="#BC1323"
        />
      </g>
    </svg>
  )
}

export default DoneIcon

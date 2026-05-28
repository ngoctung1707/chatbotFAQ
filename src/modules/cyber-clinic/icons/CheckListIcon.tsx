import type { SvgIcon } from './index'

const CheckListIcon: SvgIcon = (props) => {
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
        id="mask0_625_1888"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="-1"
        width="54"
        height="55"
      >
        <rect y="-0.000732422" width="53.3333" height="53.3333" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_625_1888)">
        <path
          d="M12.3332 42.2207L4.44434 34.3318L7.55545 31.2207L12.2777 35.9429L21.7221 26.4985L24.8332 29.6651L12.3332 42.2207ZM12.3332 24.4429L4.44434 16.554L7.55545 13.4429L12.2777 18.1651L21.7221 8.7207L24.8332 11.8874L12.3332 24.4429ZM28.8888 37.7763V33.3318H48.8888V37.7763H28.8888ZM28.8888 19.9985V15.554H48.8888V19.9985H28.8888Z"
          fill="#BC1323"
        />
      </g>
    </svg>
  )
}

export default CheckListIcon

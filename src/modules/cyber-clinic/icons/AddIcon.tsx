import type { SvgIcon } from './index'

const AddIcon: SvgIcon = (props) => {
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
        id="mask0_354_699"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="40"
      >
        <rect width="40" height="40" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_354_699)">
        <path
          d="M18.3333 35V21.6667H5V18.3333H18.3333V5H21.6667V18.3333H35V21.6667H21.6667V35H18.3333Z"
          fill="#BC1323"
        />
      </g>
    </svg>
  )
}

export default AddIcon

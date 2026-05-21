import type { SvgIcon } from './index'

const CheckListIcon: SvgIcon = (props) => {
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
        id="mask0_358_1133"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="40"
      >
        <rect width="40" height="40" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_358_1133)">
        <path
          d="M9.24992 31.6667L3.33325 25.7501L5.66659 23.4167L9.20825 26.9584L16.2916 19.8751L18.6249 22.2501L9.24992 31.6667ZM9.24992 18.3334L3.33325 12.4167L5.66659 10.0834L9.20825 13.6251L16.2916 6.54175L18.6249 8.91675L9.24992 18.3334ZM21.6666 28.3334V25.0001H36.6666V28.3334H21.6666ZM21.6666 15.0001V11.6667H36.6666V15.0001H21.6666Z"
          fill="#1C1B1F"
        />
      </g>
    </svg>
  )
}

export default CheckListIcon

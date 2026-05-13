import type { SvgIcon } from './index'

const MailIcon: SvgIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <mask
        id="mask0_124_1904"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="20"
        height="20"
      >
        <rect width="20" height="20" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_124_1904)">
        <path
          d="M3.58983 16.25C3.16886 16.25 2.81254 16.1042 2.52087 15.8125C2.22921 15.5208 2.08337 15.1645 2.08337 14.7435V5.25646C2.08337 4.83549 2.22921 4.47917 2.52087 4.1875C2.81254 3.89583 3.16886 3.75 3.58983 3.75H16.4103C16.8312 3.75 17.1875 3.89583 17.4792 4.1875C17.7709 4.47917 17.9167 4.83549 17.9167 5.25646V14.7435C17.9167 15.1645 17.7709 15.5208 17.4792 15.8125C17.1875 16.1042 16.8312 16.25 16.4103 16.25H3.58983ZM10 10.4648L16.6667 6.20187L16.5386 5L10 9.16667L3.4615 5L3.33337 6.20187L10 10.4648Z"
          fill="#595959"
        />
      </g>
    </svg>
  )
}

export default MailIcon

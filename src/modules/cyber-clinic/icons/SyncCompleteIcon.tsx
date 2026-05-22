import type { SvgIcon } from './index'

const SyncCompleteIcon: SvgIcon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#111827"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Vòng cung và mũi tên bên trên */}
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      
      {/* Vòng cung và mũi tên bên dưới */}
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21v-5h5" />
      
      {/* Dấu tích hoàn tất ở giữa */}
      <path d="M8 12l3 3 5-5" />
    </svg>
  )
}

export default SyncCompleteIcon
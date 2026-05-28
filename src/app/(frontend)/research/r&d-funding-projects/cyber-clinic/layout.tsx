import React from 'react'
import { Metadata } from 'next'
import { Saira } from 'next/font/google'
import '../../../../../styles/cyber-clinic/index.css'
import 'aos/dist/aos.css'
import { getUserLocale } from '@/i18n/localeService'
import { redirect } from 'next/navigation'
import ChatWindow from '@/app/(frontend)/chatbot/components/ChatWindow'
import BodyScrollUnlock from '@/modules/cyber-clinic/components/BodyScrollUnlock'

export const metadata: Metadata = {
  title: 'Vườn ươm Nhân lực An toàn thông tin trong nền kinh tế số - ĐH Bách khoa Hà Nội',
  description:
    'Vườn ươm Nhân lực An toàn thông tin trong nền kinh tế số do ĐH Bách khoa Hà Nội triển khai, nhằm đào tạo và phát triển nguồn nhân lực chất lượng cao trong lĩnh vực an toàn thông tin, đáp ứng nhu cầu chuyển đổi số và bảo mật dữ liệu cho doanh nghiệp và xã hội.',
  keywords: [
    'An toàn thông tin',
    'an ninh mạng',
    'vườn ươm nhân lực',
    'chuyển đổi số',
    'Bách khoa',
    'Đại học Bách Khoa',
    'cybersecurity',
  ],
}

const saira = Saira({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--cc-font-family',
  display: 'auto',
})

export default async function CyberClinicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // const lang = await getUserLocale()
  // if (lang === 'vi') {
  //   redirect(
  //     '/news/le-khoi-dong-chuong-trinh-vuon-uom-nhan-luc-an-toan-thong-tin-trong-nen-kinh-te-so-o-viet-nam',
  //   )
  // } else {
  //   redirect(
  //     '/news/launching-ceremony-of-the-cyber-clinics-incubation-program-for-vietnams-digital-economy',
  //   )
  // }
  return (
    <div className={`${saira.className} cyber-clinic-layout`}>
      <BodyScrollUnlock />
      {children}
      <ChatWindow />
    </div>
  )
}

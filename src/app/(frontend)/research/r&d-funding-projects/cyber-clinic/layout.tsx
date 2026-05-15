import React from 'react'
import { redirect } from 'next/navigation'
import { getUserLocale } from '@/i18n/localeService'
import { Metadata } from 'next'
import { Saira } from 'next/font/google'
import Header from './layout/Header'
import Footer from './layout/Footer'
import footerBg from './imgs/banners/footer.png'
import Image from 'next/image'
// @ts-expect-error -- Global CSS side-effect import is resolved by Next.js at build time
import './styles/cyber-clinic.css'

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
  const lang = await getUserLocale()
  if (lang === 'vi') {
    redirect(
      '/news/le-khoi-dong-chuong-trinh-vuon-uom-nhan-luc-an-toan-thong-tin-trong-nen-kinh-te-so-o-viet-nam',
    )
  } else {
    redirect(
      '/news/launching-ceremony-of-the-cyber-clinics-incubation-program-for-vietnams-digital-economy',
    )
  }

  return (
    <div
      className={`${saira.className} cyber-clinic-layout`}
      style={{
        backgroundColor: 'var(--cc-bg-light)',
        position: 'relative',
        paddingBottom: '40px',
      }}
    >
      <Header />
      {children}
      <div id="contact">
        <Footer />
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
        }}
      >
        <div style={{ position: 'relative' }}>
          <Image
            src={footerBg.src}
            alt="footer"
            width={1920}
            height={1080}
            style={{
              width: '100%',
              height: 'auto',
              zIndex: 0,
            }}
          />
          <div
            className="cc-layout-gradient"
            style={{
              width: '100%',
              background: 'linear-gradient(180deg, #F6EAEA 0%, rgba(246, 234, 234, 0.00) 100%)',
              position: 'absolute',
              top: 0,
              zIndex: 1,
            }}
          />
        </div>
      </div>
    </div>
  )
}

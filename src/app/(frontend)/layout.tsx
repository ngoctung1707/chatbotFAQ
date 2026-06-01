import { Inter, Montserrat } from 'next/font/google'
import '../../../public/assets/css/animate.min.css'
import '../../../public/assets/css/bootstrap.min.css'
import '../../../public/assets/css/flaticon.css'
import '../../../public/assets/css/fontawesome-all.min.css'
import '../../../public/assets/css/magnific-popup.css'
import '../../../public/assets/css/odometer.css'
import '../../../public/assets/css/swiper-bundle.css'
import '../../../public/assets/css/aos.css'
import '../../../public/assets/css/default.css'
import '../../../public/assets/css/main.css'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { ToastContainer } from 'react-toastify'

const interBody = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--tg-body-font-family',
  display: 'swap',
})

const montserratHeading = Montserrat({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--tg-heading-font-family',
  display: 'swap',
})

export const metadata = {
  title: 'BK Fintech',
  description: 'BK Fintech',
}
export const dynamic = 'force-dynamic'
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  return (
    <html lang={locale}>
      <body className={`${interBody.variable} ${montserratHeading.variable}`}>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <ToastContainer />
      </body>
    </html>
  )
}

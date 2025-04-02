import { getRequestConfig } from 'next-intl/server'
import { getUserLocale } from './localeService'
import { en, vi } from '@/i18n/messages'

export default getRequestConfig(async () => {
  const locale = await getUserLocale()

  return {
    locale,
    messages: locale === 'vi' ? vi : en,
  }
})

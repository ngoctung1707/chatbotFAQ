import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { LivePreviewListener } from '@/components/news/LivePreviewListener'
import NewsPage from '@/components/news/NewsPage'
import { getUserLocale } from '@/i18n/localeService'

const NEWS_SLUG_VI =
  'le-khoi-dong-chuong-trinh-vuon-uom-nhan-luc-an-toan-thong-tin-trong-nen-kinh-te-so-o-viet-nam'
const NEWS_SLUG_EN =
  'launching-ceremony-of-the-cyber-clinics-incubation-program-for-vietnams-digital-economy'

export default async function CyberClinicPage() {
  const { isEnabled: draft } = await draftMode()
  const lang = await getUserLocale()

  const news = await queryPostBySlug({ slug: lang === 'vi' ? NEWS_SLUG_VI : NEWS_SLUG_EN })
  if (!news) redirect('/')

  return (
    <article>
      {draft && <LivePreviewListener />}
      <NewsPage data={news} />
    </article>
  )
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'news',
    draft,
    limit: 2,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0]
})

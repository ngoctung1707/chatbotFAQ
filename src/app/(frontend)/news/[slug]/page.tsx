import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { LivePreviewListener } from '@/components/news/LivePreviewListener'
import NewsPage from '@/components/news/NewsPage'
import { getUserLocale } from '@/i18n/localeService'
import { Locale } from '@/i18n/config'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const lang = await getUserLocale()
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/news/'
  const news = await queryPostBySlug({ slug, lang })
  if (!news) redirect(url)
  return (
    <article>
      {draft && <LivePreviewListener />}
      <NewsPage data={news} />
    </article>
  )
}

const queryPostBySlug = cache(async ({ slug, lang }: { slug: string; lang: Locale }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'news',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const exactLang = result.docs.find((doc) => doc.lang === lang)

  return exactLang ?? result.docs[0] ?? null
})

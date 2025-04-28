import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { LivePreviewListener } from '@/components/news/LivePreviewListener'
import { getUserLocale } from '@/i18n/localeService'
import { Locale } from '@/i18n/config'
import CoursePage from '@/components/courses/CoursePage'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const lang = await getUserLocale()
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/courses/'
  const course = await queryPostBySlug({ slug, lang })
  if (!course) redirect(url)
  return (
    <article>
      {draft && <LivePreviewListener />}
      <CoursePage data={course} />
    </article>
  )
}

const queryPostBySlug = cache(async ({ slug, lang }: { slug: string; lang: Locale }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'courses',
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

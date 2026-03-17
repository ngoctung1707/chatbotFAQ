import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getUserLocale } from '@/i18n/localeService'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const searchParams = url.searchParams
  const passedLang = searchParams.get('lang')
  const lang = (passedLang || (await getUserLocale())) as 'en' | 'vi'

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'research-labs',
    draft: false,
    sort: ['-publishedAt'],
    where: {
      lang: {
        equals: lang,
      },
    },
  })

  const labs = docs
    .map((doc: { slug?: string; title?: string }) => {
      const slug = typeof doc.slug === 'string' ? doc.slug.trim() : ''
      if (!slug) return null
      const title = typeof doc.title === 'string' && doc.title.trim() ? doc.title : slug
      return { slug, title }
    })
    .filter((lab): lab is { slug: string; title: string } => lab !== null)

  return NextResponse.json({ labs })
}

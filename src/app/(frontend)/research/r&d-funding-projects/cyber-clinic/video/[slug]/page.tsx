import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import VideosPage from '@/components/videos/VideosPage'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const url = '/research/r&d-funding-projects/cyber-clinic/video'
  const video = await queryVideoBySlug({ slug })

  if (!video) redirect(url)

  return <VideosPage data={video} />
}

const queryVideoBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'cyber-clinic-videos',
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

  return result.docs[0] ?? null
})

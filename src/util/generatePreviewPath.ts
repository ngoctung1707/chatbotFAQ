import { CollectionSlug, PayloadRequest } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  news: '/news',
  courses: '/courses',
  solutions: '/solutions',
  'research-labs': '/research/r&d-labs',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug?: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  const safeSlug = typeof slug === 'string' && slug.length > 0 ? slug : 'preview'

  const encodedParams = new URLSearchParams({
    slug: safeSlug,
    collection,
    path: `${collectionPrefixMap[collection]}/${safeSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  return `/api/draft?${encodedParams.toString()}`
}

import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: anyone,
  },
  fields: [
    {
      name: 'caption',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    staticDir: process.env.MEDIA_DIR,
    // imageSizes: [{ name: 'table', width: 1024, height: undefined, position: 'center' }],
  },
}

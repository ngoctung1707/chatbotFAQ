import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { CollectionConfig } from 'payload'

export const Publications: CollectionConfig = {
  slug: 'publications',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'link', type: 'text', required: true },
    { name: 'year', type: 'number', required: true },
    { name: 'authors', type: 'text', required: true },
    { name: 'abstract', type: 'textarea', required: true },
    { name: 'background', type: 'upload', relationTo: 'media' },
  ],
}

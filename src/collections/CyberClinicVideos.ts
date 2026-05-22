import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'

export const CyberClinicVideos: CollectionConfig = {
  slug: 'cyber-clinic-videos',
  access: {
    read: anyone,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Upload', value: 'upload' },
        { label: 'External', value: 'external' },
      ],
      defaultValue: 'upload',
      required: true,
    },
    {
      name: 'videoFile',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data?.source === 'upload',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        condition: (data) => data?.source === 'external',
      },
    },
  ],
}

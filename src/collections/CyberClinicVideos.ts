import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import { slugifyHook } from './News'

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
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      label: 'Slug',
      hooks: {
        beforeValidate: [slugifyHook],
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Ngày đăng',
      required: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: {
        mimeType: { contains: 'image/' },
      },
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

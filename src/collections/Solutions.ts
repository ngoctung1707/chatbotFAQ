import { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { generatePreviewPath } from '@/util/generatePreviewPath'

export const Solutions: CollectionConfig = {
  slug: 'solutions',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'shortDescription', 'lang'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({ req, slug: data.title, collection: 'solutions' }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({ req, slug: <string>data.title, collection: 'solutions' }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Tiêu đề',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Mô tả ngắn',
      required: true,
    },
    {
      name: 'lang',
      type: 'select',
      options: ['en', 'vi'],
      label: 'Ngôn ngữ',
      defaultValue: 'en',
      required: true,
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      label: 'Ảnh nền',
      required: true,
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures, defaultFeatures }) => [...rootFeatures, ...defaultFeatures],
      }),
      label: 'Nội dung',
      required: true,
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}

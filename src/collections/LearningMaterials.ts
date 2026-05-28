import { CollectionConfig, FieldHook } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'
import slugify from '@sindresorhus/slugify'

const slugifyHook: FieldHook = ({ data, operation, value }) => {
  if (typeof value === 'string') {
    return slugify(value)
  }

  if (operation === 'create' || !data?.slug) {
    const fallbackData = data?.title || data?.title

    if (fallbackData && typeof fallbackData === 'string') {
      return slugify(fallbackData)
    }
  }

  return value
}

export const LearningMaterials: CollectionConfig = {
  slug: 'learning-materials',
  labels: {
    singular: 'Learning Material',
    plural: 'Learning Materials',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'publishedAt', 'lang'],
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
      name: 'description',
      type: 'textarea',
      label: 'Mô tả',
      required: false,
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
      name: 'publishedAt',
      type: 'date',
      label: 'Ngày đăng',
      required: true,
    },
    {
      name: 'heroImage',
      type: 'upload',
      label: 'Ảnh bìa',
      required: true,
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
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

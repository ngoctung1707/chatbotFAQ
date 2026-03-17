import { CollectionConfig, FieldHook } from 'payload'
import { authenticated } from '@/access/authenticated'
import { anyone } from '@/access/anyone'
import slugify from '@sindresorhus/slugify'
import { generatePreviewPath } from '@/util/generatePreviewPath'

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

export const Courses: CollectionConfig = {
  slug: 'courses',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'lang'],
    livePreview: {
      url: ({ data, req }) => generatePreviewPath({ req, slug: data.slug, collection: 'courses' }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({ req, slug: <string>data.slug, collection: 'courses' }),
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
      name: 'tag',
      type: 'select',
      options: ['short-course', 'public-lecture'],
      label: 'Tag',
      required: true,
    },
    {
      name: 'duration',
      type: 'text',
      label: 'Thời lượng khóa học',
      required: true,
    },
    {
      name: 'modules',
      type: 'number',
      label: 'Số module',
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

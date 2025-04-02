import { CollectionConfig } from 'payload'

export const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'avatar', 'role', 'rank'],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'avatar', type: 'upload', required: true, relationTo: 'media' },
    { name: 'role', type: 'text', required: false },
    { name: 'school', type: 'text', required: false },
    { name: 'rank', type: 'number', required: true, defaultValue: 100 },
  ],
}

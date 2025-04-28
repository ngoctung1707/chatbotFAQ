import { CollectionConfig } from 'payload'

export const UpcomingEvents: CollectionConfig = {
  slug: 'upcoming-events',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'time',
      type: 'date',
      required: true,
    },
  ],
}

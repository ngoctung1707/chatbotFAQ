// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { News } from '@/collections/News'
import { Members } from '@/collections/Members'
import { Publications } from '@/collections/Publications'
import { UpcomingEvents } from '@/collections/UpcomingEvents'
import { Courses } from '@/collections/Courses'
import { Solutions } from '@/collections/Solutions'
import { ResearchLabs } from './collections/ResearchLabs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const livePreviewServerURL = process.env.NEXT_PUBLIC_SERVER_URL

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    ...(livePreviewServerURL
      ? {
          livePreview: {
            url: livePreviewServerURL,
            collections: ['news', 'courses', 'solutions', 'research-labs'],
          },
        }
      : {}),
  },
  routes: {
    api: '/payload',
  },
  collections: [
    Users,
    Media,
    News,
    Members,
    Publications,
    UpcomingEvents,
    Courses,
    Solutions,
    ResearchLabs,
  ],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [],
})

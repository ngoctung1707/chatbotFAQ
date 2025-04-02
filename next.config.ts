import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  output: 'standalone',
}

const withNextIntl = createNextIntlPlugin()

export default withNextIntl(withPayload(nextConfig))

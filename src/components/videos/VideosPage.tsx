import Footer from '@/modules/cyber-clinic/layout/Footer'
import Header from '@/modules/cyber-clinic/layout/Header'
import { CyberClinicVideo, Media } from '@/payload-types'
import React from 'react'

type Props = {
  data: CyberClinicVideo
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace('www.', '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/embed/')) {
        const id = parsed.pathname.replace('/embed/', '')
        return id ? `https://www.youtube.com/embed/${id}` : null
      }

      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v')
        return id ? `https://www.youtube.com/embed/${id}` : null
      }

      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.replace('/shorts/', '')
        return id ? `https://www.youtube.com/embed/${id}` : null
      }
    }
  } catch {
    return null
  }

  return null
}

export default function VideosPage({ data }: Props) {
  const coverUrl = typeof data.coverImage === 'object' ? (data.coverImage as Media).url : undefined
  const videoUrl = typeof data.videoFile === 'object' ? (data.videoFile as Media).url : undefined
  const externalUrl = data.externalUrl || ''
  const youtubeEmbedUrl = externalUrl ? getYouTubeEmbedUrl(externalUrl) : null

  return (
    <>
      <div style={{ backgroundColor: 'var(--cc-bg-page)' }}>
        <Header />
        <div className="container" style={{ padding: '80px 0' }}>
          <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>{data.title}</h2>
          {data.source === 'upload' && videoUrl && (
            <div style={{ width: '100%', aspectRatio: '16/9' }}>
              <video
                controls
                poster={coverUrl}
                style={{ width: '100%', height: '100%', borderRadius: '8px' }}
              >
                <source src={videoUrl} />
              </video>
            </div>
          )}
          {data.source === 'external' && externalUrl && (
            <div style={{ width: '100%', aspectRatio: '16/9' }}>
              {youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  title={data.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 0, borderRadius: '8px' }}
                />
              ) : (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#D41F3D', fontWeight: 600, textDecoration: 'none' }}
                >
                  {externalUrl}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      <div id="contact">
        <Footer />
      </div>
    </>
  )
}

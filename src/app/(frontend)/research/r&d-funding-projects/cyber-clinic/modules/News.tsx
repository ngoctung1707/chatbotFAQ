import { getUserLocale } from '@/i18n/localeService'
import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import ButtonGradient from '../components/ButtonGradient'
import Link from 'next/link'
import type { Media, News as NewsType } from '@/payload-types'

export default async function News() {
  const lang = await getUserLocale()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    limit: 4,
    draft: false,
    sort: ['-publishedAt'],
    where: {
      lang: {
        equals: lang,
      },
    },
  })
  const mainDoc = docs[0] as NewsType
  const subDocs = docs.slice(1, 4) as NewsType[]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        paddingTop: '80px',
        paddingBottom: '80px',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
          }}
        >
          <h3>Tin tức</h3>
          <ButtonGradient variant="primary" text="Xem tất cả" linkTo={`/news`} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mainDoc && (
            <div className="cc-news-main">
              <div style={{ flex: '1 1 200px', borderRadius: '16px', overflow: 'hidden' }}>
                <Link
                  href={`/news/${mainDoc.slug}`}
                  style={{ display: 'block', width: '100%', height: '100%' }}
                  target="blank"
                >
                  <img
                    className="cc-news-main__image"
                    src={(mainDoc.heroImage as Media)?.url || ''}
                    alt={(mainDoc.heroImage as Media)?.caption || mainDoc.title}
                  />
                </Link>
              </div>
              <div
                style={{
                  flex: '1 1 300px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '16px 0 16px 0',
                }}
              >
                <div
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#2319190A',
                    borderRadius: '100px',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: 'var(--cc-fg-primary)',
                    width: 'fit-content',
                  }}
                >
                  {formatDate(mainDoc.publishedAt)}
                </div>
                <div>
                  <h4
                    style={{
                      textTransform: 'uppercase',
                    }}
                    className="hover-underline"
                  >
                    <Link
                      href={`/news/${mainDoc.slug}`}
                      style={{
                        color: 'var(--cc-fg-primary)',
                        textDecoration: 'none',
                      }}
                      target="blank"
                    >
                      {mainDoc.title}
                    </Link>
                  </h4>
                  {mainDoc.description && (
                    <p className="cc-news-main_desc">{mainDoc.description}</p>
                  )}
                </div>
                <Link
                  href={`/news/${mainDoc.slug}`}
                  style={{
                    color: 'var(--cc-primary)',
                    fontWeight: 500,
                    fontSize: '16px',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                  }}
                  target="blank"
                >
                  ĐỌC BÀI VIẾT
                </Link>
              </div>
            </div>
          )}

          {subDocs.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px',
              }}
            >
              {subDocs.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    border: '2px solid #F6E4E2',
                    borderRadius: '24px',
                    padding: '16px',
                    backgroundColor: 'var(--cc-bg-card)',
                  }}
                >
                  <div
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      aspectRatio: '16/9',
                    }}
                  >
                    <Link
                      href={`/news/${doc.slug}`}
                      style={{ display: 'block', width: '100%', height: '100%' }}
                      target="blank"
                    >
                      <img
                        src={(doc.heroImage as Media)?.url || ''}
                        alt={(doc.heroImage as Media)?.caption || doc.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Link>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        padding: '4px 12px',
                        backgroundColor: '#2319190A',
                        borderRadius: '100px',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: 'var(--cc-fg-primary)',
                        marginBottom: '16px',
                        width: 'fit-content',
                      }}
                    >
                      {formatDate(doc.publishedAt)}
                    </div>
                    <h6
                      style={{
                        textTransform: 'uppercase',
                        marginBottom: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1,
                        color: 'var(--cc-fg-primary)',
                      }}
                      className="hover-underline"
                    >
                      <Link
                        href={`/news/${doc.slug}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        target="blank"
                      >
                        {doc.title}
                      </Link>
                    </h6>
                    <Link
                      href={`/news/${doc.slug}`}
                      style={{
                        color: '#D41F3D',
                        fontWeight: 600,
                        fontSize: '14px',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                      }}
                      target="blank"
                    >
                      ĐỌC BÀI VIẾT
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

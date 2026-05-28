import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import type { Media, News as NewsType } from '@/payload-types'
import SplitText from '../../components/SplitText'
import ButtonGradient from '../../components/ButtonGradient'
import EmptyDiv from '../../components/EmptyDiv'

export default async function News() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'news',
    limit: 4,
    draft: false,
    sort: ['-publishedAt'],
    where: {
      lang: {
        equals: 'vi',
      },
    },
  })
  const totalDocs = docs.length
  let mainDoc: NewsType | undefined
  let subDocs: NewsType[] = []

  if (totalDocs === 1) {
    mainDoc = docs[0] as NewsType
  } else if (totalDocs === 4) {
    mainDoc = docs[0] as NewsType
    subDocs = docs.slice(1, 4) as NewsType[]
  } else {
    subDocs = docs as NewsType[]
  }

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
      }}
    >
      <div
        style={{
          borderTop: '1px solid var(--cc-border-medium)',
          borderBottom: '1px solid var(--cc-border-medium)',
        }}
      >
        <div className="container cc-register-student-header">
          <div
            style={{
              height: '100%',
              padding: '80px 0 40px',
              background: 'var(--cc-gradient-header)',
              borderRight: '1px solid var(--cc-primary)',
            }}
          >
            <SplitText tag="h3" text="Tin tức" textAlign="left" />
          </div>
          <div
            className="cc-register-student-content"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <ButtonGradient text="xem tất cả" variant="secondary" linkTo="/news" />
          </div>
        </div>
      </div>
      <EmptyDiv />
      <div className="container">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {mainDoc && (
            <div className="cc-news-main">
              <div style={{ flex: '1 1 200px', overflow: 'hidden' }}>
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
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#23191914',
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
                  XEM THÊM
                </Link>
              </div>
            </div>
          )}

          {subDocs.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              }}
            >
              {subDocs.map((doc, index) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '40px',
                    backgroundColor: '#FFFFFF80',
                    border: '1px solid var(--cc-border-medium)',
                  }}
                >
                  <div
                    style={{
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
                  <div style={{ marginTop: '24px' }}>
                    <div
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#23191914',
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
                      XEM THÊM
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <EmptyDiv />
    </div>
  )
}

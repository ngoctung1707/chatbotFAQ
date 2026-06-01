import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import SplitText from '../../components/SplitText'
import EmptyDiv from '../../components/EmptyDiv'
import Link from 'next/link'
import { Media } from '@/payload-types'
import { formatDate } from './News'

export default async function Video() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'cyber-clinic-videos',
    draft: false,
    sort: ['-publishedAt'],
  })
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
            <SplitText tag="h3" text="Video" textAlign="left" />
          </div>
          <div
            className="cc-register-student-content"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          ></div>
        </div>
      </div>
      <EmptyDiv />
      <div className="container">
        {docs.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            }}
          >
            {docs.map((doc, index) => (
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
                    href={`/research/r&d-funding-projects/cyber-clinic/video/${doc.slug}`}
                    style={{ display: 'block', width: '100%', height: '100%' }}
                    target="blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={(doc.coverImage as Media)?.url || ''}
                      alt={(doc.coverImage as Media)?.caption || doc.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                </div>
                <div
                  style={{
                    marginTop: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1,
                  }}
                >
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
                      href={`/research/r&d-funding-projects/cyber-clinic/video/${doc.slug}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      target="blank"
                      rel="noopener noreferrer"
                    >
                      {doc.title}
                    </Link>
                  </h6>
                  <Link
                    href={`/research/r&d-funding-projects/cyber-clinic/video/${doc.slug}`}
                    style={{
                      color: '#D41F3D',
                      fontWeight: 600,
                      fontSize: '14px',
                      textDecoration: 'none',
                      textTransform: 'uppercase',
                    }}
                    target="blank"
                    rel="noopener noreferrer"
                  >
                    XEM THÊM
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <EmptyDiv />
    </div>
  )
}

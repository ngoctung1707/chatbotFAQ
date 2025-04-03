import Link from 'next/link'
import { Media, News } from '@/payload-types'
import { useTranslations } from 'next-intl'

interface NewsCardProps {
  doc: News
}

export default function NewsCard({ doc }: NewsCardProps) {
  const t = useTranslations('Misc')
  return (
    <>
      <div className="col-xl-4 col-lg-6 col-md-10">
        <div className="blog-post-item shine-animate-item">
          <div className="blog-post-thumb">
            <Link href={`/news/${doc.slug}`} className="shine-animate">
              <img src={(doc.heroImage as Media)?.url} alt={(doc.heroImage as Media)?.caption} />
            </Link>
          </div>
          <div className="blog-post-content">
            <h2
              className="title"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <Link href={`/news/${doc.slug}`}>{doc.title}</Link>
            </h2>
            <div className="blog-post-meta">
              <ul className="list-wrap">
                <li>
                  <Link href={`/news/${doc.slug}`} className="btn">
                    {t('readMore')}
                  </Link>
                </li>
                <li>
                  <i className="fas fa-calendar-alt" />
                  {new Date(doc.publishedAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    day: 'numeric',
                    month: '2-digit',
                  })}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

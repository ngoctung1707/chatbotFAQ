import Link from 'next/link'
import { Course, Media } from '@/payload-types'

interface CourseCardProps {
  doc: Course
}

export default function CourseCard({ doc }: CourseCardProps) {
  return (
    <>
      <div className="col-xl-4 col-lg-6 col-md-10">
        <div className="blog-post-item shine-animate-item">
          <div className="blog-post-thumb">
            <Link href={`/courses/${doc.slug}`} className="shine-animate">
              <img src={(doc.heroImage as Media)?.url} alt={(doc.heroImage as Media)?.caption} />
            </Link>
            <Link href={`/courses/${doc.slug}`} className="post-tag">
              {doc.modules} modules
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
              <Link href={`/courses/${doc.slug}`}>{doc.title}</Link>
            </h2>
            <div className="blog-avatar">
              <div className="avatar-content">
                <p
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {doc.description}
                  <br />
                  <br />
                </p>
              </div>
            </div>
            <div className="blog-post-meta">
              <ul className="list-wrap">
                <li>
                  <i className="fas fa-calendar-alt" />
                  {doc.duration}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

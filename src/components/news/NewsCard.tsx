import Link from 'next/link'

interface NewsCardProps {
  item: {
    id: number
    title: string
    img: string
  }
}

export default function NewsCard({ item }: NewsCardProps) {
  return (
    <>
      <div className="col-md-4">
        <div className="blog__post-two shine-animate-item">
          <div className="blog__post-thumb-two">
            <Link href={`/blog/${item.id}`} className="shine-animate">
              <img src={`/assets/img/blog/${item.img}`} alt="" />
            </Link>
          </div>
          <div className="blog__post-content-two">
            <div className="blog-post-meta">
              <ul className="list-wrap">
                <li>
                  <i className="fas fa-calendar-alt" />
                  Oct 21, 2024
                </li>
              </ul>
            </div>
            <h2 className="title">
              <Link href={`/blog/${item.id}`}>{item.title}</Link>
            </h2>
          </div>
        </div>
      </div>
    </>
  )
}

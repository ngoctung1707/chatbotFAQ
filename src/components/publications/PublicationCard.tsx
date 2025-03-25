import Link from 'next/link'

interface PublicationCardProp {
  item: {
    title: string
    link: string
    year: number
    authors: string
    abstract: string
  }
}

export default function PublicationCard({ item }: PublicationCardProp) {
  return (
    <>
      <div className="col-xl-3 col-lg-4 col-md-6">
        <div
          className="services__item-five justify-content-between"
          style={{
            height: '480px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div className="services__content-five">
            <h2 className="title">
              <Link href={item.link}>{item.title}</Link>
            </h2>
            <p>{item.authors}</p>
          </div>
          <Link href={item.link} className="btn" style={{ width: '70%' }}>
            Read More
          </Link>
        </div>
      </div>
    </>
  )
}

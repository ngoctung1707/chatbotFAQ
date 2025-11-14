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
      <div className="col-12">
        <div
          className="services__item-five text-start mb-3 d-flex align-items-center flex-column flex-sm-row gap-3"
          style={{ padding: '20px' }}
        >
          <div className="services__content-five" style={{ flex: 1 }}>
            {/* <div style={{ fontWeight: 700, color: '#999', marginBottom: 6 }}>{item.year}</div> */}
            {/* <h6 className="title" style={{ marginBottom: 8 }}>
              <Link href={item.link}>{item.title}</Link>
            </h6> */}
            <p className="mb-0">
              {item.authors}, <i>&quot;{item.title}&quot;</i> (<strong>{item.year}</strong>)
            </p>
          </div>
          <Link href={item.link} className="btn" style={{ whiteSpace: 'nowrap' }}></Link>
        </div>
      </div>
    </>
  )
}

import Layout from '@/components/layout/Layout'
import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import NewsCard from '@/components/news/NewsCard'
import Link from 'next/link'
import { getUserLocale } from '@/i18n/localeService'

type Props = {
  params: Promise<{
    id?: string
  }>
}

export default async function News({ params }: Props) {
  const { id = '1' } = await params
  const lang = await getUserLocale()
  const currentPage = isNaN(Number(id)) ? 1 : Number(id),
    paginationItem = 4
  const payload = await getPayload({ config })
  const { docs, totalPages, nextPage, prevPage } = await payload.find({
    collection: 'news',
    draft: false,
    limit: 6,
    pagination: true,
    page: currentPage,
    sort: ['-publishedAt'],
    where: {
      tag: {
        in: ['hackathon'],
      },
      lang: {
        equals: lang,
      },
    },
  })
  const start = Math.floor((currentPage - 1) / paginationItem) * paginationItem
  const end = start + paginationItem
  const getPaginationGroup = new Array(totalPages)
    .fill(null)
    .map((_, i) => i + 1)
    .slice(start, end)
  return (
    <>
      <Layout transparent>
        <div>
          <section
            className="services__area-four services__bg-four"
            data-background="/assets/img/bg/inner_services_bg.jpg"
          >
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-xl-6">
                  <div className="section-title text-center mb-40 tg-heading-subheading animation-style3">
                    <h2 className="title tg-element-title">Hackathon</h2>
                  </div>
                </div>
              </div>
              <div className="blog__inner-wrap">
                <div className="row">
                  <div className="col-100">
                    <div className="blog-post-wrap">
                      <div className="row gutter-24 justify-content-center">
                        {docs.map((doc) => (
                          <NewsCard doc={doc} key={doc.id} />
                        ))}
                        <div className="pagination-wrap mt-40">
                          <nav aria-label="Page navigation example">
                            <ul className="pagination list-wrap">
                              {getPaginationGroup.length <= 0 ? null : (
                                <li className="next_link page-item">
                                  {currentPage === 1 ? null : (
                                    <Link href={`/research/hackathon/pages/${prevPage}`}>
                                      <span className="page-link">
                                        <i className="fas fa-angle-double-left" />
                                      </span>
                                    </Link>
                                  )}
                                </li>
                              )}

                              {getPaginationGroup.map((item, index) => {
                                return (
                                  <li
                                    key={index}
                                    className={
                                      currentPage === item ? 'page-item active' : 'page-item'
                                    }
                                  >
                                    <Link href={`/research/hackathon/pages/${item}`}>
                                      <span className="page-link">{item}</span>
                                    </Link>
                                  </li>
                                )
                              })}

                              {getPaginationGroup.length <= 0 ? null : (
                                <li className="next_link page-item">
                                  {currentPage >= totalPages ? null : (
                                    <Link href={`/research/hackathon/pages/${nextPage}`}>
                                      <span className="page-link">
                                        <i className="fas fa-angle-double-right" />
                                      </span>
                                    </Link>
                                  )}
                                </li>
                              )}
                            </ul>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  )
}

import Layout from '@/components/layout/Layout'
import { getPayload } from 'payload'
import config from '@payload-config'

import NewsCard from '@/components/news/NewsCard'

export default async function Hackathon() {
  const payload = await getPayload({ config })

  const { docs: ecotechNews } = await payload.find({
    collection: 'news',
    draft: false,
    pagination: false,
    where: {
      title: {
        like: /ecotech/i,
      },
    },
    sort: ['-publishedAt'],
  })
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
                    <h2 className="title tg-element-title">ECOTECH Conference</h2>
                  </div>
                </div>
              </div>
              <div className="blog__inner-wrap">
                <div className="row">
                  <div className="col-100">
                    <div className="blog-post-wrap">
                      <div className="row gutter-24 justify-content-center">
                        {ecotechNews.map((doc) => (
                          <NewsCard doc={doc} key={doc.id} />
                        ))}
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

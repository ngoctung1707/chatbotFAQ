import Layout from '@/components/layout/Layout'
import PublicationList from '@/components/publications/PublicationList'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function Publications() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'publications',
    limit: 1000,
    draft: false,
    pagination: true,
    sort: ['-year'],
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
                    <h2 className="title tg-element-title">Publications</h2>
                  </div>
                </div>
              </div>
              <div className="blog__inner-wrap">
                <div className="row">
                  <div className="col-100">
                    <div className="blog-post-wrap">
                      <div className="row gutter-24">
                        <PublicationList showItem={8} publications={docs} />
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

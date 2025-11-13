import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import PublicationCard from '@/components/publications/PublicationCard'
import type { Publication } from '@/payload-types'

export default async function Publication() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'publications',
    draft: false,
    limit: 4,
    pagination: false,
    sort: ['-year'],
  })
  const publications = result.docs as Publication[]
  return (
    <>
      <section className="project-area" id="research">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-7">
              <div className="section-title text-center mb-50 tg-heading-subheading animation-style3">
                <h2 className="title tg-element-title">Research</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="project-item-wrap">
          <div className="container">
            <div className="row gutter-24 justify-content-center">
              {publications.map((item) => (
                <PublicationCard item={item} key={item.id} />
              ))}
            </div>
            <div className="row justify-content-center">
              <div className="col-12">
                <div className="project-content-bottom">
                  <Link href="research/publications" className="btn">
                    See All Publications
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="project-shape-wrap">
          <img src="/assets/img/project/project_shape01.png" alt="" className="alltuchtopdown" />
          <img src="/assets/img/project/project_shape02.png" alt="" className="rotateme" />
        </div>
      </section>
    </>
  )
}

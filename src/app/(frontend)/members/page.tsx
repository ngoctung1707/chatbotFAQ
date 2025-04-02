import Layout from '@/components/layout/Layout'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Media } from '@/payload-types'

export default async function Member() {
  const payload = await getPayload({ config })
  const { docs: members } = await payload.find({
    collection: 'members',
    sort: ['rank'],
  })
  return (
    <>
      <Layout>
        <div>
          <section className="team__area-three">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-xl-6">
                  <div className="section-title text-center mb-40 tg-heading-subheading animation-style3">
                    <h2 className="title tg-element-title">Our Members</h2>
                  </div>
                </div>
              </div>
              <div className="row gutter-24 justify-content-center">
                {members.map((member) => (
                  <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8" key={member.id}>
                    <div className="team__item-three shine-animate-item">
                      <div
                        className="team__thumb-three shine-animate"
                        style={{
                          backgroundImage: 'url("/assets/img/member/background-member.svg")',
                          height: '382px',
                          display: 'flex',
                          flexDirection: 'column-reverse',
                        }}
                      >
                        <img
                          src={(member.avatar as Media).url}
                          alt=""
                          style={{ maxHeight: '300px', aspectRatio: '3/4' }}
                        />
                      </div>
                      <div className="team__content-three">
                        <h4 className="title">
                          <Link href="/members">{member.name}</Link>
                        </h4>
                        <span>{member.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  )
}

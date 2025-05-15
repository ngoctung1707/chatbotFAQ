import Layout from '@/components/layout/Layout'
import Link from 'next/link'

export default async function Ecotech() {
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
              <div className="row">
                <div className="col-12">
                  <div className="services__content-four">
                    <p>
                      In recent years, the Digital Technology, Digital Economy and Fintech sectors
                      in Vietnam have experienced rapid growth due to the surge in the number of
                      smart device users and online services. The population, especially the youth,
                      is increasingly tech-savvy and passionate about technology. The government is
                      also providing extensive support to businesses in the digital economy sector.
                      These favorable conditions create opportunities for national economic
                      development and bring about comprehensive changes in the financial industry
                      over time.
                    </p>

                    <p className="mb-2">
                      The Conference on Digital Economy and Technology (ECOTECH) will address
                      several urgent issues currently facing the Fintech sector in Vietnam,
                      including:
                    </p>

                    <ul>
                      <li className="mb-2">
                        Creating a bridge for researchers, scientists, managers and policymakers to
                        discuss emerging technology trends; to exchange and share scientific
                        knowledge and expertise on the impact of technology on the economy and
                        finance in the context of digital transformation.
                      </li>
                      <li className="mb-2">
                        Seeking innovative and breakthrough ideas; offering feedback, revisions, and
                        support to realize promising projects and initiatives, thereby promoting the
                        growth of the digital economy and digital finance in Vietnam.
                      </li>
                      <li>
                        Collaborating with leading experts across various fields to propose
                        solutions, models, strategic messages, and development policies that
                        integrate technology, economics, and finance in the new era.
                      </li>
                    </ul>

                    <p>
                      Information about the 2nd ECOTECH 2025 conference is available{' '}
                      <Link href="https://ecotech.bkfin.tech/" target="_blank">
                        here
                      </Link>
                      .
                    </p>
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

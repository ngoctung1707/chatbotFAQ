import Layout from '@/components/layout/Layout'
import Link from 'next/link'

export default async function Hackathon() {
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
                    <h2 className="title tg-element-title">HACK &lt;CX&gt; TOGETHER 2025</h2>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="services__content-four">
                    <p>
                      Discover the Potential of AI Technology in Banking at HACK &lt;CX&gt; TOGETHER
                      2025 – where tech talents unite to shape the future of digital banking
                      experiences.
                    </p>

                    <p>
                      The event is organized by the Institute of Digital Technology and Economy –
                      Hanoi University of Science and Technology (HUST) and Lead Consulting, with
                      TECHCOMBANK as the strategic partner, and supported by various schools,
                      institutes, and centers under HUST. This competition offers a golden
                      opportunity for students and tech experts to co-develop innovative solutions,
                      transforming ideas into practical applications with guidance from top Fintech
                      professionals.
                    </p>

                    <p>
                      More than just a playground for innovation, HACK &lt;CX&gt; TOGETHER 2025
                      opens the door to turning projects into real-world products, directly aligned
                      with the needs of the banking industry and contributing to the future of
                      digital financial services.
                    </p>

                    <p>
                      Learn more and register{' '}
                      <Link href="https://www.hacktogether.org/" target="_blank">
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

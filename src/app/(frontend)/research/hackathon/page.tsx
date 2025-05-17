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
                      Explore the potential of AI technology in the banking industry at HACK
                      &lt;CX&gt; TOGETHER 2025 - where technology talents converge to shape the
                      future of digital banking experiences.
                    </p>

                    <p>
                      The event is organized by the Institute of Technology and Digital Economy -
                      Hanoi University of Science and Technology and Lead Consulting with the
                      strategic partner being TECHCOMBANK, accompanied by schools, institutes, and
                      centers belonging to Hanoi University of Science and Technology (HUST). The
                      competition is a golden opportunity for students and technology experts to
                      develop creative solutions, turning ideas into practical applications with
                      guidance from leading experts in the Fintech field.
                    </p>

                    <p>
                      Not just an intellectual playground, HACK &lt;CX&gt; TOGETHER 2025 also opens
                      opportunities to transform projects into real products, connecting directly
                      with the needs of the banking industry and contributing to shaping the future
                      of digital financial services.
                    </p>

                    <p>
                      Learn more information and register to participate{' '}
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

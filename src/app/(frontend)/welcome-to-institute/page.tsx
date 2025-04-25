import Layout from '@/components/layout/Layout'

export default function WelcomeToInstitute() {
  return (
    <>
      <Layout>
        <div>
          <section className="blog__details-area">
            <div className="container">
              <div className="blog__inner-wrap">
                <div className="row">
                  <div className="blog__details-wrap">
                    <div className="blog__details-content">
                      <h2 className="title">Welcome to Institute</h2>
                      <p>
                        As the Director of the Institute for Digital Technology and Economy at Hanoi
                        University of Science and Technology (HUST), I am pleased to welcome you.
                        Our Institute leads in research and development at the intersection of
                        digital transformation, emerging technologies, and economic innovation.
                      </p>
                      <br />
                      <p>
                        We focus on interdisciplinary research in artificial intelligence, big data,
                        blockchain, and digital transformation, addressing their impact on modern
                        economic systems. By fostering collaboration between academia, industry, and
                        government, we support national digital transformation and sustainable
                        economic development.
                      </p>
                      <br />
                      <p>
                        We also offer advanced academic programs and professional training to
                        develop high-quality human resources for the digital economy. Explore our
                        website to learn more about our projects and initiatives. Together, we can
                        shape the future of digital technology and economics.
                      </p>
                      <br />
                      <p>
                        Warm regards,
                        <br /> Nguyen Binh Minh (Assoc. Prof.)
                      </p>
                      <br />
                      <p>
                        Dean, Institute for Digital Technology and Economy
                        <br />
                        Hanoi University of Science and Technology
                      </p>
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

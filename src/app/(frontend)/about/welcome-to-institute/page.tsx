import Layout from '@/components/layout/Layout'

export default function WelcomeToInstitute() {
  return (
    <Layout>
      <div>
        <section className="blog__details-area">
          <div className="container">
            <div className="blog__inner-wrap">
              <div className="row">
                <div className="blog__details-wrap">
                  <div className="blog__details-content">
                    <h2>Welcome to Institute</h2>
                    <br />
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px' }}>
                      <div>
                        <p style={{ textAlign: 'justify' }}>
                          Welcome you to Institute for Digital Technology and Economy. We are a
                          research and development unit at the forefront of digital transformation,
                          emerging technologies, and economic innovation in Vietnam.
                        </p>
                        <p style={{ textAlign: 'justify' }}>
                          We are on our way to becoming a leading force in Vietnam and Southeast
                          Asia, excelling in scientific research, product development, technology
                          transfer, training, and startup incubation. Our mission is to develop
                          cutting-edge financial technology solutions, innovative digital
                          technologies, advanced digital economy models, and transformative digital
                          society initiatives. We are committed to making a positive impact and
                          contributing to the growth of the country&apos;s digital economy and
                          society during this exciting era of national advancement.
                        </p>
                        <p style={{ textAlign: 'justify' }}>
                          Our key values and implementation include:
                        </p>
                        <ul className="space-y-4">
                          <li className="mb-4">
                            <strong>Innovation:</strong> We prioritize creativity and innovation in
                            all our endeavors. Through cutting-edge research and product
                            development, we stay at the forefront of digital technology and economic
                            transformation.
                          </li>
                          <li className="mb-4">
                            <strong>Collaboration:</strong> We foster strong partnerships between
                            academia, industry, and government. Our interdisciplinary projects bring
                            together experts from various fields to solve complex problems and drive
                            impactful research and development.
                          </li>
                          <li className="mb-4">
                            <strong>Excellence:</strong> We are committed to maintaining the highest
                            standards of education, research, and professional training. Continuous
                            improvement ensures our programs and initiatives remain of the highest
                            quality and relevance.
                          </li>
                          <li className="mb-4">
                            <strong>Integrity:</strong> We uphold the highest ethical standards in
                            all our activities, promoting transparency, accountability, and respect
                            for diversity. Our inclusive environment values diverse perspectives and
                            backgrounds.
                          </li>
                          <li className="mb-4">
                            <strong>Sustainability:</strong> We emphasize sustainable development in
                            our projects and initiatives, aligning with sustainable development
                            goals and optimizing resource use to minimize environmental impact.
                          </li>
                        </ul>
                        <p style={{ textAlign: 'justify' }}>
                          With modern facilities and a highly qualified faculty, we are dedicated to
                          nurturing high-quality human resources for the digital economy. I hope we
                          can work together to shape the future of digital technology and economics.
                        </p>
                        <br />
                        <p style={{ textAlign: 'justify' }}>
                          Nguyen Binh Minh (Assoc. Prof.)
                          <br />
                          <br />
                          Dean, Institute for Digital Technology and Economy
                          <br />
                          Hanoi University of Science and Technology
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <img src={'/assets/img/member/minhnb.jpg'} alt="" style={{}} />
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
  )
}

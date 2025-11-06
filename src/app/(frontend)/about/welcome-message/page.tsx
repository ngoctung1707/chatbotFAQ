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
                    <h2>Welcome Message: Shaping Vietnam&apos;s Digital Future</h2>
                    <br />
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px' }}>
                      <div>
                        <p style={{ textAlign: 'justify' }}>
                          On behalf of the Institute for Digital Technology and Economy at Hanoi
                          University of Science and Technology, I extend my warmest welcome to you.
                        </p>
                        <p style={{ textAlign: 'justify' }}>
                          We are living in one of the most dynamic periods of our nation&apos;s
                          development. As a pioneering institution, our mission is to lead the
                          digital transformation, master emerging technologies, and drive economic
                          innovation in Vietnam.
                        </p>
                        <p style={{ textAlign: 'justify' }}>
                          At the Institute, we do not just research—we create. From groundbreaking
                          FinTech solutions to advanced digital economy models and transformative
                          digital society initiatives, all our efforts are directed towards one
                          goal: to contribute actively to the prosperity of Vietnam&apos;s digital
                          economy and society.
                        </p>
                        <p style={{ textAlign: 'justify' }}>
                          This commitment is built upon five core values:
                        </p>
                        <ul className="space-y-4">
                          <li className="mb-4">
                            <strong>Innovation:</strong> Prioritizing creativity and innovation to
                            always lead the way.
                          </li>
                          <li className="mb-4">
                            <strong>Collaboration:</strong> Building strong bridges between
                            academia, industry, and government.
                          </li>
                          <li className="mb-4">
                            <strong>Excellence:</strong> Maintaining the highest standards in
                            training, research, and development.
                          </li>
                          <li className="mb-4">
                            <strong>Integrity:</strong> Upholding the highest ethical standards,
                            transparency, and respect for diversity.
                          </li>
                          <li className="mb-4">
                            <strong>Sustainability:</strong> Optimizing resources and aligning with
                            sustainable development goals.
                          </li>
                        </ul>
                        <p style={{ textAlign: 'justify' }}>
                          With modern facilities and a team of leading experts, we are dedicated to
                          nurturing high-quality human resources for the digital economy.
                        </p>
                        <p style={{ textAlign: 'justify' }}>
                          We believe in the power of collaboration to shape the future. We look
                          forward to the opportunity to create new value with you, contributing to
                          our country&apos;s remarkable journey of development.
                        </p>
                        <p>Sincerely,</p>
                        <p style={{ textAlign: 'justify' }}>
                          <strong>Assoc. Prof. Nguyen Binh Minh, Ph.D.</strong>
                          <br />
                          Dean
                          <br />
                          Institute for Digital Technology and Economy
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

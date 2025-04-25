import Layout from '@/components/layout/Layout'

export default function AdvisoryBoard() {
  return (
    <>
      <Layout breadcrumbTitle="Advisory Board">
        <div>
          <section className="blog__details-area">
            <div className="container">
              <div className="blog__inner-wrap">
                <div className="row">
                  <div className="blog__details-wrap">
                    <div className="blog__details-content">
                      <div className="about__list-box">
                        <ul className="list-wrap">
                          <li>
                            <i className="flaticon-user" /> Prof. David Tran (University of
                            Massachusetts Boston, US) - Chairman
                          </li>
                          <li>
                            <i className="flaticon-user" /> Prof. Hisham Farag (University of
                            Birmingham, UK)
                          </li>
                          <li>
                            <i className="flaticon-user" /> Prof. Lim Kian Guan (Singapore
                            Management University), Singapore)
                          </li>
                          <li>
                            <i className="flaticon-user" /> Prof. Vũ Minh Khương (National
                            University of Singapore, Singapore)
                          </li>
                          <li>
                            <i className="flaticon-user" /> Mr. Kendrick Nguyen (CEO, Republic, US)
                          </li>
                          <li>
                            <i className="flaticon-user" /> Mr. Khoong Chan Meng (CEO, Institute of
                            Systems Science, National University of Singapore (NUS), Singapore)
                          </li>
                        </ul>
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

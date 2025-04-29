import Layout from '@/components/layout/Layout'

export default function BackOffice() {
  return (
    <>
      <Layout breadcrumbTitle="Back Office">
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
                            <i className="flaticon-user" /> Nguyen Thuy Hang
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

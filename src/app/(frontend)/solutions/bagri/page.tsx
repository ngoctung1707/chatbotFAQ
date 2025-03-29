'use client'
import Layout from '@/components/layout/Layout'

export default function BlogDetails() {
  return (
    <>
      <Layout breadcrumbTitle="BAgri">
        <div>
          <section className="blog__details-area">
            <div className="container">
              <div className="blog__inner-wrap">
                <div className="row">
                  <div className="blog__details-wrap">
                    <div className="blog__details-content">
                      <h2 className="title">
                        TRACEABILITY SOLUTION FOR AGRICULTURAL PRODUCTS USING BLOCKCHAIN TECHNOLOGY
                      </h2>
                      <p>
                        Currently, Vietnam is a country with great potential in agriculture, with
                        many opportunities to promote the production and consumption of agricultural
                        products in both domestic and foreign markets. However, in the context of
                        integration, along with the opportunities that are opened, our country&#39;s
                        agricultural products also face great challenges. Today&#39;s market has
                        very high requirements for agricultural products such as: origin,
                        requirements for product labels, maximum chemical residues in agricultural
                        products, legality of raw materials used... This is a huge challenge that
                        Vietnamese agricultural products are facing, as well as a difficult problem
                        for agricultural product suppliers to solve if they need to expand their
                        consumption markets.
                      </p>

                      <p>
                        BAgri is an agricultural product traceability solution researched and
                        developed by the BKC Labs team. By using blockchain technology, BAgri
                        provides users with reliable information about products such as origin,
                        harvest and storage time, necessary information about agricultural
                        products... with just one operation - scanning QR codes extremely quickly
                        and easily. Farms and farming households can easily define operations,
                        production processes, and work assignments at their facilities, thereby
                        saving activity logs on the blockchain network. The solution helps sellers
                        to fully ensure the quality of their products and helps them gain an
                        advantage over competitors. The product currently includes two versions, a
                        mobile application (using iOS and Android operating systems) and a website
                        with a friendly and easy-to-use interface. This solution allows people to
                        store information about their agricultural products on the blockchain
                        platform. Key features include:
                      </p>
                      <div className="about__list-box">
                        <ul className="list-wrap">
                          <li>
                            <i className="flaticon-arrow-button" /> Easy daily work storage via GUI.
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> Supports diverse farm
                            operations.
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> Provides traceability
                          </li>
                        </ul>
                      </div>
                      <br />
                      <p>Currently, BAgri is being deployed for Dien Trach farm - Thanh Hoa.</p>
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

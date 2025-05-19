'use client'
import Layout from '@/components/layout/Layout'

export default function BlogDetails() {
  return (
    <>
      <Layout breadcrumbTitle="BKSign">
        <div>
          <section className="blog__details-area">
            <div className="container">
              <div className="blog__inner-wrap">
                <div className="row">
                  <div className="blog__details-wrap">
                    <div className="blog__details-content">
                      <p>
                        With the development of technology, working from home and working remotely
                        has become popular, leading to organizations and agencies having to
                        regularly send documents and texts in PDF format more often. This leads to a
                        problem: PDF documents often lack the signature of the document
                        creator/authorized person, which reduces the authenticity of the document.
                        Printing documents on paper and signing them manually has the disadvantage
                        of being laborious and time-consuming. To solve the above problems, digital
                        signatures were born. Long-standing forms of digital signatures such as
                        digital signatures using USB tokens or Smart cards are showing many
                        disadvantages in the current new conditions: high cost, inconvenient when
                        required to carry a USB token/SIM to use, and low security.
                      </p>

                      <div style={{ paddingLeft: '2rem' }}>
                        <h4 className="title-two">Remote Signing</h4>
                        <p>
                          Remote Signing is becoming the new generation of digital signature. Remote
                          Signing has overcome the disadvantages of old-style digital signature,
                          when freeing users from carrying hardware digital signature devices. Just
                          using familiar devices such as smartphones, tablets, laptops, users can
                          completely digitally sign documents conveniently and securely.
                        </p>
                        <h4 className="title-two">BSign internal digital signature solution</h4>
                        <p>
                          BSign internal digital signature solution was developed by BKC Labs team
                          when realizing the problem in internal document management in agencies and
                          organizations: need to sign documents, papers, certificates, diplomas,
                          need many signers, sign large quantities, while the implementation cost is
                          low. To do that, BSign has deployed an internal public key infrastructure
                          to issue internal digital certificates to users in the organization,
                          instead of users needing to own expensive public digital certificates.
                        </p>
                        <h4 className="title-two">
                          BSign internal digital signature solution has outstanding features such
                          as:
                        </h4>
                        <ul className="list-wrap">
                          <li>
                            <i className="flaticon-arrow-button" /> Smart contract: V-Chain uses a
                            common, consistent format for users to generate smart contracts for
                            different blockchain platforms.
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> Data model: defines a unified
                            model for storing data on the blockchain network.
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> Resource management: to connect
                            and distribute resources to applications, and to keep logs from nodes,
                            service and application read and write operations at upper layers.
                          </li>
                        </ul>
                        <br />
                        <h4 className="title-two">3. Utility Services</h4>
                        <p>
                          Utility services are developed to support the deployment of decentralized
                          applications in companies, organizations and governments. The services
                          will help blockchainize the organization&#39;s existing operations. Some
                          of the services on the V-Chain platform currently include:
                        </p>
                        <ul className="list-wrap">
                          <li>
                            <i className="flaticon-arrow-button" /> V-Engine: Users can choose which
                            blockchain network to record data on such as Hyperledger Fabric,
                            Ethereum or IPFS, or create their own blockchain
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> V-Mapping: Users define the data
                            stored on the chain, the relationship between the data
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> V-Trace: Users can retrieve data
                            on the network and display it on their applications.
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> V-Storage: is a decentralized
                            storage service based on IPFS technology
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> V-Monitoring: A service that
                            helps users monitor the status of transactions, nodes and the entire
                            blockchain network.
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> V-Token: A service that
                            automatically deploys tokens for the blockchain network in the V-Chain
                            ecosystem.
                          </li>
                        </ul>
                        <br />
                        <h4 className="title-two">4. Service Portals and APIs</h4>
                        <p>
                          V-Chain provides the main communication method through REST API and
                          Web/Portal.
                        </p>
                      </div>
                      <p>
                        The V-Chain platform was born to provide a new and effective solution for
                        the development and deployment of decentralized applications. The platform
                        contributes to promoting the application of blockchain technology in current
                        activities, to bring service quality and trust to users.
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

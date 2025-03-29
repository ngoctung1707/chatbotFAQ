'use client'
import Layout from '@/components/layout/Layout'

export default function BlogDetails() {
  return (
    <>
      <Layout breadcrumbTitle="VChain">
        <div>
          <section className="blog__details-area">
            <div className="container">
              <div className="blog__inner-wrap">
                <div className="row">
                  <div className="blog__details-wrap">
                    <div className="blog__details-content">
                      <p>
                        Exploding in early 2018, Blockchain has become one of the technologies that
                        has changed the world. The development of technology, leading to the birth
                        of many blockchain networks such as Ethereum, Hyperledger Fabric, Avalanche,
                        etc., makes programmers need more time to research on technology and develop
                        decentralized applications - this is also the reason for the birth of the
                        V-Chain platform.
                      </p>
                      <h2 className="title">What is V-Chain?</h2>
                      <p>
                        V-Chain is a platform that supports programmers in developing and deploying
                        decentralized applications on a variety of existing blockchain networks.
                        Currently, the programming time for decentralized applications can last up
                        to several months, but with V-Chain, this time can be shortened to just a
                        few days. V-Chain allows users to easily define application operations, the
                        roles of actors, as well as the data they want to write to a specific
                        blockchain network. From there, V-Chain generates APIs/SDKs to support
                        programmers in communicating with the blockchain network. The platform also
                        supports the deployment of applications, or even a private blockchain
                        network.
                      </p>
                      <div className="blog__details-thumb">
                        <img src="/assets/img/solutions/vchain.jpg" className="w-100" alt="" />
                      </div>
                      <p>
                        The V-Chain platform has an overall architecture of 04 layers, respectively:
                        blockchain network, core services, utility services, service portal and
                        APIs.
                      </p>
                      <div style={{ paddingLeft: '2rem' }}>
                        <h4 className="title-two">1. Blockchain Network</h4>
                        <p>
                          V-Chain is designed to support a variety of blockchain networks including
                          public and private networks such as Hyperledger Sawtooth, Hyperledger
                          Fabric, Ethereum, etc. This allows users to deploy a node in the network
                          themselves, or create a private blockchain to increase security and make
                          transactions quickly.
                        </p>
                        <h4 className="title-two">2. Core Services</h4>
                        <p>
                          The purpose of core services is to enable upper layers to communicate with
                          underlying blockchain networks in a unified and easy way. Some notable
                          core services include:
                        </p>
                        <div className="about__list-box">
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
                              <i className="flaticon-arrow-button" /> Resource management: to
                              connect and distribute resources to applications, and to keep logs
                              from nodes, service and application read and write operations at upper
                              layers.
                            </li>
                          </ul>
                        </div>
                        <br />
                        <h4 className="title-two">3. Utility Services</h4>
                        <p>
                          Utility services are developed to support the deployment of decentralized
                          applications in companies, organizations and governments. The services
                          will help blockchainize the organization&#39;s existing operations. Some
                          of the services on the V-Chain platform currently include:
                        </p>
                        <div className="about__list-box">
                          <ul className="list-wrap">
                            <li>
                              <i className="flaticon-arrow-button" /> V-Engine: Users can choose
                              which blockchain network to record data on such as Hyperledger Fabric,
                              Ethereum or IPFS, or create their own blockchain
                            </li>
                            <li>
                              <i className="flaticon-arrow-button" /> V-Mapping: Users define the
                              data stored on the chain, the relationship between the data
                            </li>
                            <li>
                              <i className="flaticon-arrow-button" /> V-Trace: Users can retrieve
                              data on the network and display it on their applications.
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
                        </div>
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

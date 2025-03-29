'use client'
import Layout from '@/components/layout/Layout'
import Link from 'next/link'

export default function BlogDetails() {
  return (
    <>
      <Layout breadcrumbTitle="B4E">
        <div>
          <section className="blog__details-area">
            <div className="container">
              <div className="blog__inner-wrap">
                <div className="row">
                  <div className="blog__details-wrap">
                    <div className="blog__details-content">
                      <p>
                        Diplomas, certificates, and credentials are documents that educational
                        institutions or organizations often issue to learners when they complete a
                        specific training program. Traditionally, these certifications are issued
                        once in paper form with information about the learner, the training program,
                        and the signature of the head of the organization. These certifications are
                        therefore a special type of document, meaningful and important, and need to
                        be carefully kept throughout life. Nowadays, fake diplomas, certificates,
                        and credentials are a social problem. For a small cost, anyone in need can
                        own a fake document, which is promised to be difficult to detect. The
                        process of authenticating a degree is often long, inconvenient, and can be
                        costly, causing these fake documents to still exist in our society. To solve
                        this problem, providing learners with an additional digital certificate with
                        authentic information that is easy to verify is an urgent requirement.
                      </p>
                      <h2 className="title-two">
                        DIGITAL CERTIFICATE GENERATION AND AUTHENTICATION SYSTEM - B4E
                      </h2>
                      <p>
                        B4E is a system for creating and authenticating digital certificates based
                        on two technologies: remote signing and blockchain. The B4E system allows
                        organizations to digitize the current process of issuing diplomas,
                        certificates, and paper certificates; at the same time, creating digital
                        certificates with high security and legality based on the signer&#39;s
                        electronic signature and completely transparent by applying blockchain
                        technology.
                      </p>

                      <h4>B4E allows users:</h4>
                      <div className="about__list-box">
                        <ul className="list-wrap">
                          <li>
                            <i className="flaticon-arrow-button" /> Digitize the current paper
                            certification process: each educational institution and organization
                            deploys a separate system to create and authenticate the digital
                            certificates it issues. The system administrator will create accounts,
                            set up roles for each user (such as data uploader, signer, data writer
                            to the blockchain network), set up the certificate configuration (the
                            role of each person in a specific certificate, the option to upload to
                            the blockchain network or not).
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> Create a PDF certificate file
                            with a QR code from the certificate template and learner data.
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> Sign the PDF file by relevant
                            people (dean, principal, head of the organization): can sign the entire
                            certificate once.
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> Email the learner with the PDF
                            certificate file - helping the learner to receive their certificate no
                            matter where they are, JSON file - helping the learner to retrieve the
                            pdf file if lost, or when the organization&#39;s database has problems.
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> Easily authenticate digital
                            certificates when opened with PDF file readers such as Adobe Acrobat
                            Reader, Foxit Reader or by scanning the QR code on the certificate, to
                            view the signer&#39;s information, signing time, and document integrity.
                          </li>
                          <li>
                            <i className="flaticon-arrow-button" /> Digital certificates stored on
                            the blockchain network allow for increased trust, transparency, and data
                            integrity. Specifically, based on data stored on the blockchain network,
                            authentication no longer depends solely on the data of the educational
                            institution. In addition, information about educational institutions
                            issuing digital certificates is stored on smart contracts, allowing for
                            clear evidence of the organization&#39;s implementation.
                          </li>
                        </ul>
                      </div>
                      <p>
                        The digital signature system B4E is using is BSign - an internal digital
                        signature solution implemented by BKC Labs itself, completely without using
                        USB Token or SIM.
                      </p>
                      <p>
                        By integrating the most advanced technologies today, B4E hopes to create
                        positive changes in the issuance of degrees, certificates, and
                        certifications and become the leading system in providing solutions for
                        creating and authenticating digital documents for educational institutions
                        in Vietnam.
                      </p>
                      <p>
                        Note: BKC Labs is not an organization providing digital signature
                        certification services according to the provisions of law. To better
                        understand the B4E system, please visit the project&#39;s own website:{' '}
                        <Link href="https://b4e.vn/">https://b4e.vn/</Link>
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

import Link from 'next/link'

export default function Footer() {
  return (
    <>
      <footer>
        <div className="footer__area-two">
          <div className="footer__top-two">
            <div className="container">
              <div className="row">
                <div className="col-xl-4 col-lg-5 col-md-6">
                  <div className="footer-widget">
                    <div className="footer__content-two">
                      <div className="fw-logo mb-25">
                        <Link
                          href="/"
                          style={{
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '4px',
                          }}
                        >
                          <img src="/assets/img/logo/logo.png" alt="" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-2 col-lg-3 col-sm-6">
                  <div className="footer-widget">
                    <div className="footer-link-list"></div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-sm-6">
                  <div className="footer-widget">
                    <h4 className="fw-title">Top Links</h4>
                    <div className="footer-link-list">
                      <ul className="list-wrap">
                        <li>
                          <Link href="/#home">Home</Link>
                        </li>
                        <li>
                          <Link href="/#news">News</Link>
                        </li>
                        <li>
                          <Link href="/#solutions">Solutions</Link>
                        </li>
                        <li>
                          <Link href="/#training">Academic</Link>
                        </li>
                        <li>
                          <Link href="/#publications">Research</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6">
                  <div className="footer-widget">
                    <h4 className="fw-title">Location</h4>
                    <div className="footer-info-list footer-info-two">
                      <ul className="list-wrap">
                        <li>
                          <div className="icon">
                            <i className="flaticon-envelope" />
                          </div>
                          <div className="content">
                            <Link href="mailto:fintech@hust.edu.vn">fintech@hust.edu.vn</Link>
                          </div>
                        </li>
                        <li>
                          <div className="icon">
                            <i className="flaticon-pin" />
                          </div>
                          <div className="content">
                            <p>
                              609,Ta Quang Buu Library, Hanoi University of Science and Technology
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer__bottom-two">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="copyright-text-two">
                    <p>
                      Copyright © <Link href="/">BKFintech</Link> | All Right Reserved
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

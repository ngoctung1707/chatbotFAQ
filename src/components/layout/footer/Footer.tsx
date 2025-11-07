'use client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('Menu')
  return (
    <>
      <style jsx>{`
        .footer-link-list.top-links ul.list-wrap {
          margin: 0;
          padding: 0;
        }
        .footer-link-list.top-links ul.list-wrap li {
          margin-bottom: 6px;
        }
        .footer-link-list.top-links ul.list-wrap li a {
          display: inline-block;
          font-size: 14px;
          line-height: 1.2;
          padding: 2px 0;
        }
      `}</style>
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
                    <div className="footer-link-list top-links">
                      <ul className="list-wrap">
                        <li>
                          <Link href="/">{t('home')}</Link>
                        </li>
                        <li>
                          <Link href="/research">{t('research')}</Link>
                        </li>
                        <li>
                          <Link href="/#solutions">{t('application')}</Link>
                        </li>
                        <li>
                          <Link href="/academic">{t('education')}</Link>
                        </li>
                        <li>
                          <Link href="/get-involved">{t('get_involved')}</Link>
                        </li>
                        <li>
                          <Link href="/news">{t('news')}</Link>
                        </li>
                        <li>
                          <Link href="/about/welcome-message">{t('about')}</Link>
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

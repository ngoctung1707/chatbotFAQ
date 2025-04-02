import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Training() {
  const t = useTranslations('HomePage.sections.course')
  const courses = [
    {
      name: 'DATA ANALYSIS',
      modules: 4,
      desc: 'da',
      time: '72 hours training + 8 hours workshop',
      img: 'da.png',
    },
    {
      name: 'AI FOR BEGINNERS',
      modules: 2,
      desc: 'ai',
      time: '40 hours training + 4 hours workshop',
      img: 'ai.jpeg',
    },
    {
      name: 'AI, BLOCKCHAIN & FINTECH FOR BEGINNERS',
      modules: '1',
      desc: 'bc',
      img: 'ab.png',
      time: 'Free Course - 16 Hours training',
    },
  ]
  return (
    <>
      <section
        className="services__area-three services__bg-three"
        data-background="/assets/img/bg/h3_services_bg.jpg"
        id="training"
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="section-title white-title text-center mb-50 tg-heading-subheading animation-style3">
                <h2 className="title tg-element-title">{t('title')}</h2>
              </div>
            </div>
          </div>
          <div className="row justify-content-center gutter-24">
            {courses.map((course) => (
              <div className="col-xl-4 col-lg-6 col-md-10" key={course.desc}>
                <div className="blog-post-item shine-animate-item">
                  <div className="blog-post-thumb">
                    <Link href="/" className="shine-animate">
                      <img src={`/assets/img/training/${course.img}`} alt="" />
                    </Link>
                    <Link href="/" className="post-tag">
                      {course.modules} modules
                    </Link>
                  </div>
                  <div className="blog-post-content">
                    <h2
                      className="title"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        height: '60px',
                      }}
                    >
                      <Link href="/">{course.name}</Link>
                    </h2>
                    <div className="blog-avatar">
                      <div className="avatar-content">
                        <p
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {t(course.desc)}
                          <br />
                          <br />
                        </p>
                      </div>
                    </div>
                    <div className="blog-post-meta">
                      <ul className="list-wrap">
                        <li>
                          <i className="fas fa-calendar-alt" />
                          72 hours training + 8 hours workshop
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/*<div className="col-xl-4 col-lg-6 col-md-10">*/}
            {/*  <div className="blog-post-item shine-animate-item">*/}
            {/*    <div className="blog-post-thumb">*/}
            {/*      <Link href="/" className="shine-animate">*/}
            {/*        <img src="/assets/img/training/da.png" alt="" />*/}
            {/*      </Link>*/}
            {/*      <Link href="/" className="post-tag">*/}
            {/*        4 modules*/}
            {/*      </Link>*/}
            {/*    </div>*/}
            {/*    <div className="blog-post-content">*/}
            {/*      <h2 className="title">*/}
            {/*        <Link href="/">DATA ANALYSIS</Link>*/}
            {/*      </h2>*/}
            {/*      <div className="blog-avatar">*/}
            {/*        <div className="avatar-content">*/}
            {/*          <p>*/}
            {/*            {t('da')}*/}
            {/*            <br />*/}
            {/*            <br />*/}
            {/*          </p>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*      <div className="blog-post-meta">*/}
            {/*        <ul className="list-wrap">*/}
            {/*          <li>*/}
            {/*            <i className="fas fa-calendar-alt" />*/}
            {/*            72 hours training + 8 hours workshop*/}
            {/*          </li>*/}
            {/*        </ul>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</div>*/}
            {/*<div className="col-xl-4 col-lg-6 col-md-10">*/}
            {/*  <div className="blog-post-item shine-animate-item">*/}
            {/*    <div className="blog-post-thumb">*/}
            {/*      <Link href="" className="shine-animate">*/}
            {/*        <img src="/assets/img/training/ai.jpeg" alt="" />*/}
            {/*      </Link>*/}
            {/*      <Link href="/" className="post-tag">*/}
            {/*        2 modules*/}
            {/*      </Link>*/}
            {/*    </div>*/}
            {/*    <div className="blog-post-content">*/}
            {/*      <h2 className="title">*/}
            {/*        <Link href="/#">AI FOR BEGINNERS</Link>*/}
            {/*      </h2>*/}
            {/*      <div className="blog-avatar">*/}
            {/*        <div className="avatar-content">*/}
            {/*          <p>{t('ai')}</p>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*      <div className="blog-post-meta">*/}
            {/*        <ul className="list-wrap">*/}
            {/*          <li>*/}
            {/*            <i className="fas fa-calendar-alt" />*/}
            {/*            40 hours training + 4 hours workshop*/}
            {/*          </li>*/}
            {/*        </ul>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</div>*/}
            {/*<div className="col-xl-4 col-lg-6 col-md-10">*/}
            {/*  <div className="blog-post-item shine-animate-item">*/}
            {/*    <div className="blog-post-thumb">*/}
            {/*      <Link href="/" className="shine-animate">*/}
            {/*        <img src="/assets/img/training/ab.png" alt="" />*/}
            {/*      </Link>*/}
            {/*      <Link href="/" className="post-tag">*/}
            {/*        1 Module*/}
            {/*      </Link>*/}
            {/*    </div>*/}
            {/*    <div className="blog-post-content">*/}
            {/*      <h2 className="title">*/}
            {/*        <Link href="/">AI, BLOCKCHAIN & FINTECH FOR BEGINNERS</Link>*/}
            {/*      </h2>*/}
            {/*      <div className="blog-avatar">*/}
            {/*        <div className="avatar-content">*/}
            {/*          <p*/}
            {/*            style={{*/}
            {/*              display: '-webkit-box',*/}
            {/*              WebkitLineClamp: 4,*/}
            {/*              WebkitBoxOrient: 'vertical',*/}
            {/*              overflow: 'hidden',*/}
            {/*              textOverflow: 'ellipsis',*/}
            {/*            }}*/}
            {/*          >*/}
            {/*            {t('bc')}*/}
            {/*          </p>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*      <div className="blog-post-meta">*/}
            {/*        <ul className="list-wrap">*/}
            {/*          <li>*/}
            {/*            <i className="fas fa-calendar-alt" />*/}
            {/*            Free Course - 16 Hours Training*/}
            {/*          </li>*/}
            {/*        </ul>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>
        </div>
      </section>
    </>
  )
}

import Link from 'next/link'

export default function About2() {
    return (
        <>
            <section className="about__area-two about__bg" data-background="/assets/img/bg/about_bg.jpg">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-lg-6 col-md-8">
                            <div className="about__img-wrap-two">
                                <img src="/assets/img/images/h2_about_img.jpg" alt="" />
                                <div className="shape">
                                    <img src="/assets/img/images/h2_about_img_shape.png" alt="" className="alltuchtopdown" />
                                </div>
                                <div className="experience__box-two">
                                    <div className="experience__shape">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82 295" fill="none" preserveAspectRatio="none">
                                            <path d="M70.7685 260.479C77.6405 257.127 82 250.15 82 242.503L82 44.8205C82 36.5032 76.8524 29.054 69.0724 26.1128L-3.51784e-06 9.7784e-07L0 295L70.7685 260.479Z" fill="currentcolor" />
                                        </svg>
                                    </div>
                                    <div className="experience__content">
                                        <h4 className="title">25</h4>
                                        <p>Years Of <br /> Experiences</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="about__content-two">
                                <div className="section-title mb-20 tg-heading-subheading animation-style3">
                                    <span className="sub-title">About Our Company</span>
                                    <h2 className="title tg-element-title">We Provide Brilliant Ideas  Adding Success To Your Business Motion.</h2>
                                </div>
                                <p>Mauris ut enim sit amet lacus ornare ullamcorper. Praesent placerat neque eu purus rhoncus, vel tincidunt odio ultrices. Sed theya are feugiat elis Curabitur posuere tristique.</p>
                                <div className="about__content-inner">
                                    <div className="about__list-box">
                                        <ul className="list-wrap">
                                            <li><i className="flaticon-arrow-button" />Challenge Business Growth</li>
                                            <li><i className="flaticon-arrow-button" />Analysis  Research</li>
                                            <li><i className="flaticon-arrow-button" />Finance Security Solutions</li>
                                            <li><i className="flaticon-arrow-button" />100% Money Growth</li>
                                        </ul>
                                    </div>
                                    <div className="about__list-img">
                                        <img src="/assets/img/images/about_list_img.jpg" alt="" />
                                    </div>
                                </div>
                                <div className="about-bottom">
                                    <div className="author-wrap">
                                        <div className="thumb">
                                            <img src="/assets/img/images/author_img.png" alt="" />
                                        </div>
                                        <div className="content">
                                            <img src="/assets/img/images/sign.png" alt="" />
                                            <h4 className="title">Martinaze <span>, CEO</span></h4>
                                        </div>
                                    </div>
                                    <Link href="/about" className="btn btn-two">Read More</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="about__shape-wrap-two">
                    <img src="/assets/img/images/h2_about_shape01.png" alt="" data-parallax="{&quot;x&quot; : -80 , &quot;y&quot; : 80 , &quot;rotateZ&quot;:80}" />
                    <img src="/assets/img/images/h2_about_shape02.png" alt="" data-parallax="{&quot;y&quot; : 100 }" />
                    <img src="/assets/img/images/h2_about_shape03.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                </div>
            </section>
        </>
    )
}

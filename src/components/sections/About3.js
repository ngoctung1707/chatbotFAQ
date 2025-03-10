import Link from 'next/link'

export default function About3() {
    return (
        <>
            <section className="about__area-three about__bg-two" data-background="/assets/img/bg/h3_about_bg.jpg">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-lg-6 col-md-8">
                            <div className="about__img-wrap-three">
                                <img src="/assets/img/images/h3_about_img01.jpg" alt="" />
                                <img src="/assets/img/images/h3_about_img02.jpg" alt="" data-parallax="{&quot;x&quot; : 50 }" />
                                <div className="shape">
                                    <img src="/assets/img/images/h3_about_img_shape.png" alt="" className="alltuchtopdown" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="about__content-three">
                                <div className="section-title mb-25 tg-heading-subheading animation-style3">
                                    <span className="sub-title">About Our Company</span>
                                    <h2 className="title tg-element-title">Providing Expert Advice On Business Consulting, Planning  Success</h2>
                                </div>
                                <p>Mauris ut enim sit amet lacus ornare ullamcorper. Praesent plaacerat  neque eu purus rhoncus, vel tincidunt odio ultrices. Seed theya are feugiat elis Curabitur posuere tristique.</p>
                                <div className="about__content-inner about__content-inner-two">
                                    <div className="experience__box-three">
                                        <div className="title">
                                            <span>25</span>
                                        </div>
                                        <p>Years <span>Experience</span> in Consulting</p>
                                    </div>
                                    <div className="about__list-box about__list-box-two">
                                        <ul className="list-wrap">
                                            <li><i className="flaticon-arrow-button" />Business Growth</li>
                                            <li><i className="flaticon-arrow-button" />Analysis  Research</li>
                                            <li><i className="flaticon-arrow-button" />100% Secure</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="about-bottom about-bottom-two">
                                    <div className="author-wrap">
                                        <div className="thumb">
                                            <img src="/assets/img/images/author_img.png" alt="" />
                                        </div>
                                        <div className="content">
                                            <img src="/assets/img/images/sign.png" alt="" />
                                            <h4 className="title">Martinaze <span>, CEO</span></h4>
                                        </div>
                                    </div>
                                    <div className="about__phone">
                                        <div className="icon">
                                            <i className="flaticon-phone-call" />
                                        </div>
                                        <div className="content">
                                            <span>Hot Line Number</span>
                                            <Link href="tel:0123456789">+123 8989 444</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="about__shape-wrap-three">
                                    <img src="/assets/img/images/h3_about_shape01.png" alt="" className="rotateme" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

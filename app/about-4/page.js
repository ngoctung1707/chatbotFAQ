import PricingTable from "@/components/elements/PricingTable"
import Layout from "@/components/layout/Layout"
import Link from "next/link"

export default function About4() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="About Us">
                <div>
                    <section className="about__area-seven">
                        <div className="container">
                            <div className="row align-items-center justify-content-center">
                                <div className="col-lg-6 col-md-9 order-0 order-lg-2">
                                    <div className="about__img-wrap-seven">
                                        <img src="/assets/img/images/inner04_about_img.jpg" alt="" />
                                        <div className="about__award-box about__award-box-two">
                                            <div className="icon">
                                                <i className="flaticon-trophy" />
                                            </div>
                                            <div className="content">
                                                <h2 className="title">15+</h2>
                                                <p>World Best Agency <br /> Award Got</p>
                                            </div>
                                        </div>
                                        <div className="shape">
                                            <img src="/assets/img/images/h5_about_shape.png" alt="" className="ribbonRotate" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="about__content-seven">
                                        <div className="section-title mb-25">
                                            <span className="sub-title">ABOUT COMPANY</span>
                                            <h2 className="title">Business Growth Creativity Meet Our <span>Agency's Experts</span></h2>
                                        </div>
                                        <p>We successfully cope with tasks of varying complexity provide area longerty guarantees and regularly master.We successfully cope varying complexity provide area longerty guarantees.</p>
                                        <div className="about__content-inner-five">
                                            <div className="about__list-img-four">
                                                <img src="/assets/img/images/about_list_img04.png" alt="" />
                                            </div>
                                            <div className="about__list-box">
                                                <ul className="list-wrap">
                                                    <li><i className="flaticon-arrow-button" />Medicare Advantage Plans</li>
                                                    <li><i className="flaticon-arrow-button" />Analysis  Research</li>
                                                    <li><i className="flaticon-arrow-button" />100% Secure Money Back</li>
                                                    <li><i className="flaticon-arrow-button" />100% Money Growth</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <Link href="/contact" className="btn btn-two">Contact With Us</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="about__shape-wrap-four">
                            <img src="/assets/img/images/h4_about_shape01.png" alt="" />
                            <img src="/assets/img/images/h4_about_shape02.png" alt="" data-parallax="{&quot;x&quot; : -80 , &quot;y&quot; : -80 }" />
                        </div>
                    </section>
                    {/* about-area-end */}
                    {/* services-area */}
                    <section className="services__area-four services__bg-four" data-background="/assets/img/bg/inner_services_bg.jpg">
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-lg-6">
                                    <div className="section-title text-center mb-50">
                                        <span className="sub-title">Special Features</span>
                                        <h2 className="title">Transforming Your Business With Technology</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-center gutter-24">
                                <div className="col-lg-4 col-md-6">
                                    <div className="services__item-three">
                                        <div className="services__item-top">
                                            <div className="services__icon-three">
                                                <i className="flaticon-profit" />
                                            </div>
                                            <div className="services__item-top-title">
                                                <h2 className="title"><Link href="/services-details">Modern Strategic Business</Link></h2>
                                            </div>
                                        </div>
                                        <div className="services__content-three">
                                            <p>Mauris utenim sitamet lacus ornar eary ullamcperson Praesent plaacera treat neque eu purus rhoncu</p>
                                            <Link href="/services-details" className="btn btn-two">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="services__item-three">
                                        <div className="services__item-top">
                                            <div className="services__icon-three">
                                                <i className="flaticon-target" />
                                            </div>
                                            <div className="services__top-title">
                                                <h2 className="title"><Link href="/services-details">Target<br /> Marketing</Link></h2>
                                            </div>
                                        </div>
                                        <div className="services__content-three">
                                            <p>Mauris utenim sitamet lacus ornar eary ullamcperson Praesent plaacera treat neque eu purus rhoncu</p>
                                            <Link href="/services-details" className="btn btn-two">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="services__item-three">
                                        <div className="services__item-top">
                                            <div className="services__icon-three">
                                                <i className="flaticon-financial-profit" />
                                            </div>
                                            <div className="services__top-title">
                                                <h2 className="title"><Link href="/services-details">Finance <br />Investment</Link></h2>
                                            </div>
                                        </div>
                                        <div className="services__content-three">
                                            <p>Mauris utenim sitamet lacus ornar eary ullamcperson Praesent plaacera treat neque eu purus rhoncu</p>
                                            <Link href="/services-details" className="btn btn-two">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="services__shape-wrap-two">
                            <img src="/assets/img/services/inner_services_shape01.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                            <img src="/assets/img/services/inner_services_shape02.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                        </div>
                    </section>
                    {/* services-area-end */}
                    {/* testimonial-area */}
                    <section className="testimonial__area-two">
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-lg-6">
                                    <div className="section-title white-title text-center mb-50">
                                        <span className="sub-title">Clients Testimonial</span>
                                        <h2 className="title">What Our Loving Clients Saying</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-center gutter-24">
                                <div className="col-lg-4 col-md-6">
                                    <div className="testimonial__item-two">
                                        <div className="testimonial__avatar">
                                            <img src="/assets/img/images/testi_avatar01.png" alt="" />
                                        </div>
                                        <div className="testimonial__info-two">
                                            <h2 className="title">John Gripsonery</h2>
                                            <span>CEO,JAKS Shans</span>
                                        </div>
                                        <div className="testimonial__rating">
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                        </div>
                                        <p>Songerty successfully cope with tasks of varying complexity provide area guarantees and regularly.</p>
                                        <div className="icon">
                                            <img src="/assets/img/icon/quote.svg" alt="" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="testimonial__item-two">
                                        <div className="testimonial__avatar">
                                            <img src="/assets/img/images/testi_avatar02.png" alt="" />
                                        </div>
                                        <div className="testimonial__info-two">
                                            <h2 className="title">Kristin Watson</h2>
                                            <span>CEO,JAKS Shans</span>
                                        </div>
                                        <div className="testimonial__rating">
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                        </div>
                                        <p>Songerty successfully cope with tasks of varying complexity provide area guarantees and regularly.</p>
                                        <div className="icon">
                                            <img src="/assets/img/icon/quote.svg" alt="" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="testimonial__item-two">
                                        <div className="testimonial__avatar">
                                            <img src="/assets/img/images/testi_avatar03.png" alt="" />
                                        </div>
                                        <div className="testimonial__info-two">
                                            <h2 className="title">Wade Warren</h2>
                                            <span>CEO,JAKS Shans</span>
                                        </div>
                                        <div className="testimonial__rating">
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                            <i className="fas fa-star" />
                                        </div>
                                        <p>Songerty successfully cope with tasks of varying complexity provide area guarantees and regularly.</p>
                                        <div className="icon">
                                            <img src="/assets/img/icon/quote.svg" alt="" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial__shape-two">
                            <img src="/assets/img/images/h2_testimonial_shape.png" alt="" data-aos="fade-up" data-aos-delay={400} />
                        </div>
                    </section>
                    {/* testimonial-area-end */}
                    {/* pricing-area */}
                    <section className="pricing__area pricing__bg" data-background="/assets/img/bg/pricing_bg.jpg">
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-xl-5">
                                    <div className="section-title text-center mb-30">
                                        <span className="sub-title">Flexible Pricing Plan</span>
                                        <h2 className="title">We’ve Offered The Best Pricing For You</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="pricing__item-wrap">
                            <PricingTable />
                            </div>
                        </div>
                        <div className="pricing__shape-wrap">
                            <img src="/assets/img/images/pricing_shape01.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                            <img src="/assets/img/images/pricing_shape02.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                        </div>
                    </section>
                </div>
            </Layout>
        </>
    )
}
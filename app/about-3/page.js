import VideoPopup from "@/components/elements/PopupVideo"
import PricingTable from "@/components/elements/PricingTable"
import Layout from "@/components/layout/Layout"
import BrandActiveSlider from "@/components/slider/BrandActiveSlider"
import TestimonialActiveTwoSlider from "@/components/slider/TestimonialActiveTwoSlider"
import Link from "next/link"

export default function About3() {
    return (
        <>

            <Layout headerStyle={1} footerStyle={2} breadcrumbTitle="About Us">
                <div>
                    <section className="about__area-six">
                        <div className="container">
                            <div className="row align-items-center justify-content-center">
                                <div className="col-lg-6 col-md-8">
                                    <div className="about__img-wrap-six">
                                        <img src="/assets/img/images/h4_about_img01.jpg" alt="" />
                                        <img src="/assets/img/images/h4_about_img02.jpg" alt="" data-parallax="{&quot;x&quot; : 40}" />
                                        <div className="experience__box-four">
                                            <h2 className="title">25</h2>
                                            <p>Years Experience <br /> in This Field</p>
                                        </div>
                                        <div className="shape">
                                            <img src="/assets/img/images/h4_about_img_shape.png" alt="" className="alltuchtopdown" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="about__content-six">
                                        <div className="section-title mb-25">
                                            <span className="sub-title">About Us</span>
                                            <h2 className="title">Insurance For The Better <br /> Family  Corporate Life</h2>
                                        </div>
                                        <p>We successfully cope with tasks of varying complexity provide area longerty guarantees and regularly master new Practice Following gies heur portfolio includes.</p>
                                        <div className="about__content-inner-four">
                                            <div className="about__list-box">
                                                <ul className="list-wrap">
                                                    <li><i className="flaticon-arrow-button" />Medicare Advantage Plans</li>
                                                    <li><i className="flaticon-arrow-button" />Analysis  Research</li>
                                                    <li><i className="flaticon-arrow-button" />100% Secure Money Back</li>
                                                </ul>
                                            </div>
                                            <div className="about__list-img-three">
                                                <img src="/assets/img/images/about_list_img03.png" alt="" />
                                                <VideoPopup/>
                                            </div>
                                        </div>
                                        <Link href="/contact" className="btn btn-two">Quick Contact Us</Link>
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
                    {/* choose-area */}
                    <section className="choose-area">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-6 order-0 order-lg-2">
                                    <div className="choose-img-wrap">
                                        <img src="/assets/img/images/choose_img01.jpg" alt="" />
                                        <img src="/assets/img/images/choose_img02.jpg" alt="" data-parallax="{&quot;x&quot; : 50 }" />
                                        <img src="/assets/img/images/choose_img_shape.png" alt="" className="alltuchtopdown" />
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="choose-content">
                                        <div className="section-title white-title mb-30">
                                            <span className="sub-title">Why We Are The Best</span>
                                            <h2 className="title">We Offer Business Insight <br /> World Class Consulting</h2>
                                        </div>
                                        <p>We successfully cope with tasks of varying complexity provide area longerty guarantees and regularly master new Practice Following gies heur portfolio includes dozen.</p>
                                        <div className="choose-list">
                                            <ul className="list-wrap">
                                                <li>
                                                    <div className="icon">
                                                        <i className="flaticon-investment" />
                                                    </div>
                                                    <div className="content">
                                                        <h4 className="title">Business Solutions</h4>
                                                        <p>Semper egetuis kelly for tellus urna area condition.</p>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="icon">
                                                        <i className="flaticon-investment-1" />
                                                    </div>
                                                    <div className="content">
                                                        <h4 className="title">Market Analysis</h4>
                                                        <p>Semper egetuis kelly for tellus urna area condition.</p>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="choose-shape-wrap">
                            <img src="/assets/img/images/choose_shape01.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                            <img src="/assets/img/images/choose_shape02.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                        </div>
                    </section>
                    {/* choose-area-end */}
                    {/* testimonial-area */}
                    <section className="testimonial__area-four testimonial__bg testimonial__bg-two" data-background="/assets/img/bg/h3_testimonial_bg.jpg">
                        <div className="container">
                            <div className="row align-items-center justify-content-center">
                                <div className="col-lg-5 col-md-8">
                                    <div className="testimonial__img-wrap-two">
                                        <img src="/assets/img/images/inner_testimonial_img.png" alt="" />
                                        <div className="testimonial__img-shape-two">
                                            <img src="/assets/img/images/h3_testimonial_shape01.png" alt="" className="alltuchtopdown" />
                                            <img src="/assets/img/images/inner_testimonial_shape.png" alt="" className="rotateme" />
                                            <img src="/assets/img/images/h3_testimonial_shape03.png" alt="" />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-7">
                                    <div className="testimonial__item-wrap">
                                        <div className="swiper-container testimonial-active-two">
                                            <TestimonialActiveTwoSlider />
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                    {/* pricing-area-end */}
                    {/* brand-area */}
                    <div className="brand__area-two">
                        <div className="container">
                            <div className="swiper-container brand-active">
                                <BrandActiveSlider />
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}
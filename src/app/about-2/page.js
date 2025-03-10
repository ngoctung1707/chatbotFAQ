'use client'
import CounterUp from "@/components/elements/CounterUp"
import SocialToggle from "@/components/elements/SocialToggle"
import Layout from "@/components/layout/Layout"
import BrandActiveSlider from "@/components/slider/BrandActiveSlider"
import TestimonialActiveTwoSlider from "@/components/slider/TestimonialActiveTwoSlider"
import Link from "next/link"
import ReactCurvedText from "react-curved-text"

export default function About2() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="About Us">
                <div>
                    {/* about-area */}
                    <section className="about__area-five">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="about__content-five">
                                        <div className="section-title mb-30">
                                            <h2 className="title">Dedicated Teams <br /> <span>Always</span> Bring Something <span>Good</span></h2>
                                        </div>
                                        <div className="about__img-wrap-five">
                                            <img src="/assets/img/images/inner02_about_img.jpg" alt="" />
                                            <div className="experience-year">
                                                <div className="icon">
                                                    <i className="flaticon-trophy" />
                                                </div>
                                                <div className="content">
                                                    <div className="circle">
                                                        <ReactCurvedText
                                                            width='160'
                                                            height='160'
                                                            cx='80'
                                                            cy='80'
                                                            rx='50'
                                                            ry='50'
                                                            startOffset='0'
                                                            reversed={true}
                                                            text='Years Of - Experience 25 -'
                                                            textProps={{ "style": { "fontSize": "16" } }}
                                                            textPathProps={{ "fill": "#ffffff" }}
                                                            tspanProps={null}
                                                            ellipseProps={null}
                                                            svgProps={null}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        <p>We when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only fiveawe centuriesbut also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release offer Letraset when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuriesbut also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* about-area-end */}
                    {/* counter-area */}
                    <section className="counter-area">
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-xl-3 col-lg-4 col-sm-6">
                                    <div className="counter-item">
                                        <div className="icon">
                                            <i className="flaticon-trophy" />
                                        </div>
                                        <div className="content">
                                            <h2 className="count"><CounterUp count={45} />+</h2>
                                            <p>Successfully <br /> Completed Projects</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-sm-6">
                                    <div className="counter-item">
                                        <div className="icon">
                                            <i className="flaticon-happy" />
                                        </div>
                                        <div className="content">
                                            <h2 className="count"><CounterUp count={92} />K</h2>
                                            <p>Satisfied <br /> 100% Our Clients</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-sm-6">
                                    <div className="counter-item">
                                        <div className="icon">
                                            <i className="flaticon-china" />
                                        </div>
                                        <div className="content">
                                            <h2 className="count"><CounterUp count={19} />+</h2>
                                            <p>All Over The World <br /> We Are Available</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-sm-6">
                                    <div className="counter-item">
                                        <div className="icon">
                                            <i className="flaticon-time" />
                                        </div>
                                        <div className="content">
                                            <h2 className="count"><CounterUp count={25} />+</h2>
                                            <p>Years of Experiences <br /> To Run This Company</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="counter-shape-wrap">
                            <img src="/assets/img/images/counter_shape01.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                            <img src="/assets/img/images/counter_shape02.png" alt="" data-parallax="{&quot;x&quot; : 100 , &quot;y&quot; : -100 }" />
                            <img src="/assets/img/images/counter_shape03.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                        </div>
                    </section>
                    {/* counter-area-end */}
                    {/* request-area */}
                    <section className="request-area request-bg" data-background="/assets/img/bg/request_bg.jpg">
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-lg-8">
                                    <div className="request-content text-center">
                                        <h2 className="title">Offering The Best Experience Of Business Consulting Services</h2>
                                        <div className="content-bottom">
                                            <Link href="tel:0123456789" className="btn">Request a Free Call</Link>
                                            <div className="content-right">
                                                <div className="icon">
                                                    <i className="flaticon-phone-call" />
                                                </div>
                                                <div className="content">
                                                    <span>Toll Free Call</span>
                                                    <Link href="tel:0123456789">+ 88 ( 9600 ) 6002</Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="request-shape">
                            <img src="/assets/img/images/request_shape01.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                            <img src="/assets/img/images/request_shape02.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                        </div>
                    </section>
                    {/* request-area-end */}
                    {/* team-area */}
                    <section className="team__area-three">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-xl-7 col-lg-6">
                                    <div className="section-title mb-50">
                                        <span className="sub-title">MEET OUR TEAM</span>
                                        <h2 className="title">Financial Expertise You <br /> Can Trust</h2>
                                    </div>
                                </div>
                                <div className="col-xl-5 col-lg-6">
                                    <div className="section-content">
                                        <p>Our power of choice is untrammelled and when nothing preven tsbeing able to do what we like best every pleasure.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="row gutter-24 justify-content-center">
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="team__item-three shine-animate-item">
                                        <div className="team__thumb-three shine-animate">
                                            <img src="/assets/img/team/h3_team_img01.jpg" alt="" />
                                        </div>
                                        <div className="team__content-three">
                                            <h4 className="title"><Link href="/team-details">Brooklyn Simmons</Link></h4>
                                            <span>Finance Advisor</span>
                                        </div>
                                        <div className="team-social team__social-three">
                                            <SocialToggle />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="team__item-three shine-animate-item">
                                        <div className="team__thumb-three shine-animate">
                                            <img src="/assets/img/team/h3_team_img02.jpg" alt="" />
                                        </div>
                                        <div className="team__content-three">
                                            <h4 className="title"><Link href="/team-details">Eleanor Pena</Link></h4>
                                            <span>Finance Advisor</span>
                                        </div>
                                        <div className="team-social team__social-three">
                                            <SocialToggle />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="team__item-three shine-animate-item">
                                        <div className="team__thumb-three shine-animate">
                                            <img src="/assets/img/team/h3_team_img03.jpg" alt="" />
                                        </div>
                                        <div className="team__content-three">
                                            <h4 className="title"><Link href="/team-details">Floyd Miles</Link></h4>
                                            <span>Finance Advisor</span>
                                        </div>
                                        <div className="team-social team__social-three">
                                            <SocialToggle />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="team__item-three shine-animate-item">
                                        <div className="team__thumb-three shine-animate">
                                            <img src="/assets/img/team/h3_team_img04.jpg" alt="" />
                                        </div>
                                        <div className="team__content-three">
                                            <h4 className="title"><Link href="/team-details">Ralph Edwards</Link></h4>
                                            <span>Finance Advisor</span>
                                        </div>
                                        <div className="team-social team__social-three">
                                            <SocialToggle />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* team-area-three */}
                    {/* testimonial-area */}
                    <section className="testimonial__area-three testimonial__bg" data-background="/assets/img/bg/h3_testimonial_bg.jpg">
                        <div className="container">
                            <div className="row align-items-center justify-content-center">
                                <div className="col-lg-5 col-md-8">
                                    <div className="testimonial__img-wrap-two">
                                        <img src="/assets/img/images/h3_testimonial_img.png" alt="" />
                                        <div className="testimonial__img-shape-two">
                                            <img src="/assets/img/images/h3_testimonial_shape01.png" alt="" className="alltuchtopdown" />
                                            <img src="/assets/img/images/h3_testimonial_shape02.png" alt="" className="rotateme" />
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
                    {/* brand-area */}
                    <div className="brand__area-four">
                        <div className="container">
                            <div className="swiper-container brand-active">
                                <BrandActiveSlider />
                            </div>
                        </div>
                    </div>
                    {/* brand-area */}
                </div>
            </Layout>
        </>
    )
}
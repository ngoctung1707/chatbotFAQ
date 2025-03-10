import CounterUp from "@/components/elements/CounterUp"
import SocialToggle from "@/components/elements/SocialToggle"
import Layout from "@/components/layout/Layout"
import BrandActiveSlider from "@/components/slider/BrandActiveSlider"
import TestimonialActiveTwoSlider from "@/components/slider/TestimonialActiveTwoSlider"
import Link from "next/link"

export default function About5() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="About Us">
                <div>
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
                                        <div className="section-title mb-25">
                                            <span className="sub-title">About Our Company</span>
                                            <h2 className="title">Providing Expert Advice On Business Consulting, Planning  Success</h2>
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
                    <section className="request__area-two">
                        <div className="request__bg-two" data-background="/assets/img/bg/h2_request_bg.jpg" />
                        <div className="container">
                            <div className="row justify-content-end">
                                <div className="col-xl-5 col-lg-6">
                                    <div className="request__content-two">
                                        <h2 className="title">Offering The Best <span>Experience Of</span> Finance Services</h2>
                                        <div className="request__phone">
                                            <div className="icon">
                                                <i className="flaticon-phone-call" />
                                            </div>
                                            <div className="content">
                                                <span>Toll Free Call</span>
                                                <Link href="tel:0123456789">+ 88 ( 9600 ) 6002</Link>
                                            </div>
                                        </div>
                                        <Link href="tel:0123456789" className="btn">Request a Free Call</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* request-area-end */}
                    {/* team-area */}
                    <section className="team-area pt-120 pb-90">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-xl-7 col-lg-6">
                                    <div className="section-title mb-40">
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
                            <div className="team-item-wrap">
                                <div className="row justify-content-center">
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img01.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle />
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Jone Cooper</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img02.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle />
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Eleanor Pena</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img03.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle />
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Floyd Miles</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img04.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle />
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Ralph Edwards</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* team-area-end */}
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
                    {/* call-back-area */}
                    <section className="call-back-area">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="call-back-content">
                                        <div className="section-title white-title mb-10">
                                            <h2 className="title">Request A Call Back</h2>
                                        </div>
                                        <p>Ever find yourself staring at your computer screen a good consulting slogan to come to mind? Oftentimes.</p>
                                        <div className="shape">
                                            <img src="/assets/img/images/call_back_shape.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="call-back-form">
                                        <form action="#">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-grp">
                                                        <input type="text" placeholder="Name *" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-grp">
                                                        <input type="email" placeholder="E-mail *" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-grp">
                                                        <input type="number" placeholder="Phone *" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <button type="submit" className="btn">Send Now</button>
                                                </div>
                                            </div>
                                        </form>
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
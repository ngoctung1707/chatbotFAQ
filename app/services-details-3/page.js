import Layout from "@/components/layout/Layout"
import BrandActiveSlider from "@/components/slider/BrandActiveSlider"
import Link from "next/link"

export default function ServicesDetails3() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Service Details">
                <div>
                    <section className="services__details-area">
                        <div className="container">
                            <div className="services__details-wrap">
                                <div className="row">
                                    <div className="col-70 order-0 order-lg-2">
                                        <div className="services__details-content services__details-content-two">
                                            <h2 className="title">We help our clients identify their they area issues develop solutions and take action</h2>
                                            <p>eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond the scope of our own expertise. That’s why we’ve developed close working relationships with a number of strategic partner.</p>
                                            <div className="services__details-thumb">
                                                <img src="/assets/img/services/services_details03.jpg" alt="" />
                                            </div>
                                            <div className="services__details-inner-three">
                                                <div className="row gutter-24 align-items-center">
                                                    <div className="col-md-5">
                                                        <div className="services__details-list-box-three">
                                                            <div className="icon">
                                                                <i className="flaticon-investment" />
                                                            </div>
                                                            <div className="content">
                                                                <h4 className="title">Business Solutions</h4>
                                                                <p>Semper egetuis kelly for tellus <br /> urna area condition.</p>
                                                            </div>
                                                        </div>
                                                        <div className="services__details-list-box-three">
                                                            <div className="icon">
                                                                <i className="flaticon-investment-1" />
                                                            </div>
                                                            <div className="content">
                                                                <h4 className="title">Business Solutions</h4>
                                                                <p>Semper egetuis kelly for tellus <br /> urna area condition.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-7">
                                                        <div className="services__details-inner-content-three">
                                                            <h3 className="title">Let’s Enroll Our Business Growth Management</h3>
                                                            <p>eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p>eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond the scope of our own expertise. </p>
                                            <div className="services__details-inner-two services__details-inner-four">
                                                <div className="row gutter-24 align-items-center">
                                                    <div className="col-48">
                                                        <div className="services__details-inner-img">
                                                            <img src="/assets/img/services/services_details_inner03.jpg" alt="" />
                                                        </div>
                                                    </div>
                                                    <div className="col-52">
                                                        <div className="services__details-inner-content-two">
                                                            <h4 className="title">Our Corporate Business Planning</h4>
                                                            <p>when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries.but also the leap into electronic typesetting, remaining.</p>
                                                            <div className="about__list-box about__list-box-three">
                                                                <ul className="list-wrap">
                                                                    <li><i className="flaticon-arrow-button" />Business Growth</li>
                                                                    <li><i className="flaticon-arrow-button" />100% Secure</li>
                                                                    <li><i className="flaticon-arrow-button" />Research</li>
                                                                    <li><i className="flaticon-arrow-button" />100% Secure</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="last-info">when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galley of type and scrambled it to make a type specimen book.when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galle.</p>
                                        </div>
                                    </div>
                                    <div className="col-30">
                                        <aside className="services__sidebar">
                                            <div className="sidebar__widget">
                                                <div className="sidebar__cat-list-two sidebar__cat-list-three">
                                                    <ul className="list-wrap">
                                                        <li><Link href="/services-details">Investment Planning <i className="flaticon-arrow-button" /></Link></li>
                                                        <li><Link href="/services-details">Strategic marketing <i className="flaticon-arrow-button" /></Link></li>
                                                        <li><Link href="/services-details">Insights  analytics <i className="flaticon-arrow-button" /></Link></li>
                                                        <li><Link href="/services-details">Business consulting <i className="flaticon-arrow-button" /></Link></li>
                                                        <li><Link href="/services-details">Financial Advisory <i className="flaticon-arrow-button" /></Link></li>
                                                        <li><Link href="/services-details">Market Research <i className="flaticon-arrow-button" /></Link></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="sidebar__widget sidebar__widget-three">
                                                <h4 className="sidebar__widget-title">Brochure</h4>
                                                <div className="sidebar__brochure sidebar__brochure-two">
                                                    <p>when an unknown printer took ga lley offer typey anddey.</p>
                                                    <Link href="/assets/img/services/services_details01.jpg" target="_blank" download><i className="far fa-file-pdf" />PDF. Download</Link>
                                                    <Link href="/assets/img/services/services_details01.jpg" target="_blank" download><i className="far fa-file-alt" />DOC. Download</Link>
                                                </div>
                                            </div>
                                            <div className="sidebar__widget sidebar__widget-two">
                                                <div className="sidebar__contact sidebar__contact-two" data-background="/assets/img/services/sidebar_contact_bg.jpg">
                                                    <h2 className="title">If You Need Any Help Contact With Us</h2>
                                                    <Link href="tel:0123456789" className="btn"><i className="flaticon-phone-call" />+91 705 2101 786</Link>
                                                </div>
                                            </div>
                                            <div className="sidebar__widget sidebar__widget-three">
                                                <h4 className="sidebar__widget-title">Send Us Message</h4>
                                                <div className="sidebar__form">
                                                    <form action="#">
                                                        <div className="form-grp">
                                                            <input type="text" placeholder="Your Name" />
                                                        </div>
                                                        <div className="form-grp">
                                                            <input type="email" placeholder="E-mail Address" />
                                                        </div>
                                                        <div className="form-grp">
                                                            <textarea name="message" placeholder="Type Your Message" />
                                                        </div>
                                                        <button type="submit" className="btn btn-two">Send Message</button>
                                                    </form>
                                                </div>
                                            </div>
                                        </aside>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* services-details-area-end */}
                    {/* brand-area */}
                    <div className="brand__area-six">
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
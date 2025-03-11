import Layout from "@/components/layout/Layout"
import BrandActiveSlider from "@/components/slider/BrandActiveSlider"
import Link from "next/link"

export default function ServicesDetails2() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Service Details">
                <div>
                    <section className="services__details-area">
                        <div className="container">
                            <div className="services__details-wrap">
                                <div className="row">
                                    <div className="col-70 order-0 order-lg-2">
                                        <div className="services__details-top">
                                            <div className="row gutter-24 align-items-center">
                                                <div className="col-49">
                                                    <div className="services__details-thumb services__details-thumb-two">
                                                        <img src="/assets/img/services/services_details02.jpg" alt="" />
                                                    </div>
                                                </div>
                                                <div className="col-51">
                                                    <div className="services__details-top-content">
                                                        <h2 className="title">Investment Business Planning</h2>
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
                                        <div className="services__details-content">
                                            <p>eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond the scope of our own expertise. That’s why we’ve developed close working relationships with a number of strategic partner.</p>
                                            <div className="services__details-inner-two">
                                                <div className="row gutter-24 align-items-center">
                                                    <div className="col-48 order-0 order-md-2">
                                                        <div className="services__details-inner-img">
                                                            <img src="/assets/img/services/services_details_inner02.jpg" alt="" />
                                                        </div>
                                                    </div>
                                                    <div className="col-52">
                                                        <div className="services__details-inner-content-two">
                                                            <h4 className="title">Let’s Enroll Our Business Growth Management</h4>
                                                            <p>eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond the scope of our own expertise. That’s why we’ve developed.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <h2 className="title-two">3 Simple Steps to Process</h2>
                                            <p>when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galley of type and scrambled it to make a type specimen book.</p>
                                            <div className="services__details-list-two">
                                                <div className="row gutter-24">
                                                    <div className="col-md-4">
                                                        <div className="services__details-list-box-two">
                                                            <div className="icon">
                                                                <i className="flaticon-report" />
                                                            </div>
                                                            <div className="content">
                                                                <h4 className="title">Business Ratings</h4>
                                                                <p>We successfully cope year withtks arying mplexity</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="services__details-list-box-two">
                                                            <div className="icon">
                                                                <i className="flaticon-email" />
                                                            </div>
                                                            <div className="content">
                                                                <h4 className="title">Digital Marketing</h4>
                                                                <p>We successfully cope year withtks arying mplexity</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="services__details-list-box-two">
                                                            <div className="icon">
                                                                <i className="flaticon-life-insurance" />
                                                            </div>
                                                            <div className="content">
                                                                <h4 className="title">Extend Coverage</h4>
                                                                <p>We successfully cope year withtks arying mplexity</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="last-info">when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galley of type and scrambled it to make a type specimen book.</p>
                                        </div>
                                    </div>
                                    <div className="col-30">
                                        <aside className="services__sidebar">
                                            <div className="sidebar__widget sidebar__widget-three">
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
                                            <div className="sidebar__widget sidebar__widget-two">
                                                <div className="sidebar__contact sidebar__contact-two" data-background="/assets/img/services/sidebar_contact_bg.jpg">
                                                    <h2 className="title">If You Need Any Help Contact With Us</h2>
                                                    <Link href="tel:0123456789" className="btn"><i className="flaticon-phone-call" />+91 705 2101 786</Link>
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
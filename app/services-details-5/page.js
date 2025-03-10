import Layout from "@/components/layout/Layout"
import Link from "next/link"

export default function ServicesDetails5() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Service Details">
                <div>
                    <section className="services__details-area">
                        <div className="container">
                            <div className="services__details-wrap">
                                <div className="row">
                                    <div className="col-70 order-0 order-lg-2">
                                        <div className="services__details-thumb">
                                            <img src="/assets/img/services/services_details05.jpg" alt="" />
                                        </div>
                                        <div className="services__details-content services__details-content-two">
                                            <h2 className="title">We help our clients identify their they area issues develop solutions and take action</h2>
                                            <p>eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond the scope of our own expertise. </p>
                                            <div className="services__details-inner-six">
                                                <div className="row gutter-24 align-items-center">
                                                    <div className="col-lg-7 col-md-6">
                                                        <div className="services__details-inner-content-three">
                                                            <h3 className="title">Our Business Goal</h3>
                                                            <p>when an unknown printer took are galley  type der one roof, thereand scrambled itter to make a type specimen bookhas a not only five centurie </p>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-5 col-md-6">
                                                        <div className="services__details-inner-graph">
                                                            <img src="/assets/img/services/services_details_graph01.jpg" alt="" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <h2 className="title-two">Our Corporate Business Planning</h2>
                                            <p>when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries.but also the leap into electronic typesetting, remaining.</p>
                                            <div className="services__details-inner-img-wrap">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <img src="/assets/img/services/services_details_inner05.jpg" alt="" />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <img src="/assets/img/services/services_details_inner06.jpg" alt="" />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="last-info">when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galley of type and scrambled it to make a type specimen book.when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galle.</p>
                                        </div>
                                    </div>
                                    <div className="col-30">
                                        <aside className="services__sidebar">
                                            <div className="sidebar__widget">
                                                <div className="sidebar__cat-list-two">
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
                                            <div className="sidebar__widget">
                                                <h4 className="sidebar__widget-title">Brochure</h4>
                                                <div className="sidebar__brochure">
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
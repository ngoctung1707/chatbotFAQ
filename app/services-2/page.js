import Layout from "@/components/layout/Layout"
import Link from "next/link"

export default function Services2() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="All Services">
                <section className="services__area-two">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="section-title white-title mb-50">
                                    <span className="sub-title">Why We Are The Best</span>
                                    <h2 className="title">Let’s Discover Our Service Features Charter</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center gutter-24">
                            <div className="col-xl-3 col-lg-4 col-md-6">
                                <div className="services__item-two">
                                    <div className="services__icon-two">
                                        <i className="flaticon-pie-chart" />
                                    </div>
                                    <div className="services__content-two">
                                        <h2 className="title"><Link href="/services-details">Business Analytics</Link></h2>
                                        <p>Morem area are psum dolor sitteme odern sectet aweur adipiscing always.</p>
                                        <Link href="/services-details" className="btn">Read More</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6">
                                <div className="services__item-two">
                                    <div className="services__icon-two">
                                        <i className="flaticon-budget" />
                                    </div>
                                    <div className="services__content-two">
                                        <h2 className="title"><Link href="/services-details">Investment</Link></h2>
                                        <p>Morem area are psum dolor sitteme odern sectet aweur adipiscing always.</p>
                                        <Link href="/services-details" className="btn">Read More</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6">
                                <div className="services__item-two">
                                    <div className="services__icon-two">
                                        <i className="flaticon-piggy-bank" />
                                    </div>
                                    <div className="services__content-two">
                                        <h2 className="title"><Link href="/services-details">Tax Advisory</Link></h2>
                                        <p>Morem area are psum dolor sitteme odern sectet aweur adipiscing always.</p>
                                        <Link href="/services-details" className="btn">Read More</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6">
                                <div className="services__item-two">
                                    <div className="services__icon-two">
                                        <i className="flaticon-target" />
                                    </div>
                                    <div className="services__content-two">
                                        <h2 className="title"><Link href="/services-details">Target Market</Link></h2>
                                        <p>Morem area are psum dolor sitteme odern sectet aweur adipiscing always.</p>
                                        <Link href="/services-details" className="btn">Read More</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6">
                                <div className="services__item-two">
                                    <div className="services__icon-two">
                                        <i className="flaticon-financial-profit" />
                                    </div>
                                    <div className="services__content-two">
                                        <h2 className="title"><Link href="/services-details">Financial Growth</Link></h2>
                                        <p>Morem area are psum dolor sitteme odern sectet aweur adipiscing always.</p>
                                        <Link href="/services-details" className="btn">Read More</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6">
                                <div className="services__item-two">
                                    <div className="services__icon-two">
                                        <i className="flaticon-profit" />
                                    </div>
                                    <div className="services__content-two">
                                        <h2 className="title"><Link href="/services-details">Strategic marketing</Link></h2>
                                        <p>Morem area are psum dolor sitteme odern sectet aweur adipiscing always.</p>
                                        <Link href="/services-details" className="btn">Read More</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6">
                                <div className="services__item-two">
                                    <div className="services__icon-two">
                                        <i className="flaticon-report" />
                                    </div>
                                    <div className="services__content-two">
                                        <h2 className="title"><Link href="/services-details">Project Management</Link></h2>
                                        <p>Morem area are psum dolor sitteme odern sectet aweur adipiscing always.</p>
                                        <Link href="/services-details" className="btn">Read More</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-md-6">
                                <div className="services__item-two">
                                    <div className="services__icon-two">
                                        <i className="flaticon-light-bulb" />
                                    </div>
                                    <div className="services__content-two">
                                        <h2 className="title"><Link href="/services-details">Business Idea</Link></h2>
                                        <p>Morem area are psum dolor sitteme odern sectet aweur adipiscing always.</p>
                                        <Link href="/services-details" className="btn">Read More</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="services__shape-wrap">
                        <img src="/assets/img/images/h2_services_shape01.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                        <img src="/assets/img/images/h2_services_shape02.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                    </div>
                </section>
            </Layout>
        </>
    )
}
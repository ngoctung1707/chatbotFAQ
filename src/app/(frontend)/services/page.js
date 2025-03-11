import Layout from "@/components/layout/Layout"
import Link from "next/link"

export default function Services() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="All Services">
                <section className="services__area-five services__bg-five" data-background="/assets/img/bg/inner_services_bg02.jpg">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-6 col-lg-8">
                                <div className="section-title text-center mb-40">
                                    <span className="sub-title">WHAT WE OFFER</span>
                                    <h2 className="title">We Offer An Effective Wide Area Business solutions</h2>
                                </div>
                            </div>
                        </div>
                        <div className="services-item-wrap">
                            <div className="row justify-content-center">
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="services-item shine-animate-item">
                                        <div className="services-thumb">
                                            <Link href="/services-details" className="shine-animate"><img src="/assets/img/services/services_img01.jpg" alt="" /></Link>
                                        </div>
                                        <div className="services-content">
                                            <div className="icon">
                                                <i className="flaticon-profit" />
                                            </div>
                                            <h4 className="title"><Link href="/service-details">Strategic marketing</Link></h4>
                                            <p>Morem ipsum dolor sittemet consectetur adipiscing.</p>
                                            <Link href="/services-details" className="btn">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="services-item shine-animate-item">
                                        <div className="services-thumb">
                                            <Link href="/services-details" className="shine-animate"><img src="/assets/img/services/services_img02.jpg" alt="" /></Link>
                                        </div>
                                        <div className="services-content">
                                            <div className="icon">
                                                <i className="flaticon-investment-1" />
                                            </div>
                                            <h4 className="title"><Link href="/service-details">Investment Planning</Link></h4>
                                            <p>Morem ipsum dolor sittemet consectetur adipiscing.</p>
                                            <Link href="/services-details" className="btn">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="services-item shine-animate-item">
                                        <div className="services-thumb">
                                            <Link href="/services-details" className="shine-animate"><img src="/assets/img/services/services_img03.jpg" alt="" /></Link>
                                        </div>
                                        <div className="services-content">
                                            <div className="icon">
                                                <i className="flaticon-pie-chart" />
                                            </div>
                                            <h4 className="title"><Link href="/service-details">Insights  analytics</Link></h4>
                                            <p>Morem ipsum dolor sittemet consectetur adipiscing.</p>
                                            <Link href="/services-details" className="btn">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="services-item shine-animate-item">
                                        <div className="services-thumb">
                                            <Link href="/services-details" className="shine-animate"><img src="/assets/img/services/services_img04.jpg" alt="" /></Link>
                                        </div>
                                        <div className="services-content">
                                            <div className="icon">
                                                <i className="flaticon-light-bulb" />
                                            </div>
                                            <h4 className="title"><Link href="/service-details">Business consulting</Link></h4>
                                            <p>Morem ipsum dolor sittemet consectetur adipiscing.</p>
                                            <Link href="/services-details" className="btn">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="services-item shine-animate-item">
                                        <div className="services-thumb">
                                            <Link href="/services-details" className="shine-animate"><img src="/assets/img/services/services_img05.jpg" alt="" /></Link>
                                        </div>
                                        <div className="services-content">
                                            <div className="icon">
                                                <i className="flaticon-investment" />
                                            </div>
                                            <h4 className="title"><Link href="/service-details">Business Development</Link></h4>
                                            <p>Morem ipsum dolor sittemet consectetur adipiscing.</p>
                                            <Link href="/services-details" className="btn">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="services-item shine-animate-item">
                                        <div className="services-thumb">
                                            <Link href="/services-details" className="shine-animate"><img src="/assets/img/services/services_img06.jpg" alt="" /></Link>
                                        </div>
                                        <div className="services-content">
                                            <div className="icon">
                                                <i className="flaticon-piggy-bank" />
                                            </div>
                                            <h4 className="title"><Link href="/service-details">Tax Audit</Link></h4>
                                            <p>Morem ipsum dolor sittemet consectetur adipiscing.</p>
                                            <Link href="/services-details" className="btn">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="services-item shine-animate-item">
                                        <div className="services-thumb">
                                            <Link href="/services-details" className="shine-animate"><img src="/assets/img/services/services_img07.jpg" alt="" /></Link>
                                        </div>
                                        <div className="services-content">
                                            <div className="icon">
                                                <i className="flaticon-financial-profit" />
                                            </div>
                                            <h4 className="title"><Link href="/service-details">Financial Growth</Link></h4>
                                            <p>Morem ipsum dolor sittemet consectetur adipiscing.</p>
                                            <Link href="/services-details" className="btn">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="services-item shine-animate-item">
                                        <div className="services-thumb">
                                            <Link href="/services-details" className="shine-animate"><img src="/assets/img/services/services_img08.jpg" alt="" /></Link>
                                        </div>
                                        <div className="services-content">
                                            <div className="icon">
                                                <i className="flaticon-budget" />
                                            </div>
                                            <h4 className="title"><Link href="/service-details">Revenue Calculate</Link></h4>
                                            <p>Morem ipsum dolor sittemet consectetur adipiscing.</p>
                                            <Link href="/services-details" className="btn">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    )
}
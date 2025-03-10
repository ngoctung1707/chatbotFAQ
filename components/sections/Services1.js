import Link from 'next/link'

export default function Services1() {
    return (
        <>
            <section className="services-area services-bg" data-background="/assets/img/bg/services_bg.jpg">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-6 col-lg-8">
                            <div className="section-title text-center mb-40 tg-heading-subheading animation-style3">
                                <span className="sub-title">WHAT WE OFFER</span>
                                <h2 className="title tg-element-title">We Offer An Effective Wide Area Business solutions</h2>
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
                                        <h4 className="title"><Link href="/services-details">Strategic marketing</Link></h4>
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
                                        <h4 className="title"><Link href="/services-details">Investment Planning</Link></h4>
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
                                        <h4 className="title"><Link href="/services-details">Insights  analytics</Link></h4>
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
                                        <h4 className="title"><Link href="/services-details">Business consulting</Link></h4>
                                        <p>Morem ipsum dolor sittemet consectetur adipiscing.</p>
                                        <Link href="/services-details" className="btn">Read More</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="services-bottom-content">
                        <p>Empowering Businesses through Strategic Consulting With Us</p>
                        <Link href="/services" className="btn">See All Services</Link>
                    </div>
                </div>
            </section>
        </>
    )
}

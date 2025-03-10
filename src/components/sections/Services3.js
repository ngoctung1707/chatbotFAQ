import Link from 'next/link'

export default function Services3() {
    return (
        <>
            <section className="services__area-three services__bg-three" data-background="/assets/img/bg/h3_services_bg.jpg">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="section-title white-title text-center mb-50 tg-heading-subheading animation-style3">
                                <span className="sub-title">WHAT WE OFFER</span>
                                <h2 className="title tg-element-title">Let’s Discover Our Service Features Charter</h2>
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
                        <div className="col-lg-4 col-md-6">
                            <div className="services__item-three">
                                <div className="services__item-top">
                                    <div className="services__icon-three">
                                        <i className="flaticon-piggy-bank" />
                                    </div>
                                    <div className="services__top-title">
                                        <h2 className="title"><Link href="/services-details">Tax <br /> Advisory</Link></h2>
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
                                        <i className="flaticon-investment-1" />
                                    </div>
                                    <div className="services__top-title">
                                        <h2 className="title"><Link href="/services-details">Money <br /> Growth Method</Link></h2>
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
                                        <i className="flaticon-startup" />
                                    </div>
                                    <div className="services__top-title">
                                        <h2 className="title"><Link href="/services-details">Bootstrap <br /> Planning</Link></h2>
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
            </section>
        </>
    )
}

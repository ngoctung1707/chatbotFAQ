import Link from 'next/link'

export default function Choose3() {
    return (
        <>
            <section className="choose__area-three">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-lg-7 col-md-9 order-0 order-lg-2">
                            <div className="choose__img-wrap-three">
                                <div className="main-img">
                                    <img src="/assets/img/images/h3_choose_img01.jpg" alt="" />
                                    <Link href="#" className="play-btn"><i className="fas fa-play" /></Link>
                                </div>
                                <img src="/assets/img/images/h3_choose_img02.jpg" alt="" data-parallax="{&quot;y&quot; : 80 }" />
                                <div className="shape">
                                    <img src="/assets/img/images/h3_choose_img_shape.jpg" alt="" className="alltuchtopdown" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="choose__content-three">
                                <div className="section-title mb-25 tg-heading-subheading animation-style3">
                                    <span className="sub-title">Why We Are The Best</span>
                                    <h2 className="title tg-element-title">We Offer Business Insight World Class Consulting</h2>
                                </div>
                                <p>We successfully cope with tasks of varying complexity provide area longerty guarantees and regularly master new Practice Following gies heur portfolio includes.</p>
                                <div className="choose__list">
                                    <ul className="list-wrap">
                                        <li>
                                            <div className="choose__list-box">
                                                <div className="choose__list-icon">
                                                    <i className="flaticon-financial-profit" />
                                                </div>
                                                <div className="choose__list-content">
                                                    <h4 className="title">Finance Planning</h4>
                                                    <p>Agilos helps youcona doing <br /> tempor incididunt.</p>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="choose__list-box">
                                                <div className="choose__list-icon">
                                                    <i className="flaticon-report" />
                                                </div>
                                                <div className="choose__list-content">
                                                    <h4 className="title">Market Analysis</h4>
                                                    <p>Agilos helps youcona doing <br /> tempor incididunt.</p>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="choose__shape-wrap-three">
                    <img src="/assets/img/images/h3_choose_shape01.jpg" alt="" data-parallax="{&quot;x&quot; : 100 , &quot;y&quot; : -100 }" />
                    <img src="/assets/img/images/h3_choose_shape02.jpg" alt="" />
                </div>
            </section>
        </>
    )
}

import Link from 'next/link'

export default function About4() {
    return (
        <>
            <section className="about__area-six">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-lg-6 col-md-8">
                            <div className="about__img-wrap-six">
                                <img src="/assets/img/images/h4_about_img01.jpg" alt="" />
                                <img src="/assets/img/images/h4_about_img02.jpg" alt="" data-parallax="{&quot;x&quot; : 40}" />
                                <div className="experience__box-four">
                                    <h2 className="title">25</h2>
                                    <p>Years Experience <br /> in This Field</p>
                                </div>
                                <div className="shape">
                                    <img src="/assets/img/images/h4_about_img_shape.png" alt="" className="alltuchtopdown" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="about__content-six">
                                <div className="section-title mb-25 tg-heading-subheading animation-style3">
                                    <span className="sub-title">About Us</span>
                                    <h2 className="title tg-element-title">Insurance For The Better <br /> Family  Corporate Life</h2>
                                </div>
                                <p>We successfully cope with tasks of varying complexity provide area longerty guarantees and regularly master new Practice Following gies heur portfolio includes.</p>
                                <div className="about__content-inner-four">
                                    <div className="about__list-box">
                                        <ul className="list-wrap">
                                            <li><i className="flaticon-arrow-button" />Medicare Advantage Plans</li>
                                            <li><i className="flaticon-arrow-button" />Analysis  Research</li>
                                            <li><i className="flaticon-arrow-button" />100% Secure Money Back</li>
                                        </ul>
                                    </div>
                                    <div className="about__satisfied-box">
                                        <div className="icon">
                                            <i className="flaticon-trophy" />
                                        </div>
                                        <div className="content">
                                            <h2 className="title">98%</h2>
                                            <p>Clients Satisfied <br /> our Services</p>
                                        </div>
                                    </div>
                                </div>
                                <Link href="/about" className="btn btn-two">Read More</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="about__shape-wrap-four">
                    <img src="/assets/img/images/h4_about_shape01.png" alt="" />
                    <img src="/assets/img/images/h4_about_shape02.png" alt="" data-parallax="{&quot;x&quot; : -80 , &quot;y&quot; : -80 }" />
                </div>
            </section>
        </>
    )
}

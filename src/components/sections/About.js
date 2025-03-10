import Link from "next/link"


export default function About() {
    return (
        <>
            <section className="about__area-eight">
                <div className="container">
                    <div className="box-yellow-about">
                        <div className="row align-items-center justify-content-center">
                            <div className="col-lg-6 col-md-9 order-0 order-lg-2">
                                <div className="about__img-wrap-seven">
                                    <img src="/assets/img/home7/img-about.png" alt="" />
                                    <div className="about__award-box about__award-box-two2">
                                        <img src="/assets/img/images/about_list_img04.png" alt="" />
                                    </div>
                                    <div className="shape">
                                        <img src="/assets/img/images/h5_about_shape.png" alt="" className="ribbonRotate" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="about__content-seven">
                                    <div className="section-title mb-25">
                                        <span className="sub-title">ABOUT COMPANY</span>
                                        <h2 className="title wow">Business Growth Creativity Meet Our <span>Agency's Experts</span></h2>
                                    </div>
                                    <p>We successfully cope with tasks of varying complexity provide area longerty guarantees and regularly master.We successfully cope varying complexity provide area longerty guarantees.</p>
                                    <div className="about__content-inner-five">
                                        <div className="about__list-img-four">
                                            <div className="about__award-box about__award-box-two-rel">
                                                <div className="icon">
                                                    <i className="flaticon-trophy" />
                                                </div>
                                                <div className="content">
                                                    <h2 className="title">15+</h2>
                                                    <p>World Best Agency <br /> Award Got</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="about__list-box">
                                            <ul className="list-wrap">
                                                <li><i className="flaticon-arrow-button" />Medicare Advantage Plans</li>
                                                <li><i className="flaticon-arrow-button" />Analysis &amp; Research</li>
                                                <li><i className="flaticon-arrow-button" />100% Secure Money Back</li>
                                                <li><i className="flaticon-arrow-button" />100% Money Growth</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <Link href="/contact" className="btn btn-two">Contact With Us</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </ >
    )
}

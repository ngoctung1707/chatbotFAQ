import Link from "next/link"


export default function Team6() {
    return (
        <>
            <section className="our_team__area-six">
                <div className="container">
                    <div className="section-title mb-30 tg-heading-subheading animation-style3 text-center">
                        <span className="sub-title text-capitalize">Financial Experts</span>
                        <h2 className="title tg-element-title">Meet Our Amazing Team</h2>
                    </div>
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="card-team-area-six">
                                <div className="card-image">
                                    <img src="/assets/img/home6/team.png" />
                                    <Link href="#" className="btn-share"><img src="/assets/img/home6/share.svg" /></Link>
                                </div>
                                <div className="card-info">
                                    <div className="card-title">
                                        <Link href="/team-details">Ralph Edwards</Link>
                                        <p className="card-dept mt-10">Finance Advisor</p>
                                    </div>
                                    <div className="card-desc">
                                        Lorem ipsum dolor sit amet, adipiscing elit. Duis consectetur auctor elit vehicula onec conse tetur risus dignissim justo faubus pretium.
                                    </div>
                                    <div className="card-link">
                                        <Link href="#">Contact Me</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card-team-area-six">
                                <div className="card-image">
                                    <img src="/assets/img/home6/team2.png" />
                                    <Link href="#" className="btn-share"><img src="/assets/img/home6/share.svg" /></Link>
                                </div>
                                <div className="card-info">
                                    <div className="card-title">
                                        <Link href="/team-details">Ralph Edwards</Link>
                                        <p className="card-dept mt-10">Finance Advisor</p>
                                    </div>
                                    <div className="card-desc">
                                        Lorem ipsum dolor sit amet, adipiscing elit. Duis consectetur auctor elit vehicula onec conse tetur risus dignissim justo faubus pretium.
                                    </div>
                                    <div className="card-link">
                                        <Link href="#">Contact Me</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card-team-area-six">
                                <div className="card-image">
                                    <img src="/assets/img/home6/team3.png" />
                                    <Link href="#" className="btn-share"><img src="/assets/img/home6/share.svg" /></Link>
                                </div>
                                <div className="card-info">
                                    <div className="card-title">
                                        <Link href="/team-details">Ralph Edwards</Link>
                                        <p className="card-dept mt-10">Finance Advisor</p>
                                    </div>
                                    <div className="card-desc">
                                        Lorem ipsum dolor sit amet, adipiscing elit. Duis consectetur auctor elit vehicula onec conse tetur risus dignissim justo faubus pretium.
                                    </div>
                                    <div className="card-link">
                                        <Link href="#">Contact Me</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="card-team-area-six">
                                <div className="card-image">
                                    <img src="/assets/img/home6/team4.png" />
                                    <Link href="#" className="btn-share"><img src="/assets/img/home6/share.svg" /></Link>
                                </div>
                                <div className="card-info">
                                    <div className="card-title">
                                        <Link href="/team-details">Ralph Edwards</Link>
                                        <p className="card-dept mt-10">Finance Advisor</p>
                                    </div>
                                    <div className="card-desc">
                                        Lorem ipsum dolor sit amet, adipiscing elit. Duis consectetur auctor elit vehicula onec conse tetur risus dignissim justo faubus pretium.
                                    </div>
                                    <div className="card-link">
                                        <Link href="#">Contact Me</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <Link href="/contact" className="btn" data-aos="fade-up" data-aos-delay={600}>Contact Us</Link>
                    </div>
                </div>
            </section>

        </ >
    )
}

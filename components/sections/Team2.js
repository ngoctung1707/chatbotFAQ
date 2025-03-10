import Link from 'next/link'

export default function Team2() {
    return (
        <>
            <section className="team__area-two">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-6 col-lg-8">
                            <div className="section-title text-center mb-50 tg-heading-subheading animation-style3">
                                <span className="sub-title">MEET OUR TEAM</span>
                                <h2 className="title tg-element-title">Meet Our Specialized Team <br /> Of Experts</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center gutter-24">
                        <div className="col-lg-3 col-md-6 col-sm-8">
                            <div className="team__item-two shine-animate-item">
                                <div className="team__thumb-two shine-animate">
                                    <img src="/assets/img/team/team_img01.jpg" alt="" />
                                </div>
                                <div className="team__content-two">
                                    <h4 className="title"><Link href="/team-details">Jone Cooper</Link></h4>
                                    <span>Finance Advisor</span>
                                    <div className="team__social-two">
                                        <ul className="list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-8">
                            <div className="team__item-two shine-animate-item">
                                <div className="team__thumb-two shine-animate">
                                    <img src="/assets/img/team/team_img02.jpg" alt="" />
                                </div>
                                <div className="team__content-two">
                                    <h4 className="title"><Link href="/team-details">Ralph Edwards</Link></h4>
                                    <span>Finance Advisor</span>
                                    <div className="team__social-two">
                                        <ul className="list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-8">
                            <div className="team__item-two shine-animate-item">
                                <div className="team__thumb-two shine-animate">
                                    <img src="/assets/img/team/team_img03.jpg" alt="" />
                                </div>
                                <div className="team__content-two">
                                    <h4 className="title"><Link href="/team-details">Floyd Miles</Link></h4>
                                    <span>Finance Advisor</span>
                                    <div className="team__social-two">
                                        <ul className="list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-8">
                            <div className="team__item-two shine-animate-item">
                                <div className="team__thumb-two shine-animate">
                                    <img src="/assets/img/team/team_img04.jpg" alt="" />
                                </div>
                                <div className="team__content-two">
                                    <h4 className="title"><Link href="/team-details">Eleanor Pena</Link></h4>
                                    <span>Finance Advisor</span>
                                    <div className="team__social-two">
                                        <ul className="list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="team__shape">
                    <img src="/assets/img/team/team_shape01.png" alt="" data-parallax="{&quot;y&quot; : 100 }" />
                    <img src="/assets/img/team/team_shape02.png" alt="" className="alltuchtopdown" />
                </div>
            </section>
        </>
    )
}

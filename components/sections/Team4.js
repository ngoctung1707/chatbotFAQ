import Link from 'next/link'

export default function Team4() {
    return (
        <>
            <section className="team__area-four">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="section-title text-center mb-40 tg-heading-subheading animation-style3">
                                <span className="sub-title">MEET OUR TEAM</span>
                                <h2 className="title tg-element-title">Business Expertise Is Here <br /> For You Can Trust</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                            <div className="team__item-four shine-animate-item">
                                <div className="team__thumb-four shine-animate">
                                    <img src="/assets/img/team/h4_team_img01.jpg" alt="" />
                                </div>
                                <div className="team__content-four">
                                    <h2 className="title"><Link href="/team-details">Floyd Miles</Link></h2>
                                    <span>Finance Advisor</span>
                                    <div className="team__social-four">
                                        <ul className="list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                            <div className="team__item-four shine-animate-item">
                                <div className="team__thumb-four shine-animate">
                                    <img src="/assets/img/team/h4_team_img02.jpg" alt="" />
                                </div>
                                <div className="team__content-four">
                                    <h2 className="title"><Link href="/team-details">Ralph Edwards</Link></h2>
                                    <span>Finance Advisor</span>
                                    <div className="team__social-four">
                                        <ul className="list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                            <div className="team__item-four shine-animate-item">
                                <div className="team__thumb-four shine-animate">
                                    <img src="/assets/img/team/h4_team_img03.jpg" alt="" />
                                </div>
                                <div className="team__content-four">
                                    <h2 className="title"><Link href="/team-details">Eleanor Pena</Link></h2>
                                    <span>Finance Advisor</span>
                                    <div className="team__social-four">
                                        <ul className="list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                            <div className="team__item-four shine-animate-item">
                                <div className="team__thumb-four shine-animate">
                                    <img src="/assets/img/team/h4_team_img04.jpg" alt="" />
                                </div>
                                <div className="team__content-four">
                                    <h2 className="title"><Link href="/team-details">Jone Cooper</Link></h2>
                                    <span>Finance Advisor</span>
                                    <div className="team__social-four">
                                        <ul className="list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

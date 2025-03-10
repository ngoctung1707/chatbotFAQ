
import Link from 'next/link'
import SocialToggle from '../elements/SocialToggle'

export default function Team3() {
    return (
        <>
            <section className="team__area-three">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-7 col-lg-6">
                            <div className="section-title mb-50 tg-heading-subheading animation-style3">
                                <span className="sub-title">MEET OUR TEAM</span>
                                <h2 className="title tg-element-title">Financial Expertise You <br /> Can Trust</h2>
                            </div>
                        </div>
                        <div className="col-xl-5 col-lg-6">
                            <div className="section-content">
                                <p>Our power of choice is untrammelled and when nothing preven tsbeing able to do what we like best every pleasure.</p>
                            </div>
                        </div>
                    </div>
                    <div className="row gutter-24 justify-content-center">
                        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                            <div className="team__item-three shine-animate-item">
                                <div className="team__thumb-three shine-animate">
                                    <img src="/assets/img/team/h3_team_img01.jpg" alt="" />
                                </div>
                                <div className="team__content-three">
                                    <h4 className="title"><Link href="/team-details">Brooklyn Simmons</Link></h4>
                                    <span>Finance Advisor</span>
                                </div>
                                <div className="team-social team__social-three">
                                    <SocialToggle/>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                            <div className="team__item-three shine-animate-item">
                                <div className="team__thumb-three shine-animate">
                                    <img src="/assets/img/team/h3_team_img02.jpg" alt="" />
                                </div>
                                <div className="team__content-three">
                                    <h4 className="title"><Link href="/team-details">Eleanor Pena</Link></h4>
                                    <span>Finance Advisor</span>
                                </div>
                                <div className="team-social team__social-three">
                                    <SocialToggle/>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                            <div className="team__item-three shine-animate-item">
                                <div className="team__thumb-three shine-animate">
                                    <img src="/assets/img/team/h3_team_img03.jpg" alt="" />
                                </div>
                                <div className="team__content-three">
                                    <h4 className="title"><Link href="/team-details">Floyd Miles</Link></h4>
                                    <span>Finance Advisor</span>
                                </div>
                                <div className="team-social team__social-three">
                                    <SocialToggle/>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                            <div className="team__item-three shine-animate-item">
                                <div className="team__thumb-three shine-animate">
                                    <img src="/assets/img/team/h3_team_img04.jpg" alt="" />
                                </div>
                                <div className="team__content-three">
                                    <h4 className="title"><Link href="/team-details">Ralph Edwards</Link></h4>
                                    <span>Finance Advisor</span>
                                </div>
                                <div className="team-social team__social-three">
                                    <SocialToggle/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

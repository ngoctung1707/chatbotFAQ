import SocialToggle from "@/components/elements/SocialToggle"
import Layout from "@/components/layout/Layout"
import BrandActiveSlider from "@/components/slider/BrandActiveSlider"
import Link from "next/link"

export default function Team3() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Our Team Members">
                <div>
                    <section className="team__area-three">
                        <div className="container">
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
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                    <div className="team__item-three shine-animate-item">
                                        <div className="team__thumb-three shine-animate">
                                            <img src="/assets/img/team/h3_team_img05.jpg" alt="" />
                                        </div>
                                        <div className="team__content-three">
                                            <h4 className="title"><Link href="/team-details">Leo Makerony</Link></h4>
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
                                            <img src="/assets/img/team/h3_team_img06.jpg" alt="" />
                                        </div>
                                        <div className="team__content-three">
                                            <h4 className="title"><Link href="/team-details">Genny Akurea</Link></h4>
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
                                            <img src="/assets/img/team/h3_team_img07.jpg" alt="" />
                                        </div>
                                        <div className="team__content-three">
                                            <h4 className="title"><Link href="/team-details">Jone Cooper</Link></h4>
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
                                            <img src="/assets/img/team/h3_team_img08.jpg" alt="" />
                                        </div>
                                        <div className="team__content-three">
                                            <h4 className="title"><Link href="/team-details">Dalia Jororo</Link></h4>
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
                    {/* team-area-three */}
                    {/* brand-area */}
                    <div className="brand__area-six">
                        <div className="container">
                            <div className="swiper-container brand-active">
                            <BrandActiveSlider/>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}
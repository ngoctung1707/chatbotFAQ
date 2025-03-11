import SocialToggle from "@/components/elements/SocialToggle"
import Layout from "@/components/layout/Layout"
import BrandActiveSlider from "@/components/slider/BrandActiveSlider"
import Link from "next/link"

export default function Team() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Our Team Members">
                <div>
                    <section className="team-area pt-120 pb-90">
                        <div className="container">
                            <div className="team-item-wrap">
                                <div className="row justify-content-center">
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img01.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle/>
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Jone Cooper</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img02.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle/>
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Eleanor Pena</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img03.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle/>
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Floyd Miles</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img04.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle/>
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Ralph Edwards</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img05.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle/>
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Genny Akurea</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img06.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle/>
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Leo Makerony</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img07.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle/>
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Dalia Jororo</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8">
                                        <div className="team-item">
                                            <div className="team-thumb">
                                                <img src="/assets/img/team/team_img08.jpg" alt="" />
                                                <div className="team-social">
                                                    <SocialToggle/>
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <h4 className="title"><Link href="/team-details">Kaent Richard</Link></h4>
                                                <span>Finance Advisor</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* team-area-end */}
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
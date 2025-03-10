import VideoPopup from "@/components/elements/PopupVideo"
import Layout from "@/components/layout/Layout"
import BrandActiveSlider from "@/components/slider/BrandActiveSlider"
import Link from "next/link"

export default function ServicesDetails() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Service Details">
                <div>
                    <section className="services__details-area">
                        <div className="container">
                            <div className="services__details-wrap">
                                <div className="row">
                                    <div className="col-70 order-0 order-lg-2">
                                        <div className="services__details-thumb">
                                            <img src="/assets/img/services/services_details01.jpg" alt="" />
                                        </div>
                                        <div className="services__details-content">
                                            <h2 className="title">Modern Business Investment Planning</h2>
                                            <p>eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond the scope of our own expertise. That’s why we’ve developed close working relationships with a number of strategic partner.</p>
                                            <p>when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galley of type and scrambled it to make a type specimen book.</p>
                                            <div className="services__details-list">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="services__details-list-box">
                                                            <div className="icon">
                                                                <i className="flaticon-life-insurance" />
                                                            </div>
                                                            <div className="content">
                                                                <h4 className="title">Extend Coverage</h4>
                                                                <p>We successfully copey withtks arying mplexity aweprguara nd regularly master</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="services__details-list-box">
                                                            <div className="icon">
                                                                <i className="flaticon-insurance-agent" />
                                                            </div>
                                                            <div className="content">
                                                                <h4 className="title">Modern Insurance</h4>
                                                                <p>We successfully copey withtks arying mplexity aweprguara nd regularly master</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p>when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galley of type and scrambled it to make a type specimen book.</p>
                                            <div className="services__details-inner">
                                                <div className="row gutter-24 align-items-center">
                                                    <div className="col-44">
                                                        <div className="services__details-inner-img">
                                                            <img src="/assets/img/services/services_details_inner01.jpg" alt="" />
                                                            <VideoPopup />
                                                        </div>
                                                    </div>
                                                    <div className="col-56">
                                                        <div className="services__details-inner-content">
                                                            <h4 className="title">Raise capital faster  negotiate <br /> on your own terms</h4>
                                                            <p>when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries.</p>
                                                            <div className="about__list-box">
                                                                <ul className="list-wrap">
                                                                    <li><i className="flaticon-arrow-button" />Business Growth</li>
                                                                    <li><i className="flaticon-arrow-button" />Analysis  Research</li>
                                                                    <li><i className="flaticon-arrow-button" />100% Secure</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="last-info">when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galley of type and scrambled it to make a type specimen book.</p>
                                        </div>
                                    </div>
                                    <div className="col-30">
                                        <aside className="services__sidebar">
                                            <div className="sidebar__widget sidebar__widget-two">
                                                <div className="sidebar__cat-list-two">
                                                    <ul className="list-wrap">
                                                        <li><Link href="/services-details">Investment Planning <i className="flaticon-arrow-button" /></Link></li>
                                                        <li><Link href="/services-details">Strategic marketing <i className="flaticon-arrow-button" /></Link></li>
                                                        <li><Link href="/services-details">Insights  analytics <i className="flaticon-arrow-button" /></Link></li>
                                                        <li><Link href="/services-details">Business consulting <i className="flaticon-arrow-button" /></Link></li>
                                                        <li><Link href="/services-details">Financial Advisory <i className="flaticon-arrow-button" /></Link></li>
                                                        <li><Link href="/services-details">Market Research <i className="flaticon-arrow-button" /></Link></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="sidebar__widget">
                                                <h4 className="sidebar__widget-title">Brochure</h4>
                                                <div className="sidebar__brochure">
                                                    <p>when an unknown printer took ga lley offer typey anddey.</p>
                                                    <Link href="/assets/img/services/services_details01.jpg" target="_blank" download><i className="far fa-file-pdf" />PDF. Download</Link>
                                                    <Link href="/assets/img/services/services_details01.jpg" target="_blank" download><i className="far fa-file-alt" />DOC. Download</Link>
                                                </div>
                                            </div>
                                            <div className="sidebar__widget">
                                                <h4 className="sidebar__widget-title">Latest Posts</h4>
                                                <div className="sidebar__post-list">
                                                    <div className="sidebar__post-item">
                                                        <div className="sidebar__post-thumb">
                                                            <Link href="/blog-details"><img src="/assets/img/blog/sb_post01.jpg" alt="" /></Link>
                                                        </div>
                                                        <div className="sidebar__post-content">
                                                            <h5 className="title"><Link href="/blog-details">deno weuine easiure and praising</Link></h5>
                                                            <span className="date"><i className="flaticon-time" />Sep 15, 2024</span>
                                                        </div>
                                                    </div>
                                                    <div className="sidebar__post-item">
                                                        <div className="sidebar__post-thumb">
                                                            <Link href="/blog-details"><img src="/assets/img/blog/sb_post02.jpg" alt="" /></Link>
                                                        </div>
                                                        <div className="sidebar__post-content">
                                                            <h5 className="title"><Link href="/blog-details">know how to pursue pleasure rationally</Link></h5>
                                                            <span className="date"><i className="flaticon-time" />Sep 15, 2024</span>
                                                        </div>
                                                    </div>
                                                    <div className="sidebar__post-item">
                                                        <div className="sidebar__post-thumb">
                                                            <Link href="/blog-details"><img src="/assets/img/blog/sb_post03.jpg" alt="" /></Link>
                                                        </div>
                                                        <div className="sidebar__post-content">
                                                            <h5 className="title"><Link href="/blog-details">there anyone who loves</Link></h5>
                                                            <span className="date"><i className="flaticon-time" />Sep 15, 2024</span>
                                                        </div>
                                                    </div>
                                                    <div className="sidebar__post-item">
                                                        <div className="sidebar__post-thumb">
                                                            <Link href="/blog-details"><img src="/assets/img/blog/sb_post04.jpg" alt="" /></Link>
                                                        </div>
                                                        <div className="sidebar__post-content">
                                                            <h5 className="title"><Link href="/blog-details">deno weuine easiure and praising</Link></h5>
                                                            <span className="date"><i className="flaticon-time" />Sep 15, 2024</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sidebar__widget sidebar__widget-two">
                                                <div className="sidebar__contact">
                                                    <h2 className="title">If You Need Any Help Contact With Us</h2>
                                                    <Link href="tel:0123456789" className="btn"><i className="flaticon-phone-call" />+91 705 2101 786</Link>
                                                </div>
                                            </div>
                                        </aside>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* services-details-area-end */}
                    {/* brand-area */}
                    <div className="brand__area-six">
                        <div className="container">
                            <div className="swiper-container brand-active">
                                <BrandActiveSlider />
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}
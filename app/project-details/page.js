import Layout from "@/components/layout/Layout"
import Link from "next/link"

export default function ProjectDetails() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Project Details">
                <div>
                    <section className="project__details-area">
                        <div className="container">
                            <div className="project__details-wrap">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="project__details-top">
                                            <div className="row">
                                                <div className="col-70">
                                                    <div className="project__details-thumb">
                                                        <img src="/assets/img/project/project_details01.jpg" alt="" />
                                                    </div>
                                                </div>
                                                <div className="col-30">
                                                    <div className="project__details-info">
                                                        <h4 className="title">Project Details</h4>
                                                        <ul className="list-wrap">
                                                            <li><span>Category:</span>Business Consulting</li>
                                                            <li><span>Client:</span>Mack Straing</li>
                                                            <li><span>Location:</span>USA</li>
                                                            <li><span>Value:</span>$50K</li>
                                                            <li><span>Website:</span>www.apexa.com</li>
                                                            <li>
                                                                <span>Share:</span>
                                                                <ul className="list-wrap project-social">
                                                                    <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                                                    <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                                                    <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                                                    <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                                                </ul>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="project__details-content">
                                            <h2 className="title">Company Values  The Relationship</h2>
                                            <p>eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond the scope of our own expertise.when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only.</p>
                                            <p>when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galley of type and scrambled it to make a type specimen book.when an unknown.</p>
                                            <div className="project__details-inner">
                                                <div className="row align-items-center">
                                                    <div className="col-lg-6 order-0 order-lg-2">
                                                        <div className="project__details-inner-img">
                                                            <img src="/assets/img/project/project_details02.jpg" alt="" />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6">
                                                        <div className="project__details-inner-content">
                                                            <h2 className="title">Our Corporate Business Planning</h2>
                                                            <p>when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas survived not only five centuries.but also the leap into electronic typesetting, remaining.</p>
                                                            <div className="content-inner">
                                                                <div className="graph-img">
                                                                    <img src="/assets/img/project/graph.jpg" alt="" />
                                                                </div>
                                                                <div className="about__list-box">
                                                                    <ul className="list-wrap">
                                                                        <li><i className="flaticon-arrow-button" />Medicare Advantage Plans</li>
                                                                        <li><i className="flaticon-arrow-button" />Analysis  Research</li>
                                                                        <li><i className="flaticon-arrow-button" />100% Secure Money Back</li>
                                                                        <li><i className="flaticon-arrow-button" />100% Money Growth</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                            <p className="last-info">when an unknown printer took a galley of type and scrambled it to make  specimen bookhas survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galley of type and scrambled specimen book.when an unknown.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* project-details-area-end */}
                    {/* call-back-area */}
                    <section className="call-back-area">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="call-back-content">
                                        <div className="section-title white-title mb-10">
                                            <h2 className="title">Request A Call Back</h2>
                                        </div>
                                        <p>Ever find yourself staring at your computer screen a good consulting slogan to come to mind? Oftentimes.</p>
                                        <div className="shape">
                                            <img src="/assets/img/images/call_back_shape.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="call-back-form">
                                        <form action="#">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-grp">
                                                        <input type="text" placeholder="Name *" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-grp">
                                                        <input type="email" placeholder="E-mail *" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-grp">
                                                        <input type="number" placeholder="Phone *" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <button type="submit" className="btn">Send Now</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

            </Layout>
        </>
    )
}
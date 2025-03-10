import Layout from "@/components/layout/Layout"
import BrandActiveSlider from "@/components/slider/BrandActiveSlider"
import Link from "next/link"

export default function TeamDetails() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Team Details">
                <div>
                    <section className="team__details-area">
                        <div className="container">
                            <div className="team__details-inner">
                                <div className="row align-items-center">
                                    <div className="col-36">
                                        <div className="team__details-img">
                                            <img src="/assets/img/team/team_details_img.jpg" alt="" />
                                        </div>
                                    </div>
                                    <div className="col-64">
                                        <div className="team__details-content">
                                            <h2 className="title">Marker Stephen</h2>
                                            <span className="position">Finance Advisor</span>
                                            <p>eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof there are occasions when our clients areaneed specia.eed a little help from our friends from time to time. Although we offer the one-stop onvenience of annery integrated of legal, financial services under one roofthere.</p>
                                            <div className="team__details-info">
                                                <ul className="list-wrap">
                                                    <li>
                                                        <i className="flaticon-phone-call" />
                                                        <Link href="tel:0123456789">+123 8989 444</Link>
                                                    </li>
                                                    <li>
                                                        <i className="flaticon-mail" />
                                                        <Link href="mailto:info@gmail.com">info@gmail.com</Link>
                                                    </li>
                                                    <li>
                                                        <i className="flaticon-pin" />
                                                        256 Avenue, Mark Street, Newyork City
                                                    </li>
                                                    <li>
                                                        <i className="fas fa-share-alt" />
                                                        <ul className="list-wrap team__details-social">
                                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                                            <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                                            <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                                            <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* team-details-area-end */}
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
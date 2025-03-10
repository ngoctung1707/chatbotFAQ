import Link from "next/link"
import CounterUp from "../elements/CounterUp"
import VideoPopup from "../elements/PopupVideo"


export default function About9() {
    return (
        <div>
            <section className="about__area-four">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-lg-6 mb-35">
                            <div className="about__content-four">
                                <div className="section-title mb-30">
                                    <span className="sub-title">Innovate</span>
                                    <h2 className="title">Transforming Businesses with Cutting-Edge IT Solutions</h2>
                                </div>
                                <p>Our company is a leader in the IT industry, providing innovative solutions that drive
                                    business growth and success. With our expertise and cutting-edge technology, we help
                                    businesses transform their operations and stay ahead of the competition.</p>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <h5 className="count"><CounterUp count={120} /><span className="d-inline-block align-middle">%</span></h5>
                                        <p>Our company offers a seamless process for businesses to engage with our IT
                                            services</p>
                                    </div>
                                    <div className="col-sm-6">
                                        <h5 className="count"><CounterUp count={150} /><span className="d-inline-block align-middle">%</span></h5>
                                        <p>We provide customized IT solutions that perfectly align with your business
                                            requirements and goals.</p>
                                    </div>
                                </div>
                                <div className="services-bottom-content justify-content-start">
                                    <Link href="/services" className="btn btn-two">Read More</Link>
                                    <Link href="/contact" className="link-gray">Contact Us for a Quote</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-9 col-sm-10 text-end mb-35">
                            <div className="about__img-wrap3-home8">
                                <img src="assets/img/home8/img-innovate.png" alt="" />
                                <VideoPopup style={2} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}

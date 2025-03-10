import Link from "next/link"


export default function About8() {
    return (
        <div>
            <section className="about__area-four">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-lg-6 col-md-9 col-sm-10 text-center text-lg-start mb-35">
                            <div className="about__img-wrap2-home8">
                                <div className="text-25-years">
                                    <span className="text-stroke-2">25</span>
                                    <h4 className="text-experience">Years Experiences<br /> in this field</h4>
                                </div>
                                <img src="assets/img/home8/img-transform.png" alt="" />
                                <div className="shape">
                                    <img src="assets/img/home8/dot-square2.png" alt="" className="alltuchtopdown" />
                                </div>
                                <div className="shape-2">
                                    <img src="assets/img/home8/service-icon.png" alt="" className="alltuchtopdown" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-35">
                            <div className="about__content-four">
                                <div className="section-title mb-30">
                                    <span className="sub-title">Transform</span>
                                    <h2 className="title">Streamline Your IT Operations with Us</h2>
                                </div>
                                <p>Our IT services ensure your business operates smoothly, with enhanced productivity and
                                    robust cybersecurity measures.</p>
                                <div className="row">
                                    <div className="col-sm-6">
                                        <h5>Improved Efficiency</h5>
                                        <p>Our solutions optimize your workflows, saving time and resources.</p>
                                    </div>
                                    <div className="col-sm-6">
                                        <h5>Enhanced Security</h5>
                                        <p>Protect your sensitive data and prevent cyber threats with our advanced measures.
                                        </p>
                                    </div>
                                </div>
                                <Link href="/services" className="btn btn-two">Read More</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}

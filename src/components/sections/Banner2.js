import Link from 'next/link'

export default function Banner2() {
    return (
        <>
            <section className="banner__area-two banner__bg-two" data-background="/assets/img/banner/h3_banner_bg.jpg">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="banner__content-two">
                                <h2 className="title" data-aos="fade-up" data-aos-delay={100}>Dynamic solutions that <span>power high</span> growth startups</h2>
                                <p data-aos="fade-up" data-aos-delay={300}>Agilos helps you to convert your data into a strategic asset and get business insights Agilos helps you to convert.</p>
                                <Link href="/contact" className="btn border-btn" data-aos="fade-up" data-aos-delay={600}>Get Started</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="banner-social banner-social-two">
                    <h5 className="title">Follow us</h5>
                    <ul className="list-wrap">
                        <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                        <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                        <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                        <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                        <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                    </ul>
                </div>
                <div className="banner__shape-two">
                    <img src="/assets/img/banner/h3_banner_shape01.png" alt="" className="heartbeat" />
                </div>
            </section>
        </>
    )
}

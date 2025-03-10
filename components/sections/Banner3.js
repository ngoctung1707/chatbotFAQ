import Link from 'next/link'

export default function Banner3() {
    return (
        <>
            <section className="banner__area-three banner__bg-three" data-background="/assets/img/banner/h4_banner_bg.jpg">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-5 col-lg-6">
                            <div className="banner__content-three">
                                <span className="sub-title" data-aos="fade-up" data-aos-delay={100}>100% Trusted Insurance Comapny</span>
                                <h2 className="title" data-aos="fade-up" data-aos-delay={300}>Find The Best health insurance plans for the whole family</h2>
                                <Link href="/about" className="btn" data-aos="fade-up" data-aos-delay={600}>Choose your Plan</Link>
                            </div>
                        </div>
                        <div className="col-xl-7 col-lg-6">
                            <div className="banner__img">
                                <img src="/assets/img/banner/h4_banner_img.png" alt="" data-aos="fade-left" data-aos-delay={800} />
                            </div>
                        </div>
                    </div>
                    <div className="banner-social banner-social-three">
                        <h5 className="title">Follow us</h5>
                        <ul className="list-wrap">
                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                            <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                            <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                            <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
    )
}

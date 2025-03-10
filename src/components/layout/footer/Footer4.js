import Link from "next/link"

export default function Footer4() {
    return (
        <>
            <footer>
                <div className="footer__area-four">
                    <div className="container">
                        <div className="footer__top-three footer__top-four">
                            <div className="row">
                                <div className="col-xl-4 col-lg-5 col-md-6">
                                    <div className="footer-widget">
                                        <div className="fw-logo mb-25">
                                            <Link href="/"><img src="/assets/img/logo/w_logo.png" alt="" /></Link>
                                        </div>
                                        <div className="footer-info-list mb-25">
                                            <ul className="list-wrap">
                                                <li>
                                                    <div className="icon">
                                                        <i className="flaticon-phone-call" />
                                                    </div>
                                                    <div className="content">
                                                        <Link href="tel:0123456789">+123 888 9999</Link>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="icon">
                                                        <i className="flaticon-envelope" />
                                                    </div>
                                                    <div className="content">
                                                        <Link href="mailto:info@apexa.com">info@apexa.com</Link>
                                                    </div>
                                                </li>
                                                <li>
                                                    <div className="icon">
                                                        <i className="flaticon-pin" />
                                                    </div>
                                                    <div className="content">
                                                        <p>Sydney Harbour Bridge Circular City of Sydney, Australia.</p>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="footer__social-three">
                                            <ul className="list-wrap">
                                                <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                                <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                                <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                                <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                                <li><Link href="#"><i className="fab fa-youtube" /></Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-3 col-md-6 col-sm-6">
                                    <div className="footer-widget">
                                        <h4 className="fw-title">Information</h4>
                                        <div className="footer-link-list">
                                            <ul className="list-wrap">
                                                <li><Link href="/about">Information</Link></li>
                                                <li><Link href="/about">About us</Link></li>
                                                <li><Link href="/team">Meet our team</Link></li>
                                                <li><Link href="/contact">Case Studies</Link></li>
                                                <li><Link href="/blog">Latest news</Link></li>
                                                <li><Link href="/contact">Contact us</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                                    <div className="footer-widget">
                                        <h4 className="fw-title">Top Links</h4>
                                        <div className="footer-link-list">
                                            <ul className="list-wrap">
                                                <li><Link href="/about">How it’s Work</Link></li>
                                                <li><Link href="/contact">Partners</Link></li>
                                                <li><Link href="/contact">Testimonials</Link></li>
                                                <li><Link href="/contact">Case Studies</Link></li>
                                                <li><Link href="/contact">Pricing</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-3 col-lg-4 col-md-6">
                                    <div className="footer-widget">
                                        <h4 className="fw-title">Instagram Posts</h4>
                                        <div className="footer-instagram">
                                            <ul className="list-wrap">
                                                <li><Link href="#"><img src="/assets/img/images/footer_insta01.jpg" alt="" /></Link></li>
                                                <li><Link href="#"><img src="/assets/img/images/footer_insta02.jpg" alt="" /></Link></li>
                                                <li><Link href="#"><img src="/assets/img/images/footer_insta03.jpg" alt="" /></Link></li>
                                                <li><Link href="#"><img src="/assets/img/images/footer_insta04.jpg" alt="" /></Link></li>
                                                <li><Link href="#"><img src="/assets/img/images/footer_insta05.jpg" alt="" /></Link></li>
                                                <li><Link href="#"><img src="/assets/img/images/footer_insta06.jpg" alt="" /></Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="footer__bottom-four">
                            <div className="container">
                                <div className="row align-items-center">
                                    <div className="col-lg-8">
                                        <div className="footer__newsletter-four">
                                            <h4 className="title">Subscribe Newsletter</h4>
                                            <form action="#">
                                                <input type="text" placeholder="e-mail Type . . ." />
                                                <button className="btn" type="submit">Subscribe</button>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="col-lg-4">
                                        <div className="copyright-text">
                                            <p>Copyright © <Link href="/">Apexa</Link> | All Right Reserved</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer-shape-two">
                        <img src="/assets/img/images/h4_footer_shape.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                    </div>
                </div>
            </footer>
        </>
    )
}

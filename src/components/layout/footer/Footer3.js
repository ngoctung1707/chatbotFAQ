import Link from "next/link"

export default function Footer3() {
    return (
        <>
            <footer>
                <div className="footer__area-three">
                    <div className="footer__top-three">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-5 col-md-8">
                                    <div className="footer-widget">
                                        <div className="footer__newsletter-three">
                                            <h2 className="title">Never Miss out on a Moment <br /> Apexa us</h2>
                                            <form action="#">
                                                <input type="email" placeholder="e-mail Type . . ." />
                                                <button className="btn" type="submit">Subscribe</button>
                                            </form>
                                        </div>
                                        <div className="footer__social-three">
                                            <span className="title">Follow Us on:</span>
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
                                <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                                    <div className="footer-widget">
                                        <h4 className="fw-title">Information</h4>
                                        <div className="footer-link-list">
                                            <ul className="list-wrap">
                                                <li><Link href="/about">Information</Link></li>
                                                <li><Link href="/about">About us</Link></li>
                                                <li><Link href="/team">Meet our team</Link></li>
                                                <li><Link href="/contact">Case stories</Link></li>
                                                <li><Link href="/blog">Latest news</Link></li>
                                                <li><Link href="/contact">Contact us</Link></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-4 col-sm-6 col-sm-6">
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
                                        <h4 className="fw-title">Location</h4>
                                        <div className="footer-info-list">
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer__bottom-three">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <div className="fw-logo">
                                        <Link href="/"><img src="/assets/img/logo/w_logo.png" alt="" /></Link>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="copyright-text">
                                        <p>Copyright © <Link href="/">Apexa</Link> | All Right Reserved</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

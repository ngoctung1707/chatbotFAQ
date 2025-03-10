import Link from 'next/link'
export default function About1() {
    return (
        <>
            <section id="about" className="about-area pt-120 pb-120">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="about-img-wrap">
                                <div className="mask-img-wrap">
                                    <img src="/assets/img/images/about_img01.jpg" alt="" />
                                </div>
                                <div className="shape">
                                    <img src="/assets/img/images/about_shape01.png" alt="" />
                                </div>
                                <div className="experience-year">
                                    <div className="icon">
                                        <i className="flaticon-trophy" />
                                    </div>
                                    <div className="content">
                                        <div className="text-badge">
                                            <h6 className="circle rotateme text-circle">
                                                <span>2</span>
                                                <span>5</span>
                                                <span>-</span>
                                                <span>Y</span>
                                                <span>e</span>
                                                <span>a</span>
                                                <span>r</span>
                                                <span>O</span>
                                                <span>f</span>
                                                <span>E</span>
                                                <span>x</span>
                                                <span>p</span>
                                                <span>e</span>
                                                <span>r</span>
                                                <span>i</span>
                                                <span>e</span>
                                                <span>n</span>
                                                <span>c</span>
                                                <span>e</span>
                                                <span>-</span>
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="about-content">
                                <div className="section-title mb-35 tg-heading-subheading animation-style3">
                                    <span className="sub-title">Simply Know About</span>
                                    <h2 className="title tg-element-title">We Help Organizations To <br /> Make Ultimate Businesses Growth Success.</h2>
                                </div>
                                <div className="about-list">
                                    <ul className="list-wrap">
                                        <li>
                                            <div className="icon">
                                                <i className="flaticon-target" />
                                            </div>
                                            <div className="content">
                                                <h4 className="title">Business Solutions</h4>
                                                <p>Semper egetuis tellus urna condi</p>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="icon">
                                                <i className="flaticon-profit" />
                                            </div>
                                            <div className="content">
                                                <h4 className="title">Quality Services</h4>
                                                <p>Semper egetuis tellus urna condi</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <p>We successfully cope with tasks of varying complexityprovide longerty term guarantees and regularly master new Practice Area technol ogiesOur portfolio includes dozen</p>
                                <div className="about-bottom">
                                    <div className="author-wrap">
                                        <div className="thumb">
                                            <img src="/assets/img/images/author_img.png" alt="" />
                                        </div>
                                        <div className="content">
                                            <img src="/assets/img/images/sign.png" alt="" />
                                            <h4 className="title">Martinaze <span>, CEO</span></h4>
                                        </div>
                                    </div>
                                    <Link href="/about" className="btn btn-two">Read More</Link>
                                </div>
                                <div className="about-shape-wrap">
                                    <img src="/assets/img/images/about_shape03.png" alt="" />
                                    <img src="/assets/img/images/about_shape04.png" alt="" className="ribbonRotate" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="about-left-shape">
                    <img src="/assets/img/images/about_shape02.png" alt="" />
                </div>
            </section>
        </>
    )
}

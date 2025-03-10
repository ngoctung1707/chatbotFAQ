import Link from 'next/link'

export default function BlogPost1() {
    return (
        <>
            <section className="blog-post-area blog-post-bg" data-background="/assets/img/bg/blog_post_bg.jpg">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-6">
                            <div className="section-title text-center mb-40 tg-heading-subheading animation-style3">
                                <span className="sub-title">OUR BLOG UPDATE</span>
                                <h2 className="title tg-element-title">Featured News And Insights</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-xl-4 col-lg-6 col-md-10">
                            <div className="blog-post-item shine-animate-item">
                                <div className="blog-post-thumb">
                                    <Link href="/blog-details" className="shine-animate"><img src="/assets/img/blog/blog_post01.jpg" alt="" /></Link>
                                    <Link href="/blog" className="post-tag">Business</Link>
                                </div>
                                <div className="blog-post-content">
                                    <h2 className="title"><Link href="/blog-details">Marketing your are business downturn now a days</Link></h2>
                                    <div className="blog-avatar">
                                        <div className="avatar-thumb">
                                            <img src="/assets/img/blog/blog_avatar01.png" alt="" />
                                        </div>
                                        <div className="avatar-content">
                                            <p>By <Link href="/blog-details">Doman Smith</Link></p>
                                        </div>
                                    </div>
                                    <div className="blog-post-meta">
                                        <ul className="list-wrap">
                                            <li>
                                                <Link href="/blog-details" className="btn">Read More</Link>
                                            </li>
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6 col-md-10">
                            <div className="blog-post-item shine-animate-item">
                                <div className="blog-post-thumb">
                                    <Link href="/blog-details" className="shine-animate"><img src="/assets/img/blog/blog_post02.jpg" alt="" /></Link>
                                    <Link href="/blog" className="post-tag">Audit</Link>
                                </div>
                                <div className="blog-post-content">
                                    <h2 className="title"><Link href="/blog-details">Marketing your are business downturn now a days</Link></h2>
                                    <div className="blog-avatar">
                                        <div className="avatar-thumb">
                                            <img src="/assets/img/blog/blog_avatar01.png" alt="" />
                                        </div>
                                        <div className="avatar-content">
                                            <p>By <Link href="/blog-details">Doman Smith</Link></p>
                                        </div>
                                    </div>
                                    <div className="blog-post-meta">
                                        <ul className="list-wrap">
                                            <li>
                                                <Link href="/blog-details" className="btn">Read More</Link>
                                            </li>
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6 col-md-10">
                            <div className="blog-post-item shine-animate-item">
                                <div className="blog-post-thumb">
                                    <Link href="/blog-details" className="shine-animate"><img src="/assets/img/blog/blog_post03.jpg" alt="" /></Link>
                                    <Link href="/blog" className="post-tag">Investment</Link>
                                </div>
                                <div className="blog-post-content">
                                    <h2 className="title"><Link href="/blog-details">Marketing your are business downturn now a days</Link></h2>
                                    <div className="blog-avatar">
                                        <div className="avatar-thumb">
                                            <img src="/assets/img/blog/blog_avatar01.png" alt="" />
                                        </div>
                                        <div className="avatar-content">
                                            <p>By <Link href="/blog-details">Doman Smith</Link></p>
                                        </div>
                                    </div>
                                    <div className="blog-post-meta">
                                        <ul className="list-wrap">
                                            <li>
                                                <Link href="/blog-details" className="btn">Read More</Link>
                                            </li>
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="blog-shape-wrap">
                    <img src="/assets/img/images/blog_shape01.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                    <img src="/assets/img/images/blog_shape02.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                </div>
            </section>
        </>
    )
}

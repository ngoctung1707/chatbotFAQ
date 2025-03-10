import Link from 'next/link'

export default function BlogPost3() {
    return (
        <>
            <section className="blog__post-area-two blog__post-area-three blog__post-bg-two" data-background="/assets/img/bg/blog_post_bg.jpg">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-6">
                            <div className="section-title text-center mb-50 tg-heading-subheading animation-style3">
                                <span className="sub-title">OUR BLOG UPDATE</span>
                                <h2 className="title tg-element-title">Featured News And Insights</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-lg-4 col-md-6">
                            <div className="blog__post-two">
                                <div className="blog__post-thumb-two">
                                    <Link href="/blog-details"><img src="/assets/img/blog/h2_blog_post01.jpg" alt="" /></Link>
                                </div>
                                <div className="blog__post-content-two">
                                    <div className="blog-post-meta">
                                        <ul className="list-wrap">
                                            <li>
                                                <Link href="/blog" className="blog__post-tag-two">Business</Link>
                                            </li>
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                        </ul>
                                    </div>
                                    <h2 className="title"><Link href="/blog-details">Marketing your area business downturn now a days</Link></h2>
                                    <div className="blog-avatar">
                                        <div className="avatar-thumb">
                                            <img src="/assets/img/blog/blog_avatar01.png" alt="" />
                                        </div>
                                        <div className="avatar-content">
                                            <p>By <Link href="/blog-details">Doman Smith</Link></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="blog__post-two">
                                <div className="blog__post-thumb-two">
                                    <Link href="/blog-details"><img src="/assets/img/blog/h2_blog_post02.jpg" alt="" /></Link>
                                </div>
                                <div className="blog__post-content-two">
                                    <div className="blog-post-meta">
                                        <ul className="list-wrap">
                                            <li>
                                                <Link href="/blog" className="blog__post-tag-two">Audit</Link>
                                            </li>
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                        </ul>
                                    </div>
                                    <h2 className="title"><Link href="/blog-details">Improving The Double Diamond Design Process</Link></h2>
                                    <div className="blog-avatar">
                                        <div className="avatar-thumb">
                                            <img src="/assets/img/blog/blog_avatar01.png" alt="" />
                                        </div>
                                        <div className="avatar-content">
                                            <p>By <Link href="/blog-details">Doman Smith</Link></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="blog__post-two">
                                <div className="blog__post-thumb-two">
                                    <Link href="/blog-details"><img src="/assets/img/blog/h2_blog_post03.jpg" alt="" /></Link>
                                </div>
                                <div className="blog__post-content-two">
                                    <div className="blog-post-meta">
                                        <ul className="list-wrap">
                                            <li>
                                                <Link href="/blog" className="blog__post-tag-two">Investment</Link>
                                            </li>
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                        </ul>
                                    </div>
                                    <h2 className="title"><Link href="/blog-details">Revealing Images With CSS Mask Animations</Link></h2>
                                    <div className="blog-avatar">
                                        <div className="avatar-thumb">
                                            <img src="/assets/img/blog/blog_avatar01.png" alt="" />
                                        </div>
                                        <div className="avatar-content">
                                            <p>By <Link href="/blog-details">Doman Smith</Link></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="blog-shape-wrap">
                    <img src="/assets/img/images/h3_blog_shape01.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                    <img src="/assets/img/images/h3_blog_shape02.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                </div>
            </section>
        </>
    )
}

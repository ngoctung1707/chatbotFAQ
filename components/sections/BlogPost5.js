import Link from 'next/link'

export default function BlogPost5() {
    return (
        <>
            <section className="blog__post-area-five">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-6">
                            <div className="section-title text-center mb-50 tg-heading-subheading animation-style3">
                                <span className="sub-title">OUR BLOG UPDATE</span>
                                <h2 className="title tg-element-title">Featured News And Insights</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row gutter-24 justify-content-center">
                        <div className="col-lg-4 col-md-6">
                            <div className="blog__post-four shine-animate-item">
                                <div className="blog__post-thumb-four">
                                    <Link href="/blog-details" className="shine-animate"><img src="/assets/img/blog/h5_blog_post01.jpg" alt="" /></Link>
                                </div>
                                <div className="blog__post-content-four">
                                    <Link href="/blog" className="blog__post-tag-three">Business</Link>
                                    <h2 className="title"><Link href="/blog-details">Marketing your area business downturn now a days</Link></h2>
                                    <div className="blog-post-meta blog-post-meta-two">
                                        <ul className="list-wrap">
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                            <li><i className="far fa-comment-alt" /><Link href="/blog-details">02 Comments</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="blog__post-four shine-animate-item">
                                <div className="blog__post-thumb-four">
                                    <Link href="/blog-details" className="shine-animate"><img src="/assets/img/blog/h5_blog_post02.jpg" alt="" /></Link>
                                </div>
                                <div className="blog__post-content-four">
                                    <Link href="/blog" className="blog__post-tag-three">Business</Link>
                                    <h2 className="title"><Link href="/blog-details">Marketing your area business downturn now a days</Link></h2>
                                    <div className="blog-post-meta blog-post-meta-two">
                                        <ul className="list-wrap">
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                            <li><i className="far fa-comment-alt" /><Link href="/blog-details">02 Comments</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="blog__post-four shine-animate-item">
                                <div className="blog__post-thumb-four">
                                    <Link href="/blog-details" className="shine-animate"><img src="/assets/img/blog/h5_blog_post03.jpg" alt="" /></Link>
                                </div>
                                <div className="blog__post-content-four">
                                    <Link href="/blog" className="blog__post-tag-three">Business</Link>
                                    <h2 className="title"><Link href="/blog-details">Marketing your area business downturn now a days</Link></h2>
                                    <div className="blog-post-meta blog-post-meta-two">
                                        <ul className="list-wrap">
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                            <li><i className="far fa-comment-alt" /><Link href="/blog-details">02 Comments</Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="blog-shape-wrap">
                    <img src="/assets/img/images/h5_blog_shape01.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                    <img src="/assets/img/images/h5_blog_shape02.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                </div>
            </section>
        </>
    )
}

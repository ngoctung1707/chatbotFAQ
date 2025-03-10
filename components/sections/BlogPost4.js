import Link from 'next/link'

export default function BlogPost4() {
    return (
        <>
            <section className="blog__post-area-four">
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
                        <div className="col-xl-4 col-lg-6 col-md-10">
                            <div className="blog-post-item blog__post-three shine-animate-item">
                                <div className="blog-post-thumb blog__post-thumb-three">
                                    <Link href="/blog-details" className="shine-animate"><img src="/assets/img/blog/blog_post01.jpg" alt="" /></Link>
                                </div>
                                <div className="blog-post-content blog__post-content-three">
                                    <Link href="/blog" className="post-tag">Business</Link>
                                    <h2 className="title"><Link href="/blog-details">Marketing your are business downturn now a days</Link></h2>
                                    <div className="blog-post-meta mb-20">
                                        <ul className="list-wrap">
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                        </ul>
                                    </div>
                                    <Link href="/blog-details" className="btn">Continue Reading</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6 col-md-10">
                            <div className="blog-post-item blog__post-three shine-animate-item">
                                <div className="blog-post-thumb blog__post-thumb-three">
                                    <Link href="/blog-details" className="shine-animate"><img src="/assets/img/blog/blog_post02.jpg" alt="" /></Link>
                                </div>
                                <div className="blog-post-content blog__post-content-three">
                                    <Link href="/blog" className="post-tag">Audit</Link>
                                    <h2 className="title"><Link href="/blog-details">Marketing your are business downturn now a days</Link></h2>
                                    <div className="blog-post-meta mb-20">
                                        <ul className="list-wrap">
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                        </ul>
                                    </div>
                                    <Link href="/blog-details" className="btn">Continue Reading</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6 col-md-10">
                            <div className="blog-post-item blog__post-three shine-animate-item">
                                <div className="blog-post-thumb blog__post-thumb-three">
                                    <Link href="/blog-details" className="shine-animate"><img src="/assets/img/blog/blog_post03.jpg" alt="" /></Link>
                                </div>
                                <div className="blog-post-content blog__post-content-three">
                                    <Link href="/blog" className="post-tag">Investment</Link>
                                    <h2 className="title"><Link href="/blog-details">Marketing your are business downturn now a days</Link></h2>
                                    <div className="blog-post-meta mb-20">
                                        <ul className="list-wrap">
                                            <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                        </ul>
                                    </div>
                                    <Link href="/blog-details" className="btn">Continue Reading</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

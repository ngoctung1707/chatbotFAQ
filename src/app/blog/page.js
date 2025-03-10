
import BlogPost from "@/components/blog/BlogPost"
import Layout from "@/components/layout/Layout"
import Link from "next/link"

export default function Blog() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="All Blogs">
                <div>
                    <section className="blog__area">
                        <div className="container">
                            <div className="blog__inner-wrap">
                                <div className="row">
                                    <div className="col-70">
                                        <div className="blog-post-wrap">
                                            <div className="row gutter-24">
                                                <BlogPost showItem={6} style={1} showPagination />
                                            </div>

                                        </div>
                                    </div>
                                    <div className="col-30">
                                        <aside className="blog__sidebar">
                                            <div className="sidebar__widget sidebar__widget-two">
                                                <div className="sidebar__search">
                                                    <form action="#">
                                                        <input type="text" placeholder="Search . . ." />
                                                        <button type="submit">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
                                                                <path d="M19.0002 19.0002L14.6572 14.6572M14.6572 14.6572C15.4001 13.9143 15.9894 13.0324 16.3914 12.0618C16.7935 11.0911 17.0004 10.0508 17.0004 9.00021C17.0004 7.9496 16.7935 6.90929 16.3914 5.93866C15.9894 4.96803 15.4001 4.08609 14.6572 3.34321C13.9143 2.60032 13.0324 2.01103 12.0618 1.60898C11.0911 1.20693 10.0508 1 9.00021 1C7.9496 1 6.90929 1.20693 5.93866 1.60898C4.96803 2.01103 4.08609 2.60032 3.34321 3.34321C1.84288 4.84354 1 6.87842 1 9.00021C1 11.122 1.84288 13.1569 3.34321 14.6572C4.84354 16.1575 6.87842 17.0004 9.00021 17.0004C11.122 17.0004 13.1569 16.1575 14.6572 14.6572Z" stroke="currentcolor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                            <div className="sidebar__widget">
                                                <h4 className="sidebar__widget-title">Categories</h4>
                                                <div className="sidebar__cat-list">
                                                    <ul className="list-wrap">
                                                        <li>
                                                            <Link href="#"><i className="flaticon-arrow-button" />Business Solution (15)</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="#"><i className="flaticon-arrow-button" />Marketing Planning (11)</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="#"><i className="flaticon-arrow-button" />SEO Consulting (05)</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="#"><i className="flaticon-arrow-button" />Project Management (07)</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="#"><i className="flaticon-arrow-button" />Business Development (04)</Link>
                                                        </li>
                                                        <li>
                                                            <Link href="#"><i className="flaticon-arrow-button" />Marketing Plan (22)</Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="sidebar__widget">
                                                <h4 className="sidebar__widget-title">Latest Posts</h4>
                                                <div className="sidebar__post-list">
                                                    <div className="sidebar__post-item">
                                                        <div className="sidebar__post-thumb">
                                                            <Link href="/blog-details"><img src="/assets/img/blog/sb_post01.jpg" alt="" /></Link>
                                                        </div>
                                                        <div className="sidebar__post-content">
                                                            <h5 className="title"><Link href="/blog-details">deno weuine easiure and praising</Link></h5>
                                                            <span className="date"><i className="flaticon-time" />Sep 15, 2024</span>
                                                        </div>
                                                    </div>
                                                    <div className="sidebar__post-item">
                                                        <div className="sidebar__post-thumb">
                                                            <Link href="/blog-details"><img src="/assets/img/blog/sb_post02.jpg" alt="" /></Link>
                                                        </div>
                                                        <div className="sidebar__post-content">
                                                            <h5 className="title"><Link href="/blog-details">know how to pursue pleasure rationally</Link></h5>
                                                            <span className="date"><i className="flaticon-time" />Sep 15, 2024</span>
                                                        </div>
                                                    </div>
                                                    <div className="sidebar__post-item">
                                                        <div className="sidebar__post-thumb">
                                                            <Link href="/blog-details"><img src="/assets/img/blog/sb_post03.jpg" alt="" /></Link>
                                                        </div>
                                                        <div className="sidebar__post-content">
                                                            <h5 className="title"><Link href="/blog-details">there anyone who loves</Link></h5>
                                                            <span className="date"><i className="flaticon-time" />Sep 15, 2024</span>
                                                        </div>
                                                    </div>
                                                    <div className="sidebar__post-item">
                                                        <div className="sidebar__post-thumb">
                                                            <Link href="/blog-details"><img src="/assets/img/blog/sb_post04.jpg" alt="" /></Link>
                                                        </div>
                                                        <div className="sidebar__post-content">
                                                            <h5 className="title"><Link href="/blog-details">deno weuine easiure and praising</Link></h5>
                                                            <span className="date"><i className="flaticon-time" />Sep 15, 2024</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sidebar__widget">
                                                <h4 className="sidebar__widget-title">Tags</h4>
                                                <div className="sidebar__tag-list">
                                                    <ul className="list-wrap">
                                                        <li><Link href="#">Finance</Link></li>
                                                        <li><Link href="#">Data</Link></li>
                                                        <li><Link href="#">Agency</Link></li>
                                                        <li><Link href="#">Business</Link></li>
                                                        <li><Link href="#">Corporate</Link></li>
                                                        <li><Link href="#">Development</Link></li>
                                                        <li><Link href="#">Consultancy</Link></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </aside>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* blog-area-end */}
                    {/* call-back-area */}
                    <section className="call-back-area">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="call-back-content">
                                        <div className="section-title white-title mb-10">
                                            <h2 className="title">Request A Call Back</h2>
                                        </div>
                                        <p>Ever find yourself staring at your computer screen a good consulting slogan to come to mind? Oftentimes.</p>
                                        <div className="shape">
                                            <img src="/assets/img/images/call_back_shape.png" alt="" data-aos="fade-right" data-aos-delay={400} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="call-back-form">
                                        <form action="#">
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-grp">
                                                        <input type="text" placeholder="Name *" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-grp">
                                                        <input type="email" placeholder="E-mail *" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-grp">
                                                        <input type="number" placeholder="Phone *" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <button type="submit" className="btn">Send Now</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

            </Layout>
        </>
    )
}
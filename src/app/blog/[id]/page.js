'use client'
import Layout from "@/components/layout/Layout"
import VideoPopup from "@/components/elements/PopupVideo"
import data from "@/util/blog.json"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function BlogDetails() {
    let Router = useParams()
    const [blogPost, setBlogPost] = useState(null)
    const id = Router.id

    useEffect(() => {
        setBlogPost(data.find((data) => data.id == id))
    }, [id])

    return (
        <>
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Blog Details">
                {blogPost && (
                    <>
                        <div>
                            <section className="blog__details-area">
                                <div className="container">
                                    <div className="blog__inner-wrap">
                                        <div className="row">
                                            <div className="col-70">
                                                <div className="blog__details-wrap">
                                                    <div className="blog__details-thumb">
                                                        <img src={`/assets/img/blog/${blogPost.img}`} className="w-100" alt="" />
                                                    </div>
                                                    <div className="blog__details-content">
                                                        <h2 className="title">{blogPost.title}</h2>
                                                        <div className="blog-post-meta">
                                                            <ul className="list-wrap">
                                                                <li><Link href="/blog" className="blog__post-tag-two">Business</Link></li>
                                                                <li>
                                                                    <div className="blog-avatar">
                                                                        <div className="avatar-thumb">
                                                                            <img src="/assets/img/blog/blog_avatar01.png" alt="" />
                                                                        </div>
                                                                        <div className="avatar-content">
                                                                            <p>By <Link href="/blog-details">Doman Smith</Link></p>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                                <li><i className="fas fa-calendar-alt" />Oct 21, 2024</li>
                                                                <li><i className="far fa-comment" /><Link href="/blog-details">05 Comments</Link></li>
                                                            </ul>
                                                        </div>
                                                        <p>when an unknown printer took ar galley offer type year anddey scrambled  make type aewer specimen book bethas survived not only five when annery unknown printer.eed a little help from our friends from time to time. Although we offer the one-stop convenience.</p>
                                                        <p>eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof.eed a little help from our friends from time to time. Although we offer the one-stop convenience.</p>
                                                        <blockquote>
                                                            <p>“ urabitur varius eros rutrum consequat Mauris aewa sollicitudin enim condimentum luctus enim justo non molestie nisl ”</p>
                                                        </blockquote>
                                                        <h4 className="title-two">Speed Optimized</h4>
                                                        <p>when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas a not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galley of type and scrambled it to make a type specimen book.</p>
                                                        <div className="blog__details-inner">
                                                            <div className="row align-items-center">
                                                                <div className="col-46 order-0 order-lg-2">
                                                                    <div className="blog__details-inner-thumb">
                                                                        <img src="/assets/img/blog/blog_details02.jpg" alt="" />
                                                                        <VideoPopup/>
                                                                    </div>
                                                                </div>
                                                                <div className="col-54">
                                                                    <div className="blog__details-inner-content">
                                                                        <h4 className="title">Conduct replied off whether arrived adapted</h4>
                                                                        <p>when an unknown printer took a galley  type remaining essentially unchan galley of type and scrambled it to make a type specimen book.</p>
                                                                        <div className="about__list-box">
                                                                            <ul className="list-wrap">
                                                                                <li><i className="flaticon-arrow-button" />Medicare Advantage Plans</li>
                                                                                <li><i className="flaticon-arrow-button" />Analysis  Research</li>
                                                                                <li><i className="flaticon-arrow-button" />100% Secure Money Back</li>
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p>when an unknown printer took a galley of type and scrambled it to make a type specimen bookhas a not only five centuries, but also the leap into electronic typesetting, remaining essentially unchan galley of type and scrambled it to make a type specimen book.</p>
                                                        <div className="blog__details-bottom">
                                                            <div className="row align-items-center">
                                                                <div className="col-md-7">
                                                                    <div className="post-tags">
                                                                        <h5 className="title">Tags:</h5>
                                                                        <ul className="list-wrap">
                                                                            <li><Link href="#">Finance</Link></li>
                                                                            <li><Link href="#">Data</Link></li>
                                                                            <li><Link href="#">Agency</Link></li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-5">
                                                                    <div className="post-share">
                                                                        <h5 className="title">Share:</h5>
                                                                        <ul className="list-wrap">
                                                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                                                            <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                                                            <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="blog__avatar-wrap mb-60">
                                                        <div className="blog__avatar-img">
                                                            <Link href="#"><img src="/assets/img/blog/blog_avatar01.png" alt="img" /></Link>
                                                        </div>
                                                        <div className="blog__avatar-info">
                                                            <span className="designation">Author</span>
                                                            <h4 className="name"><Link href="#">Parker Willy</Link></h4>
                                                            <p>Finanappreciate your trust greatly Our clients choose dentace ducts because kn
                                                                ow we are the best area Awaitingare really.</p>
                                                        </div>
                                                    </div>
                                                    <div className="comments-wrap">
                                                        <h3 className="comments-wrap-title">02 Comments</h3>
                                                        <div className="latest-comments">
                                                            <ul className="list-wrap">
                                                                <li>
                                                                    <div className="comments-box">
                                                                        <div className="comments-avatar">
                                                                            <img src="/assets/img/blog/comment01.png" alt="img" />
                                                                        </div>
                                                                        <div className="comments-text">
                                                                            <div className="avatar-name">
                                                                                <h6 className="name">Jessica Rose</h6>
                                                                                <span className="date">December 27, 2024</span>
                                                                            </div>
                                                                            <p>Finanappreciate your trust greatly Our clients choose dentace ducts because know we are the best area Awaitingare really.</p>
                                                                            <Link href="#" className="reply-btn">Reply</Link>
                                                                        </div>
                                                                    </div>
                                                                    <ul className="children">
                                                                        <li>
                                                                            <div className="comments-box">
                                                                                <div className="comments-avatar">
                                                                                    <img src="/assets/img/blog/comment02.png" alt="img" />
                                                                                </div>
                                                                                <div className="comments-text">
                                                                                    <div className="avatar-name">
                                                                                        <h6 className="name">Parker Willy</h6>
                                                                                        <span className="date">December 28, 2024</span>
                                                                                    </div>
                                                                                    <p>Finanappreciate your trust greatly Our clients choose dentace ducts because know we are the best area Awaitingare really.</p>
                                                                                    <Link href="#" className="reply-btn">Reply</Link>
                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    </ul>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div className="comment-respond">
                                                        <h3 className="comment-reply-title">Post a comment</h3>
                                                        <form action="#" className="comment-form">
                                                            <p className="comment-notes">Your email address will not be published. Required fields are marked *</p>
                                                            <div className="form-grp">
                                                                <textarea name="comment" placeholder="Comment" />
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-md-4">
                                                                    <div className="form-grp">
                                                                        <input type="text" placeholder="Name" />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-grp">
                                                                        <input type="email" placeholder="Email" />
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <div className="form-grp">
                                                                        <input type="url" placeholder="Website" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="form-grp checkbox-grp">
                                                                <input type="checkbox" id="checkbox" />
                                                                <label htmlFor="checkbox">Save my name, email, and website in this browser for the next time I comment.</label>
                                                            </div>
                                                            <button type="submit" className="btn">Submit Post</button>
                                                        </form>
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
                            {/* blog-details-area-end */}
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
                    </>
                )}
            </Layout>
        </>
    )
}
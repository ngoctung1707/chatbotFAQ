import Link from "next/link"

export default function BlogCard1({ item }) {
    return (
        <>
            <div className="col-md-6">
                <div className="blog__post-two shine-animate-item">
                    <div className="blog__post-thumb-two">
                        <Link href={`/blog/${item.id}`} className="shine-animate">
                            <img src={`/assets/img/blog/${item.img}`} alt="" />
                            </Link>
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
                        <h2 className="title"><Link href={`/blog/${item.id}`}>{item.title}</Link></h2>
                        <div className="blog-avatar">
                            <div className="avatar-thumb">
                                <img src="/assets/img/blog/blog_avatar01.png" alt="" />
                            </div>
                            <div className="avatar-content">
                                <p>By <Link href={`/blog/${item.id}`}>Doman Smith</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

import Link from "next/link"

export default function Breadcrumb({ breadcrumbTitle }) {
    return (
        <>
            <section className="breadcrumb__area breadcrumb__bg" data-background="/assets/img/bg/breadcrumb_bg.jpg">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="breadcrumb__content">
                                <h2 className="title">{breadcrumbTitle}</h2>
                                <nav aria-label="breadcrumb">
                                    <ol className="breadcrumb">
                                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                                        <li className="breadcrumb-item active" aria-current="page">{breadcrumbTitle}</li>
                                    </ol>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="breadcrumb__shape">
                    <img src="/assets/img/images/breadcrumb_shape01.png" alt="" />
                    <img src="/assets/img/images/breadcrumb_shape02.png" alt="" className="rightToLeft" />
                    <img src="/assets/img/images/breadcrumb_shape03.png" alt="" />
                    <img src="/assets/img/images/breadcrumb_shape04.png" alt="" />
                    <img src="/assets/img/images/breadcrumb_shape05.png" alt="" className="alltuchtopdown" />
                </div>
            </section>
        </>
    )
}

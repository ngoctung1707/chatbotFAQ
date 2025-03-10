
import Link from 'next/link'

export default function Features2() {
    return (
        <>
            <section className="features__area-two">
                <div className="container">
                    <div className="row gutter-24 justify-content-center">
                        <div className="col-lg-4 col-md-6">
                            <div className="features__item-two">
                                <div className="features__icon-two">
                                    <i className="flaticon-life-insurance" />
                                </div>
                                <div className="features__content-two">
                                    <h4 className="title"><Link href="/services-details">Extend Coverage</Link></h4>
                                    <p>We successfully cope withtks arying mplexity aweprguara nd regularly master</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="features__item-two">
                                <div className="features__icon-two">
                                    <i className="flaticon-insurance-agent" />
                                </div>
                                <div className="features__content-two">
                                    <h4 className="title"><Link href="/services-details">Modern Insurance</Link></h4>
                                    <p>We successfully cope withtks arying mplexity aweprguara nd regularly master</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="features__item-two">
                                <div className="features__icon-two">
                                    <i className="flaticon-handshake" />
                                </div>
                                <div className="features__content-two">
                                    <h4 className="title"><Link href="/services-details">Hassle Less Process</Link></h4>
                                    <p>We successfully cope withtks arying mplexity aweprguara nd regularly master</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

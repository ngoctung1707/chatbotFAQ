export default function Callback1() {
    return (
        <>
            <section className="call-back-area">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="call-back-content">
                                <div className="section-title white-title mb-10 tg-heading-subheading animation-style3">
                                    <h2 className="title tg-element-title">Request A Call Back</h2>
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
        </>
    )
}

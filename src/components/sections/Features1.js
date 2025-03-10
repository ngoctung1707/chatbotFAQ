import Link from 'next/link'

export default function Features1() {
    return (
        <>
            <section className="features__area">
                <div className="container-fluid p-0">
                    <div className="features__item-wrap">
                        <div className="row g-0">
                            <div className="col-lg-3 col-md-6">
                                <div className="features__item">
                                    <div className="features__icon">
                                        <i className="flaticon-financial-profit" />
                                    </div>
                                    <div className="features__content">
                                        <h4 className="title"><Link href="/services-details">Finance Planning</Link></h4>
                                        <p>Agilos helps youcona doing <br /> tempor incididunt.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6">
                                <div className="features__item">
                                    <div className="features__icon">
                                        <i className="flaticon-light-bulb" />
                                    </div>
                                    <div className="features__content">
                                        <h4 className="title"><Link href="/services-details">Strategic Idea</Link></h4>
                                        <p>Agilos helps youcona doing <br /> tempor incididunt.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6">
                                <div className="features__item">
                                    <div className="features__icon">
                                        <i className="flaticon-target" />
                                    </div>
                                    <div className="features__content">
                                        <h4 className="title"><Link href="/services-details">Business Goal</Link></h4>
                                        <p>Agilos helps youcona doing <br /> tempor incididunt.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6">
                                <div className="features__item">
                                    <div className="features__icon">
                                        <i className="flaticon-profit" />
                                    </div>
                                    <div className="features__content">
                                        <h4 className="title"><Link href="/services-details">Marketing Growth</Link></h4>
                                        <p>Agilos helps youcona doing <br /> tempor incididunt.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

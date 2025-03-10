import CounterUp from "../elements/CounterUp"

export default function Counter3() {
    return (
        <>
            <section className="counter-area-three">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-3 col-lg-4 col-sm-6">
                            <div className="counter-item">
                                <div className="icon">
                                    <i className="flaticon-trophy" />
                                </div>
                                <div className="content">
                                    <h2 className="count"><CounterUp count={45} />+</h2>
                                    <p>Successfully <br /> Completed Projects</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-sm-6">
                            <div className="counter-item">
                                <div className="icon">
                                    <i className="flaticon-time" />
                                </div>
                                <div className="content">
                                    <h2 className="count"><CounterUp count={25} />+</h2>
                                    <p>Years of Experiences <br /> To Run This Company</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-sm-6">
                            <div className="counter-item">
                                <div className="icon">
                                    <i className="flaticon-happy" />
                                </div>
                                <div className="content">
                                    <h2 className="count"><CounterUp count={92} />K</h2>
                                    <p>Satisfied <br /> 100% Our Clients</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-sm-6">
                            <div className="counter-item">
                                <div className="icon">
                                    <i className="flaticon-china" />
                                </div>
                                <div className="content">
                                    <h2 className="count"><CounterUp count={19} />+</h2>
                                    <p>All Over The World <br /> We Are Available</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

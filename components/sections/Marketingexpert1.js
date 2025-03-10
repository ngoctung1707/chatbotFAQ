import VideoPopup from "../elements/PopupVideo"


export default function Marketingexpert1() {
    return (
        <>
            <section className="marketing_expert__area_six">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-5 mb-30">
                            <h1 className="title mb-15">Want to talk to a marketing expert?</h1>
                            <p className="mb-45">We successfully cope with tasks of varying complexity provide area longerty guarantees and regularly master.</p>
                            <div className="about__list-box mb-35">
                                <ul className="list-wrap">
                                    <li><i className="flaticon-arrow-button" />Medicare Advantage Plans</li>
                                    <li><i className="flaticon-arrow-button" />Analysis &amp; Research</li>
                                    <li><i className="flaticon-arrow-button" />100% Secure Money Back</li>
                                </ul>
                            </div>
                            <a href="#" className="btn btn-two">Read More</a>
                        </div>
                        <div className="col-lg-7 mb-30 position-relative">
                            <img src="/assets/img/home6/icon-square.svg" className="shape-top-right" />
                            <div className="box-video">
                                <img src="/assets/img/home6/img-marketing.png" />
                                <VideoPopup style={1}/>
                            </div>
                        </div>
                    </div>
                    <div className="box-video-small">
                        <div className="item-video-small">
                            <div className="video-small-left">
                                <div className="video-small-left-inner">
                                    <div className="video-small-left-1">
                                        <h3>40+</h3>
                                        <p>Consulting farm</p>
                                    </div>
                                    <div className="video-small-left-2">
                                        <h2>Trusted , Happy &amp; Satisfied Businesses</h2>
                                        <p>When you work with HR Solutions, you get the best. We provide adaptable solutions that allow you to be.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="video-small-right">
                                <div className="box-video">
                                    <img src="/assets/img/home6/img-video.png" />
                                    <VideoPopup style={1}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </ >
    )
}

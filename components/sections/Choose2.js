'use client'
import { useState } from "react"

export default function Choose2() {
    const [activeIndex, setActiveIndex] = useState(1);
    const handleOnClick = (index) => {
        setActiveIndex(index);
    };
    return (
        <>
            <section className="choose__area-two">
                <div className="choose__bg" data-background="/assets/img/bg/choose_bg.jpg" />
                <div className="container">
                    <div className="row justify-content-end">
                        <div className="col-lg-8 col-md-10">
                            <div className="choose__content-two">
                                <div className="section-title mb-20 tg-heading-subheading animation-style3">
                                    <span className="sub-title">Why Choose Our Services</span>
                                    <h2 className="title tg-element-title">Where your financial dreams become reality</h2>
                                </div>
                                <p>We successfully cope with tasks of varying complexity provide area longerty guarantees and regularly master new Practice Following gies heur portfolio includes guarantees and regularly dozen.</p>
                                <div className="choose__tab">
                                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                                        <li className="nav-item"  onClick={() => handleOnClick (1)}>
                                            <button className={activeIndex == 1 ? "nav-link active" : "nav-link"} id="goal-tab" data-bs-toggle="tab" data-bs-target="#goal-tab-pane" type="button" role="tab" aria-controls="goal-tab-pane" aria-selected="true">Focus On Goal</button>
                                        </li>
                                        <li className="nav-item"  onClick={() => handleOnClick (2)}>
                                            <button className={activeIndex == 2 ? "nav-link active" : "nav-link"} id="management-tab" data-bs-toggle="tab" data-bs-target="#management-tab-pane" type="button" role="tab" aria-controls="management-tab-pane" aria-selected="false">Risk Management</button>
                                        </li>
                                    </ul>
                                    <div className="tab-content" id="myTabContent">
                                        <div className={activeIndex == 1 ? "tab-pane fade show active" : "tab-pane fade"} id="goal-tab-pane" role="tabpanel" aria-labelledby="goal-tab" tabIndex={0}>
                                            <div className="choose__tab-content">
                                                <p>longerty  successfully cope with tasks of varying complexity provide area guarantees and regularly master new Practice.</p>
                                                <ul className="list-wrap">
                                                    <li><i className="fas fa-check" />Best For IT Consulting</li>
                                                    <li><i className="fas fa-check" />Our Vision, Our Mission</li>
                                                    <li><i className="fas fa-check" />Save Money  Time</li>
                                                    <li><i className="fas fa-check" />100% Satisfaction</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className={activeIndex == 2 ? "tab-pane fade show active" : "tab-pane fade"} id="management-tab-pane" role="tabpanel" aria-labelledby="management-tab" tabIndex={0}>
                                            <div className="choose__tab-content">
                                                <p>longerty  successfully cope with tasks of varying complexity provide area guarantees and regularly master new Practice.</p>
                                                <ul className="list-wrap">
                                                    <li><i className="fas fa-check" />Save Money  Time</li>
                                                    <li><i className="fas fa-check" />100% Satisfaction</li>
                                                    <li><i className="fas fa-check" />Best For IT Consulting</li>
                                                    <li><i className="fas fa-check" />Our Vision, Our Mission</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="operating__box">
                                    <div className="icon">
                                        <i className="fas fa-globe" />
                                    </div>
                                    <div className="content">
                                        <p>Since 1991 operating <br /> in the world</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="choose__shape-wrap-two">
                    <img src="/assets/img/images/h2_choose_shape01.png" alt="" data-parallax="{&quot;x&quot; : -80 , &quot;y&quot; : 80 , &quot;rotateZ&quot;:80}" />
                    <img src="/assets/img/images/h2_choose_shape02.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                </div>
            </section>
        </>
    )
}

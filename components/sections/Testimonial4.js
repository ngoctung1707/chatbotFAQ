import RangeSliderInput from '../elements/RangeSliderInput'
import TestimonialActiveTwoSlider from "../slider/TestimonialActiveTwoSlider"

export default function Testimonial4() {
    return (
        <>
            <section className="testimonial__area-three">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="testimonial__form">
                                <h2 className="title">Get a Quote</h2>
                                <form action="#">
                                    <div className="form-grp">
                                        <input type="text" placeholder="Full Name" />
                                    </div>
                                    <div className="form-grp">
                                        <input type="email" placeholder="E-mail" />
                                    </div>
                                    <div className="form-grp select-grp">
                                        <select name="orderby" className="orderby">
                                            <option value="Select Insurance Service">Select Insurance Service</option>
                                            <option value="Health Insurance">Health Insurance</option>
                                            <option value="Travel Insurance">Travel Insurance</option>
                                            <option value="Vehicle Insurance">Vehicle Insurance</option>
                                            <option value="Cargo Insurance">Cargo Insurance</option>
                                            <option value="Fire Insurance">Fire Insurance</option>
                                            <option value="Bike Insurance">Bike Insurance</option>
                                        </select>
                                    </div>
                                    <div className="range-slider-wrap">
                                        <RangeSliderInput />
                                    </div>
                                    <button type="submit" className="btn">Request a Quote</button>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="testimonial__wrap">
                                <div className="swiper-container testimonial-active-three">
                                    <TestimonialActiveTwoSlider />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="testimonial__shape-three">
                    <img src="/assets/img/images/h4_testimonial_shape.png" alt="" className="rotateme" />
                </div>
            </section>
        </>
    )
}

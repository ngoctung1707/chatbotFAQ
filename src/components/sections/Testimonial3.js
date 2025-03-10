import TestimonialActiveTwoSlider from "../slider/TestimonialActiveTwoSlider"

export default function Testimonial3() {
    return (
        <>
            <section className="testimonial__area-three testimonial__bg" data-background="/assets/img/bg/h3_testimonial_bg.jpg">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-lg-5 col-md-8">
                            <div className="testimonial__img-wrap-two">
                                <img src="/assets/img/images/h3_testimonial_img.png" alt="" />
                                <div className="testimonial__img-shape-two">
                                    <img src="/assets/img/images/h3_testimonial_shape01.png" alt="" className="alltuchtopdown" />
                                    <img src="/assets/img/images/h3_testimonial_shape02.png" alt="" className="rotateme" />
                                    <img src="/assets/img/images/h3_testimonial_shape03.png" alt="" />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="testimonial__item-wrap">
                                <div className="swiper-container testimonial-active-two">
                                <TestimonialActiveTwoSlider/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

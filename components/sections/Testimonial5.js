import TestimonialActiveTwoSlider from "../slider/TestimonialActiveTwoSlider";

export default function Testimonial5() {
    return (
        <>
            <section className="testimonial__area-four testimonial__bg testimonial__bg-two" data-background="/assets/img/bg/h3_testimonial_bg.jpg">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-lg-5 col-md-8">
                            <div className="testimonial__img-wrap-two">
                                <img src="/assets/img/images/inner_testimonial_img.png" alt="" />
                                <div className="testimonial__img-shape-two">
                                    <img src="/assets/img/images/h3_testimonial_shape01.png" alt="" className="alltuchtopdown" />
                                    <img src="/assets/img/images/inner_testimonial_shape.png" alt="" className="rotateme" />
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

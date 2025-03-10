'use client'
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions1 = {
    modules: [Autoplay, Pagination, Navigation],
    spaceBetween: 0,
    slidesPerView: 4,

};
const swiperOptions2 = {
    modules: [Autoplay, Pagination, Navigation],
    spaceBetween: 0,
    loop: true,
    autoplay: {
        delay: 6000,
    },
    thumbs: {
        swiper: swiperOptions1,
    },
    // And if we need scrollbar
    scrollbar: {
        el: ".swiper-scrollbar",
        draggable: !0,
    },

};

export default function Testimonial1() {
    return (
        <>
            <section className="testimonial-area">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-lg-6 order-0 order-lg-2">
                            <div className="swiper-container testimonial-active">
                                <Swiper {...swiperOptions2}>
                                    <SwiperSlide>
                                        <div className="testimonial-item">
                                            <div className="testimonial-info">
                                                <h4 className="title">Mr.Robey Alexa</h4>
                                                <span>CEO, Apexa Agency</span>
                                            </div>
                                            <div className="testimonial__rating">
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                            </div>
                                            <div className="testimonial-content">
                                                <p>“ Morem ipsum dolor sit amet, consectetur adipisc awing elita florai sum dolor sit amet, consectetur area Borem ipsum dolor sit amet, consectetur.”</p>
                                                <div className="icon"><i className="fas fa-quote-right" /></div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="testimonial-item">
                                            <div className="testimonial-info">
                                                <h4 className="title">Mr.Robey Alexa</h4>
                                                <span>CEO, Apexa Agency</span>
                                            </div>
                                            <div className="testimonial__rating">
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                            </div>
                                            <div className="testimonial-content">
                                                <p>“ Morem ipsum dolor sit amet, consectetur adipisc awing elita florai sum dolor sit amet, consectetur area Borem ipsum dolor sit amet, consectetur.”</p>
                                                <div className="icon"><i className="fas fa-quote-right" /></div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="testimonial-item">
                                            <div className="testimonial-info">
                                                <h4 className="title">Mr.Robey Alexa</h4>
                                                <span>CEO, Apexa Agency</span>
                                            </div>
                                            <div className="testimonial__rating">
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                            </div>
                                            <div className="testimonial-content">
                                                <p>“ Morem ipsum dolor sit amet, consectetur adipisc awing elita florai sum dolor sit amet, consectetur area Borem ipsum dolor sit amet, consectetur.”</p>
                                                <div className="icon"><i className="fas fa-quote-right" /></div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="testimonial-item">
                                            <div className="testimonial-info">
                                                <h4 className="title">Mr.Robey Alexa</h4>
                                                <span>CEO, Apexa Agency</span>
                                            </div>
                                            <div className="testimonial__rating">
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                            </div>
                                            <div className="testimonial-content">
                                                <p>“ Morem ipsum dolor sit amet, consectetur adipisc awing elita florai sum dolor sit amet, consectetur area Borem ipsum dolor sit amet, consectetur.”</p>
                                                <div className="icon"><i className="fas fa-quote-right" /></div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                </Swiper>
                            </div>
                            <div className="testimonial-slider-dot">
                                <div className="swiper testimonial-nav">
                                    <Swiper {...swiperOptions1} className="swiper-wrapper">
                                        <SwiperSlide>
                                            <button><img src="/assets/img/images/testi_avatar01.png" alt="" /></button>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <button><img src="/assets/img/images/testi_avatar02.png" alt="" /></button>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <button><img src="/assets/img/images/testi_avatar03.png" alt="" /></button>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <button><img src="/assets/img/images/testi_avatar04.png" alt="" /></button>
                                        </SwiperSlide>
                                    </Swiper>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-8">
                            <div className="testimonial-img-wrap">
                                <img src="/assets/img/images/testimonial_img.png" alt="" />
                                <div className="img-shape">
                                    <img src="/assets/img/images/testimonial_shape01.png" alt="" />
                                    <img src="/assets/img/images/testimonial_shape02.png" alt="" className="alltuchtopdown" />
                                    <img src="/assets/img/images/testimonial_shape03.png" alt="" data-parallax="{&quot;y&quot; : 80 }" />
                                    <img src="/assets/img/images/testimonial_shape04.png" alt="" className="rightToLeft" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="testimonial-shape-wrap">
                    <img src="/assets/img/images/testimonial_shape05.png" alt="" data-aos="fade-up" data-aos-delay={400} />
                    <img src="/assets/img/images/testimonial_shape06.png" alt="" data-aos="fade-left" data-aos-delay={400} />
                </div>
            </section>
        </>
    )
}

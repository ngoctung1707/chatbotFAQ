
'use client'
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

const swiperOptions = {
        modules: [Autoplay, Pagination, Navigation],
        slidesPerView: 2,
        spaceBetween: 30,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
        loop: true,

        // Navigation
        navigation: {
            nextEl: '.testimonial-two-button-next',
            prevEl: '.testimonial-two-button-prev',
        },

        // Pagination
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },

				breakpoints:{
            320: {
                slidesPerView: 1,
                spaceBetween: 30,
            },
            575: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            767: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            991: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            1199: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            1350: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
        }
    };
export default function Testimonials8() {
    return (
        <div>
            <section className="testimonials__area-home8">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-7 col-md-6 mb-50">
                            <div className="section-title tg-heading-subheading animation-style3">
                                <h2 className="title tg-element-title">Happy Clients</h2>
                                <p>Hear what our satisfied clients have to say</p>
                            </div>
                        </div>
                        <div className="col-xl-5 col-md-6 mb-50">
                            <div className="box-button-slider-right text-end">
                                <div className="testimonial__nav-four">
                                    <div className="testimonial-two-button-prev button-swiper-testimonial-prev"><i className="flaticon-right-arrow" /></div>
                                    <div className="testimonial-two-button-next button-swiper-testimonial-next"><i className="flaticon-right-arrow" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="box-slide-testimonials">
                        <Swiper {...swiperOptions} className="swiper-container testiminials-active-2">
                            <div className="swiper-wrapper">
                                <SwiperSlide>
                                    <div className="card-testimonials">
                                        <div className="card-image">
                                            <img src="assets/img/home8/author.png" alt="" />
                                        </div>
                                        <div className="card-info">
                                            <p className="card-position">CEO, Ketto Agency</p>
                                            <div className="rates-review">
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star-grey.svg" />
                                            </div>
                                            <div className="card-comment">
                                                <p>“ Morem ipsum dolor sit amet, consectetur adipisc Service awing elita
                                                    florai sum dolor sit amet, consectetur area recall edBorem ipsum dolor
                                                    sit amet, consectetur.”</p>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="card-testimonials">
                                        <div className="card-image">
                                            <img src="assets/img/home8/author2.png" alt="" />
                                        </div>
                                        <div className="card-info">
                                            <p className="card-position">CEO, Ketto Agency</p>
                                            <div className="rates-review">
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star-grey.svg" />
                                            </div>
                                            <div className="card-comment">
                                                <p>“ Morem ipsum dolor sit amet, consectetur adipisc Service awing elita
                                                    florai sum dolor sit amet, consectetur area recall edBorem ipsum dolor
                                                    sit amet, consectetur.”</p>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="card-testimonials">
                                        <div className="card-image">
                                            <img src="assets/img/home8/author.png" alt="" />
                                        </div>
                                        <div className="card-info">
                                            <p className="card-position">CEO, Ketto Agency</p>
                                            <div className="rates-review">
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star-grey.svg" />
                                            </div>
                                            <div className="card-comment">
                                                <p>“ Morem ipsum dolor sit amet, consectetur adipisc Service awing elita
                                                    florai sum dolor sit amet, consectetur area recall edBorem ipsum dolor
                                                    sit amet, consectetur.”</p>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="card-testimonials">
                                        <div className="card-image">
                                            <img src="assets/img/home8/author2.png" alt="" />
                                        </div>
                                        <div className="card-info">
                                            <p className="card-position">CEO, Ketto Agency</p>
                                            <div className="rates-review">
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star.svg" />
                                                <img src="assets/img/home8/star-grey.svg" />
                                            </div>
                                            <div className="card-comment">
                                                <p>“ Morem ipsum dolor sit amet, consectetur adipisc Service awing elita
                                                    florai sum dolor sit amet, consectetur area recall edBorem ipsum dolor
                                                    sit amet, consectetur.”</p>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            </div>
                        </Swiper>
                    </div>
                </div>
            </section>

        </div>
    )
}

'use client'
import Link from "next/link"
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    slidesPerView: 1,
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
}

export default function Slider2() {
    return (
        <>
            <section className="slider__area">
                <div className="swiper-container slider_baner__active slider_baner_home6">
                    <Swiper {...swiperOptions} className="swiper-wrapper">
                        <SwiperSlide className="swiper-slide slider__single">
                            <div className="slider__bg" data-background="/assets/img/home6/banner.png" />
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-7">
                                        <div className="banner__content-three">
                                            <div className="text-25-years">
                                                <span className="text-stroke">25</span>
                                                <h4 className="text-experience">Years Experiences<br /> in this field</h4>
                                            </div>
                                            <span className="sub-title aos-init aos-animate">We Are Expert In This Field</span>
                                            <h2 className="title">Solutions Financial For Business</h2>
                                            <p>Apexa helps you to convert your data into a strategic asset and get business insights Apexa helps you to convert your data into Asset and get Top-Notch Business Insights.</p>
                                            <Link href="/contact" className="btn">Read more</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className="swiper-slide slider__single">
                            <div className="slider__bg" data-background="/assets/img/home6/banner2.png" />
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-7">
                                        <div className="banner__content-three">
                                            <div className="text-25-years">
                                                <span className="text-stroke">32</span>
                                                <h4 className="text-experience">Global Branches<br /> 68 countries</h4>
                                            </div>
                                            <span className="sub-title aos-init aos-animate">We are constantly expanding</span>
                                            <h2 className="title">Top experts from your country</h2>
                                            <p>Don't worry about distance, language or culture. We are right in your country, with leading experts in the financial industry. We are always there for your business.</p>
                                            <Link href="/contact" className="btn">Read more</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                        <SwiperSlide className="swiper-slide slider__single">
                            <div className="slider__bg" data-background="/assets/img/home6/banner3.png" />
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-7">
                                        <div className="banner__content-three">
                                            <div className="text-25-years">
                                                <span className="text-stroke">15</span>
                                                <h4 className="text-experience">years of applying<br /> digital transformation</h4>
                                            </div>
                                            <span className="sub-title aos-init aos-animate">Smart financial technology</span>
                                            <h2 className="title">High-tech financial platform</h2>
                                            <p>Apexa helps you to convert your data into a strategic asset and get business insights Apexa helps you to convert your data into Asset and get Top-Notch Business Insights.</p>
                                            <Link href="/contact" className="btn">Read more</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
                <div className="box-button-slider-bottom">
                    <div className="container">
                        <div className="testimonial__nav-four">
                            <div className="testimonial-two-button-prev button-swiper-prev"><i className="flaticon-right-arrow" /></div>
                            <div className="testimonial-two-button-next button-swiper-next"><i className="flaticon-right-arrow" /></div>
                        </div>
                    </div>
                </div>
            </section>
        </>

    )
}

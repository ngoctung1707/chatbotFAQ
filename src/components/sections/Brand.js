'use client'
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    slidesPerView: 6,
    spaceBetween: 30,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    loop: true,

    // Navigation
    navigation: {
        nextEl: '.h1n',
        prevEl: '.h1p',
    },

    // Pagination
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },

    breakpoints: {
        320: {
            slidesPerView: 1,
            spaceBetween: 30,
        },
        575: {
            slidesPerView: 2,
            spaceBetween: 30,
        },
        767: {
            slidesPerView: 3,
            spaceBetween: 30,
        },
        991: {
            slidesPerView: 4,
            spaceBetween: 30,
        },
        1199: {
            slidesPerView: 5,
            spaceBetween: 30,
        },
        1350: {
            slidesPerView: 6,
            spaceBetween: 30,
        },
    }
}

export default function Brand() {
    return (
        <>
            <div className="brand-area brand__area-seven brand__area-home7">
                <div className="container">
                    <Swiper {...swiperOptions} className="swiper-container brand-active">
                        <div className="swiper-wrapper">
                            <SwiperSlide>
                                <div className="brand-item">
                                    <img src="/assets/img/brand/brand_img01.png" alt="" />
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="brand-item">
                                    <img src="/assets/img/brand/brand_img02.png" alt="" />
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="brand-item">
                                    <img src="/assets/img/brand/brand_img03.png" alt="" />
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="brand-item">
                                    <img src="/assets/img/brand/brand_img04.png" alt="" />
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="brand-item">
                                    <img src="/assets/img/brand/brand_img05.png" alt="" />
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="brand-item">
                                    <img src="/assets/img/brand/brand_img06.png" alt="" />
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="brand-item">
                                    <img src="/assets/img/brand/brand_img03.png" alt="" />
                                </div>
                            </SwiperSlide>
                        </div>
                    </Swiper>
                </div>
            </div>

        </ >
    )
}

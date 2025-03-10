'use client'

import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    breakpoints: {
        '1200': {
            slidesPerView: 6,
        },
        '992': {
            slidesPerView: 5,
        },
        '768': {
            slidesPerView: 4,
        },
        '576': {
            slidesPerView: 3,
        },
        '0': {
            slidesPerView: 2,
        },
    },
}

export default function BrandActiveSlider() {
    return (
        <>
            <Swiper {...swiperOptions}>
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
            </Swiper>
        </>
    )
}

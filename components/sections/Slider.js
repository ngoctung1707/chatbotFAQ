
'use client'
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    slidesPerView: 1,
    spaceBetween: 30,
    // autoplay: {
    //     delay: 2500,
    //     disableOnInteraction: false,
    // },
    // loop: true,

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
export default function Slider() {
    return (
        <>
            <section className="slider__area">
                <div className="banner-two-col">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="banner-col-1">
                                    <div className="section-title mb-20 tg-heading-subheading animation-style3">
                                        <span className="sub-title">Best accounting Services</span>
                                        <h2 className="title tg-element-title text-60-bold"><span>Accounting Platform using </span> AI <span>technology</span></h2>
                                    </div>
                                    <p>Empower decision-making with real-time financial reporting, providing instant access to key metrics, profit and loss statements, and other critical data for informed business strategies.</p>
                                    <div className="choose__tab-content">
                                        <ul className="list-wrap">
                                            <li><i className="fas fa-check" />Best For IT Consulting</li>
                                            <li><i className="fas fa-check" />Our Vision, Our Mission</li>
                                            <li><i className="fas fa-check" />Save Money &amp; Time</li>
                                            <li><i className="fas fa-check" />100% Satisfaction</li>
                                        </ul>
                                    </div>
                                    <div className="box-authors mt-65">
                                        <div className="box-img-author">
                                            <img src="/assets/img/home7/author.png" />
                                            <img src="/assets/img/home7/author2.png" />
                                            <img src="/assets/img/home7/author3.png" />
                                            <img src="/assets/img/home7/author4.png" />
                                            <span className="item-author-more">+28k</span>
                                        </div>
                                        <div className="text-trusted-author">
                                            Trusted , Happy &amp; Satisfied Businesses
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="banner-col-2">
                        <Swiper {...swiperOptions} className="swiper-container slider_baner__active slider_baner_home6">
                            <div className="swiper-wrapper">
                                <SwiperSlide className="swiper-slide slide__home7">
                                    <img src="/assets/img/home7/banner.png" />
                                    <div className="box-info-contact">
                                        <p className="text-need-help">
                                            <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g clipPath="url(#clip0_66_3059)">
                                                    <path d="M18.9062 2.21558C22.7573 2.21713 26.4894 3.54999 29.4702 5.98832C32.451 8.42666 34.4972 11.8205 35.262 15.5948C36.0269 19.3692 35.4634 23.2919 33.667 26.6983C31.8707 30.1047 28.9519 32.7854 25.4053 34.286C21.3263 36.0097 16.7297 36.0424 12.6266 34.3769C8.52353 32.7114 5.25011 29.4842 3.52646 25.4053C1.80281 21.3263 1.77013 16.7297 3.43559 12.6266C5.10106 8.52353 8.32825 5.25011 12.4072 3.52646C14.4632 2.6564 16.6737 2.21053 18.9062 2.21558ZM18.9062 0C8.46498 0 0 8.46498 0 18.9062C0 29.3475 8.46498 37.8125 18.9062 37.8125C29.3475 37.8125 37.8125 29.3475 37.8125 18.9062C37.8125 8.46498 29.3475 0 18.9062 0Z" fill="white" />
                                                    <path d="M24.422 29.088C23.3238 29.0142 21.7759 28.6353 20.2648 28.0947C14.9371 26.1878 9.73864 21.1075 8.63381 14.0014C8.43736 12.7363 8.64415 11.5806 9.60275 10.6397C9.92401 10.3251 10.2098 9.975 10.5237 9.653C11.7053 8.43665 13.432 8.40563 14.6557 9.57398C15.0435 9.94324 15.4378 10.3073 15.816 10.6884C16.3337 11.199 16.6335 11.8904 16.6524 12.6174C16.6713 13.3443 16.4077 14.0503 15.9171 14.5871C15.6217 14.915 15.3116 15.2266 14.9999 15.5376C14.6594 15.8773 14.2363 16.0723 13.7821 16.2141C13.2215 16.3898 13.1174 16.6247 13.3722 17.1601C14.9822 20.5322 17.5023 22.9602 20.9325 24.4442C21.3911 24.6421 21.6031 24.5527 21.7877 24.0978C22.1924 23.1001 22.9346 22.3726 23.7876 21.7848C24.7529 21.1201 26.1354 21.2678 27.0497 22.0536C27.5509 22.4843 28.0299 22.9403 28.4846 23.4198C28.974 23.9434 29.2458 24.6334 29.2452 25.35C29.2445 26.0666 28.9713 26.7561 28.4809 27.2786C28.3384 27.4337 28.1914 27.5851 28.0548 27.7447C27.2321 28.701 26.1886 29.1486 24.422 29.088Z" fill="white" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_66_3059">
                                                        <rect width="37.8125" height="37.8125" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                            Need help? Call us</p>
                                        <p className="text-42-bold text-phone">1-800-222-8888</p>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide className="swiper-slide slide__home7">
                                    <img src="/assets/img/home7/banner.png" />
                                    <div className="box-info-contact">
                                        <p className="text-need-help">
                                            <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g clipPath="url(#clip0_66_3059)">
                                                    <path d="M18.9062 2.21558C22.7573 2.21713 26.4894 3.54999 29.4702 5.98832C32.451 8.42666 34.4972 11.8205 35.262 15.5948C36.0269 19.3692 35.4634 23.2919 33.667 26.6983C31.8707 30.1047 28.9519 32.7854 25.4053 34.286C21.3263 36.0097 16.7297 36.0424 12.6266 34.3769C8.52353 32.7114 5.25011 29.4842 3.52646 25.4053C1.80281 21.3263 1.77013 16.7297 3.43559 12.6266C5.10106 8.52353 8.32825 5.25011 12.4072 3.52646C14.4632 2.6564 16.6737 2.21053 18.9062 2.21558ZM18.9062 0C8.46498 0 0 8.46498 0 18.9062C0 29.3475 8.46498 37.8125 18.9062 37.8125C29.3475 37.8125 37.8125 29.3475 37.8125 18.9062C37.8125 8.46498 29.3475 0 18.9062 0Z" fill="white" />
                                                    <path d="M24.422 29.088C23.3238 29.0142 21.7759 28.6353 20.2648 28.0947C14.9371 26.1878 9.73864 21.1075 8.63381 14.0014C8.43736 12.7363 8.64415 11.5806 9.60275 10.6397C9.92401 10.3251 10.2098 9.975 10.5237 9.653C11.7053 8.43665 13.432 8.40563 14.6557 9.57398C15.0435 9.94324 15.4378 10.3073 15.816 10.6884C16.3337 11.199 16.6335 11.8904 16.6524 12.6174C16.6713 13.3443 16.4077 14.0503 15.9171 14.5871C15.6217 14.915 15.3116 15.2266 14.9999 15.5376C14.6594 15.8773 14.2363 16.0723 13.7821 16.2141C13.2215 16.3898 13.1174 16.6247 13.3722 17.1601C14.9822 20.5322 17.5023 22.9602 20.9325 24.4442C21.3911 24.6421 21.6031 24.5527 21.7877 24.0978C22.1924 23.1001 22.9346 22.3726 23.7876 21.7848C24.7529 21.1201 26.1354 21.2678 27.0497 22.0536C27.5509 22.4843 28.0299 22.9403 28.4846 23.4198C28.974 23.9434 29.2458 24.6334 29.2452 25.35C29.2445 26.0666 28.9713 26.7561 28.4809 27.2786C28.3384 27.4337 28.1914 27.5851 28.0548 27.7447C27.2321 28.701 26.1886 29.1486 24.422 29.088Z" fill="white" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_66_3059">
                                                        <rect width="37.8125" height="37.8125" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                            Need help? Call us</p>
                                        <p className="text-42-bold text-phone">1-800-222-8888</p>
                                    </div>
                                </SwiperSlide>
                            </div>
                        </Swiper>
                        <div className="box-button-slider-bottom">
                            <div className="testimonial__nav-four">
                                <div className="testimonial-two-button-prev button-swiper-prev"><i className="flaticon-right-arrow" /></div>
                                <div className="testimonial-two-button-next button-swiper-next"><i className="flaticon-right-arrow" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </ >
    )
}

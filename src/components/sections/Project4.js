'use client'
import Link from "next/link"
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    slidesPerView: 1,
    spaceBetween: 5,
    loop: true,
    breakpoints: {
        '1200': {
            slidesPerView: 4,
        },
        '992': {
            slidesPerView: 3,
        },
        '768': {
            slidesPerView: 2,
        },
        '576': {
            slidesPerView: 2,
        },
        '0': {
            slidesPerView: 1,
        },
    },

};

export default function Project4() {
    return (
        <>
            <section className="project__area">
                <div className="container-fluid p-0">
                    <div className="swiper-container project-active-two">
                        <Swiper {...swiperOptions} className="swiper-wrapper">
                            <SwiperSlide>
                                <div className="project__item-four">
                                    <div className="project__thumb-four">
                                        <Link href="/project-details"><img src="/assets/img/project/h5_project_img01.jpg" alt="" /></Link>
                                    </div>
                                    <div className="project__content-four">
                                        <div className="left-content">
                                            <h4 className="title"><Link href="/project-details">Marketing Idea</Link></h4>
                                            <span>Modern Strategy</span>
                                        </div>
                                        <Link href="/project-details" className="right-arrow"><i className="flaticon-arrow-button" /></Link>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="project__item-four">
                                    <div className="project__thumb-four">
                                        <Link href="/project-details"><img src="/assets/img/project/h5_project_img02.jpg" alt="" /></Link>
                                    </div>
                                    <div className="project__content-four">
                                        <div className="left-content">
                                            <h4 className="title"><Link href="/project-details">Business Consulting</Link></h4>
                                            <span>Business Strategy</span>
                                        </div>
                                        <Link href="/project-details" className="right-arrow"><i className="flaticon-arrow-button" /></Link>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="project__item-four">
                                    <div className="project__thumb-four">
                                        <Link href="/project-details"><img src="/assets/img/project/h5_project_img03.jpg" alt="" /></Link>
                                    </div>
                                    <div className="project__content-four">
                                        <div className="left-content">
                                            <h4 className="title"><Link href="/project-details">Digital Agency</Link></h4>
                                            <span>Modern Strategy</span>
                                        </div>
                                        <Link href="/project-details" className="right-arrow"><i className="flaticon-arrow-button" /></Link>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="project__item-four">
                                    <div className="project__thumb-four">
                                        <Link href="/project-details"><img src="/assets/img/project/h5_project_img04.jpg" alt="" /></Link>
                                    </div>
                                    <div className="project__content-four">
                                        <div className="left-content">
                                            <h4 className="title"><Link href="/project-details">Inventory Tracking</Link></h4>
                                            <span>Modern Strategy</span>
                                        </div>
                                        <Link href="/project-details" className="right-arrow"><i className="flaticon-arrow-button" /></Link>
                                    </div>
                                </div>
                            </SwiperSlide>
                            <SwiperSlide>
                                <div className="project__item-four">
                                    <div className="project__thumb-four">
                                        <Link href="/project-details"><img src="/assets/img/project/h5_project_img03.jpg" alt="" /></Link>
                                    </div>
                                    <div className="project__content-four">
                                        <div className="left-content">
                                            <h4 className="title"><Link href="/project-details">Digital Agency</Link></h4>
                                            <span>Modern Strategy</span>
                                        </div>
                                        <Link href="/project-details" className="right-arrow"><i className="flaticon-arrow-button" /></Link>
                                    </div>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </div>
            </section>
        </>
    )
}

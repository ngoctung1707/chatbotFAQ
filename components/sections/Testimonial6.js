'use client'
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    slidesPerView: 3,
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
            slidesPerView: 2,
            spaceBetween: 30,
        },
        991: {
            slidesPerView: 2,
            spaceBetween: 30,
        },
        1199: {
            slidesPerView: 3,
            spaceBetween: 30,
        },
        1350: {
            slidesPerView: 3,
            spaceBetween: 30,
        },
    }
}

export default function Testimonial6() {
    return (
        <>
            <section className="testimonial__area-two">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="section-title white-title text-center mb-50">
                                <span className="sub-title">Clients Testimonial</span>
                                <h2 className="title">What Our Loving Clients Saying</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center gutter-24">
                        <div className="col-12">
                            <div className="swiper-container testiminials-active">
                                <Swiper {...swiperOptions} className="swiper-wrapper">
                                    <SwiperSlide>
                                        <div className="testimonial__item-two">
                                            <div className="testimonial__avatar">
                                                <img src="/assets/img/images/testi_avatar01.png" alt="" />
                                            </div>
                                            <div className="testimonial__info-two">
                                                <h2 className="title">John Gripsonery</h2>
                                                <span>CEO,JAKS Shans</span>
                                            </div>
                                            <div className="testimonial__rating">
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                            </div>
                                            <p>Songerty successfully cope with tasks of varying complexity provide area guarantees and regularly.</p>
                                            <div className="icon">
                                                <img src="/assets/img/icon/quote.svg" alt="" />
                                            </div>
                                        </div>
                                    </SwiperSlide> {/*swiper slider*/}
                                    <SwiperSlide>
                                        <div className="testimonial__item-two">
                                            <div className="testimonial__avatar">
                                                <img src="/assets/img/images/testi_avatar02.png" alt="" />
                                            </div>
                                            <div className="testimonial__info-two">
                                                <h2 className="title">Kristin Watson</h2>
                                                <span>CEO,JAKS Shans</span>
                                            </div>
                                            <div className="testimonial__rating">
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                            </div>
                                            <p>Songerty successfully cope with tasks of varying complexity provide area guarantees and regularly.</p>
                                            <div className="icon">
                                                <img src="/assets/img/icon/quote.svg" alt="" />
                                            </div>
                                        </div>
                                    </SwiperSlide>{/*swiper slider*/}
                                    <SwiperSlide>
                                        <div className="testimonial__item-two">
                                            <div className="testimonial__avatar">
                                                <img src="/assets/img/images/testi_avatar03.png" alt="" />
                                            </div>
                                            <div className="testimonial__info-two">
                                                <h2 className="title">Wade Warren</h2>
                                                <span>CEO,JAKS Shans</span>
                                            </div>
                                            <div className="testimonial__rating">
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                            </div>
                                            <p>Songerty successfully cope with tasks of varying complexity provide area guarantees and regularly.</p>
                                            <div className="icon">
                                                <img src="/assets/img/icon/quote.svg" alt="" />
                                            </div>
                                        </div>
                                    </SwiperSlide>{/*swiper slider*/}
                                    <SwiperSlide>
                                        <div className="testimonial__item-two">
                                            <div className="testimonial__avatar">
                                                <img src="/assets/img/images/testi_avatar04.png" alt="" />
                                            </div>
                                            <div className="testimonial__info-two">
                                                <h2 className="title">Wade Warren</h2>
                                                <span>CEO,JAKS Shans</span>
                                            </div>
                                            <div className="testimonial__rating">
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                                <i className="fas fa-star" />
                                            </div>
                                            <p>Songerty successfully cope with tasks of varying complexity provide area guarantees and regularly.</p>
                                            <div className="icon">
                                                <img src="/assets/img/icon/quote.svg" alt="" />
                                            </div>
                                        </div>
                                    </SwiperSlide>{/*swiper slider*/}
                                </Swiper>
                            </div>
                        </div>
                        {/* <div class="col-lg-4 col-md-6">
                  <div class="testimonial__item-two">
                      <div class="testimonial__avatar">
                          <img src="/assets/img/images/testi_avatar01.png" alt="">
                      </div>
                      <div class="testimonial__info-two">
                          <h2 class="title">John Gripsonery</h2>
                          <span>CEO,JAKS Shans</span>
                      </div>
                      <div class="testimonial__rating">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                      </div>
                      <p>Songerty successfully cope with tasks of varying complexity provide area guarantees and regularly.</p>
                      <div class="icon">
                          <img src="/assets/img/icon/quote.svg" alt="">
                      </div>
                  </div>
              </div>
              <div class="col-lg-4 col-md-6">
                  <div class="testimonial__item-two">
                      <div class="testimonial__avatar">
                          <img src="/assets/img/images/testi_avatar02.png" alt="">
                      </div>
                      <div class="testimonial__info-two">
                          <h2 class="title">Kristin Watson</h2>
                          <span>CEO,JAKS Shans</span>
                      </div>
                      <div class="testimonial__rating">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                      </div>
                      <p>Songerty successfully cope with tasks of varying complexity provide area guarantees and regularly.</p>
                      <div class="icon">
                          <img src="/assets/img/icon/quote.svg" alt="">
                      </div>
                  </div>
              </div>
              <div class="col-lg-4 col-md-6">
                  <div class="testimonial__item-two">
                      <div class="testimonial__avatar">
                          <img src="/assets/img/images/testi_avatar03.png" alt="">
                      </div>
                      <div class="testimonial__info-two">
                          <h2 class="title">Wade Warren</h2>
                          <span>CEO,JAKS Shans</span>
                      </div>
                      <div class="testimonial__rating">
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                          <i class="fas fa-star"></i>
                      </div>
                      <p>Songerty successfully cope with tasks of varying complexity provide area guarantees and regularly.</p>
                      <div class="icon">
                          <img src="/assets/img/icon/quote.svg" alt="">
                      </div>
                  </div>
              </div> */}
                    </div>
                </div>
                <div className="testimonial__shape-two">
                    <img src="/assets/img/images/h2_testimonial_shape.png" alt="" data-aos="fade-up" data-aos-delay={400} />
                </div>
            </section>

        </ >
    )
}

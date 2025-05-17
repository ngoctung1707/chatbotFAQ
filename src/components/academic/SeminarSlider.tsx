'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { Media, News } from '@/payload-types'
import Link from 'next/link'

interface SeminarSliderProps {
  seminars: News[]
}

export default function SeminarSlider({ seminars }: SeminarSliderProps) {
  return (
    <div className="seminar-slider-wrapper col-md-12 col-lg-8">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          768: {
            slidesPerView: 1,
          },
          1024: {
            slidesPerView: 1,
          },
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        className="seminar-slider"
      >
        {seminars.map((doc) => (
          <SwiperSlide key={doc.id}>
            <Link href={`/news/${doc.slug}`}>
              <div className="seminar-slide-item position-relative">
                <div className="seminar-image-wrapper" style={{ position: 'relative' }}>
                  <img
                    src={(doc.heroImage as Media)?.url}
                    alt={(doc.heroImage as Media)?.caption}
                    style={{
                      aspectRatio: '16/9',
                      opacity: 0.9,
                      transition: 'opacity 0.3s ease',
                    }}
                  />
                  <div
                    className="seminar-title-overlay"
                    style={{
                      position: 'absolute',
                      bottom: '5%',
                      left: '5%',
                      zIndex: 2,
                      maxWidth: '90%',
                    }}
                  >
                    <h2 className="text-white" style={{ fontWeight: '600' }}>
                      {doc.title}
                    </h2>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .seminar-slider-wrapper {
          margin-bottom: 30px;
        }

        .seminar-slider {
          position: relative;
          padding-bottom: 40px;
        }

        .swiper-pagination {
          bottom: 0 !important;
        }

        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: white;
          opacity: 0.5;
        }

        .swiper-pagination-bullet-active {
          opacity: 1;
          background: white;
        }
      `}</style>
    </div>
  )
}

'use client'

import React, { useMemo, useRef, useState } from 'react'
import TabCustom from './TabCustom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import Icon from './Icon'
import CardCustom from './CardCustom'

type SliderItem = {
  key: string
  icon: React.ReactNode
  title: string
  description: string
  label: string
}

type SliderProps = {
  items: SliderItem[]
  activeKey?: string
  initialKey?: string
  onChange?: (key: string) => void
}

export default function Slider({ items, activeKey, initialKey, onChange }: SliderProps) {
  const isControlled = activeKey !== undefined
  const fallbackKey = useMemo(() => items[0]?.key ?? '', [items])
  const [internalKey, setInternalKey] = useState(initialKey ?? fallbackKey)
  const currentKey = isControlled ? (activeKey ?? '') : internalKey
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.key === currentKey),
  )
  const swiperRef = useRef<SwiperType | null>(null)

  if (!items.length) return null

  const handleChange = (key: string) => {
    if (!isControlled) setInternalKey(key)
    onChange?.(key)
    const nextIndex = items.findIndex((item) => item.key === key)
    if (swiperRef.current && nextIndex >= 0) {
      swiperRef.current.slideToLoop(nextIndex)
    }
  }

  return (
    <div className="cc-slider">
      <div className="cc-slider-tabs">
        <TabCustom
          tabs={items.map((item) => ({ key: item.key, label: item.label }))}
          activeKey={currentKey}
          onChange={handleChange}
        />
      </div>

      <div className="cc-slider-viewport-wrap">
        <div className="cc-slider-viewport-overlay" />
        <div className="cc-slider-viewport">
          <Swiper
            modules={[Pagination, Navigation]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper
            }}
            onSlideChange={(swiper) => {
              const index = swiper.realIndex
              const item = items[index]
              if (!item) return
              if (!isControlled) setInternalKey(item.key)
              onChange?.(item.key)
            }}
            slidesPerView={2}
            spaceBetween={16}
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 16,
              },
              641: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
            }}
            speed={500}
            centeredSlides
            loop
            navigation={{
              nextEl: '.cc-swiper-button-next',
              prevEl: '.cc-swiper-button-prev',
            }}
            pagination={{ clickable: true }}
            className="cc-slider-swiper"
          >
            {[...items].map((item, index) => {
              const isActive = index === activeIndex
              return (
                <SwiperSlide key={item.key}>
                  <div className={`cc-slider-card${isActive ? ' is-active' : ' is-side'}`}>
                    <Icon>{item.icon}</Icon>
                    <h5 className="cc-slider-title">{item.title}</h5>
                    <div className="cc-slider-divider" />
                    <p className="cc-slider-desc">{item.description}</p>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>
      </div>

      <button className="cc-swiper-button-prev" aria-label="Previous slide" />
      <button className="cc-swiper-button-next" aria-label="Next slide" />

      <style jsx>{`
        .cc-slider {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
          position: relative;
        }

        .cc-slider-tabs {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .cc-slider-viewport-wrap {
          width: 100%;
          position: relative;
        }

        .cc-slider-viewport {
          width: 100%;
          overflow: hidden;
          padding: 0 120px;
        }

        .cc-slider-viewport-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          background: linear-gradient(
            90deg,
            #e6e6e6 0%,
            rgba(230, 230, 230, 0) 29.81%,
            rgba(230, 230, 230, 0) 70%,
            #e6e6e6 100%
          );
        }

        :global(.cc-slider-swiper) {
          overflow: visible;
        }

        :global(.cc-slider-swiper .swiper-slide) {
          display: flex;
          justify-content: center;
        }

        .cc-slider-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 32px;
          transition:
            transform 300ms ease-out,
            opacity 300ms ease-out;
          width: 100%;
          min-height: 350px;
        }

        .cc-slider-card.is-active {
          opacity: 0.8;
        }

        .cc-slider-card.is-side {
          opacity: 0.5;
          backdrop-filter: blur(20px);
        }

        .cc-slider-title {
          margin: 16px 0 24px;
          color: var(--cc-fg-primary);
        }

        .cc-slider-divider {
          width: 100%;
          height: 1px;
          background: repeating-linear-gradient(to right, #d0d0d0 0 6px, transparent 6px 12px);
          margin-bottom: 40px;
        }

        .cc-slider-desc {
          margin: 0;
          color: var(--cc-fg-secondary);
          line-height: 1.6;
        }

        :global(.cc-slider .swiper-pagination) {
          position: static;
          margin-top: 40px;
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        :global(.cc-slider .swiper-pagination-bullet) {
          width: 80px;
          height: 8px;
          border-radius: 100px;
          background: #ffffff66;
          opacity: 1;
          transition:
            opacity 300ms ease-out,
            background 300ms ease-out;
        }

        :global(.cc-slider .swiper-pagination-bullet-active) {
          background: #cccccc;
        }

        .cc-swiper-button-prev,
        .cc-swiper-button-next {
          position: absolute;
          top: 50%;
          width: 40px;
          height: 40px;
          transform: translateY(-50%);
          opacity: 0;
          pointer-events: none;
        }

        .cc-swiper-button-prev {
          left: 8px;
        }

        .cc-swiper-button-next {
          right: 8px;
        }

        @media (max-width: 1024px) {
          .cc-slider-viewport {
            padding: 0 48px;
          }
        }

        @media (max-width: 640px) {
          .cc-slider-viewport {
            padding: 0 24px;
          }

          .cc-slider-viewport-overlay {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

'use client'

import React, { useMemo, useRef, useState } from 'react'
import TabCustom from './TabCustom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import Icon from './Icon'
import CardCustom from './CardCustom'
import IconPrimary from './IconPrimary'

type SliderItem = {
  key: string
  icon: React.ElementType
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
      {/* <div className="cc-slider-tabs">
        <TabCustom
          tabs={items.map((item) => ({ key: item.key, label: item.label }))}
          activeKey={currentKey}
          onChange={handleChange}
        />
      </div> */}
      <div
        className="container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              padding: '12px 24px',
              border: '1px solid var(--cc-border-medium)',
              cursor: 'pointer',
              backgroundColor: item.key === currentKey ? 'var(--cc-primary)' : 'transparent',
            }}
            onClick={() => handleChange(item.key)}
          >
            <p
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: item.key === currentKey ? 'white' : 'var(--cc-fg-primary)',
              }}
            >
              {item.label}
            </p>
          </div>
        ))}
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
                    {isActive ? (
                      <IconPrimary>
                        <item.icon
                          style={{ fill: 'var(--cc-primary)', width: '48px', height: '48px' }}
                        />
                      </IconPrimary>
                    ) : (
                      <Icon style={{ width: '80px', height: '80px', borderRadius: '21px' }}>
                        <item.icon style={{ width: '48px', height: '48px' }} />
                      </Icon>
                    )}
                    <h5 style={{ margin: '40px 0 16px', color: 'var(--cc-fg-primary)' }}>
                      {item.title}
                    </h5>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--cc-fg-secondary)',
                        lineHeight: 1.6,
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>
      </div>

      <button className="cc-swiper-button-prev" aria-label="Previous slide" />
      <button className="cc-swiper-button-next" aria-label="Next slide" />
    </div>
  )
}

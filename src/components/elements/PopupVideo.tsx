'use client'
import { useState } from 'react'
import ModalVideo from 'react-modal-video'
import '../../../node_modules/react-modal-video/css/modal-video.css'
import { useTranslations } from 'next-intl'

export default function VideoPopup({ style }: { style?: number }) {
  const [isOpen, setOpen] = useState(false)
  const t = useTranslations('Misc')
  return (
    <>
      {!style && (
        // <a onClick={() => setOpen(true)} className="play-btn popup-video">
        //   <i className="fas fa-play" />
        // </a>
        <div onClick={() => setOpen(true)} className="btn" data-aos="fade-up" data-aos-delay={600}>
          {t('watchVideo').toUpperCase()}
        </div>
      )}
      {style === 1 && (
        <a onClick={() => setOpen(true)} className="popup-youtube bnt-play">
          <img src="/assets/img/home6/play.svg" alt="" />
        </a>
      )}
      {style === 2 && (
        <a onClick={() => setOpen(true)} className="btn-play">
          <img src="/assets/img/home8/play.svg" alt="" />
        </a>
      )}
      <ModalVideo
        channel="youtube"
        // autoplay
        isOpen={isOpen}
        videoId="b9klykMefBQ"
        onClose={() => setOpen(false)}
      />
    </>
  )
}

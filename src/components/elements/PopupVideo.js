'use client'
import { useState } from 'react'
import ModalVideo from 'react-modal-video'
import "../../node_modules/react-modal-video/css/modal-video.css"

export default function VideoPopup({ style }) {
    const [isOpen, setOpen] = useState(false)
    return (
        <>
            {!style && <a onClick={() => setOpen(true)} className="play-btn popup-video"><i className="fas fa-play" /></a>}
            {style === 1 && <a onClick={() => setOpen(true)} className="popup-youtube bnt-play"><img src="/assets/img/home6/play.svg" /></a>}
            {style === 2 && <a onClick={() => setOpen(true)} className="btn-play"><img src="/assets/img/home8/play.svg" /></a>}
            <ModalVideo channel='youtube' autoplay isOpen={isOpen} videoId="SZEflIVnhH8" onClose={() => setOpen(false)} />
        </>
    )
}
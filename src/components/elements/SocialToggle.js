'use client'
import Link from "next/link"
import { useState } from "react"
export default function SocialToggle() {

    const [isToggled, setToggled] = useState(false)
    const handleToggle = () => setToggled(!isToggled)
    return (
        <>
            <ul className="list-wrap" style={{ display: `${isToggled ? "block" : "none"}` }}>
                <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                <li><Link href="#"><i className="fab fa-pinterest-p" /></Link></li>
            </ul>

            <div className="social-toggle-icon" onClick={() => handleToggle()}>
                <i className={`fas  ${isToggled ?   "fa-times": "fa-share-alt"}`} />
            </div>
        </>
    )
}

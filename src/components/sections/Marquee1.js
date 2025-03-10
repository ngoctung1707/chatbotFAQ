import Link from 'next/link'

export default function Marquee1() {
    return (
        <>
            <div className="marquee__area">
                <div className="marquee__wrap">
                    <div className="marquee__box">
                        <Link data-hover="Marketing" href="/services-details">Marketing</Link>
                        <Link data-hover="Finance Advisor" href="/services-details">Finance Advisor</Link>
                        <Link data-hover="Investment" href="/services-details">Investment</Link>
                        <Link data-hover="Target" href="/services-details">Target</Link>
                    </div>
                    <div className="marquee__box">
                        <Link data-hover="Marketing" href="/services-details">Marketing</Link>
                        <Link data-hover="Finance Advisor" href="/services-details">Finance Advisor</Link>
                        <Link data-hover="Investment" href="/services-details">Investment</Link>
                        <Link data-hover="Target" href="/services-details">Target</Link>
                    </div>
                </div>
            </div>
        </>
    )
}

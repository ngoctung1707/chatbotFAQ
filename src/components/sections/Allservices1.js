import Link from "next/link"


export default function Allservices1() {
    return (
        <>
            <section className="all_services__area-six">
                <div className="container">
                    <h2>We offer specialized financial guidance<br className="d-none d-lg-block" /> tailored to both businesses and individuals.</h2>
                    <p>Empowering Businesses through Strategic Consulting With Us</p>
                    <Link href="/about" className="btn" data-aos="fade-up" data-aos-delay={600}>See All Services</Link>
                </div>
            </section>

        </ >
    )
}

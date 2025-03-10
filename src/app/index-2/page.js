import Layout from "@/components/layout/Layout"
import About2 from "@/components/sections/About2"
import BlogPost2 from "@/components/sections/BlogPost2"
import Brand2 from "@/components/sections/Brand2"
import Choose2 from "@/components/sections/Choose2"
import Counter2 from "@/components/sections/Counter2"
import Features1 from "@/components/sections/Features1"
import Marquee1 from "@/components/sections/Marquee1"
import Project2 from "@/components/sections/Project2"
import Request2 from "@/components/sections/Request2"
import Services2 from "@/components/sections/Services2"
import Slider1 from "@/components/sections/Slider1"
import Team2 from "@/components/sections/Team2"
import Testimonial2 from "@/components/sections/Testimonial2"

export const metadata = {
    title: 'Apexa - Business Consulting NextJS Template',
}

export default function Home2() {
    return (
        <>
            <Layout headerStyle={2} footerStyle={2}>
                <Slider1 />
                <Features1 />
                <About2 />
                <Services2 />
                <Choose2 />
                <Counter2 />
                <Request2 />
                <Project2 />
                <Marquee1 />
                <Team2 />
                <Testimonial2 />
                <Brand2 />
                <BlogPost2 />
            </Layout>
        </>
    )
}
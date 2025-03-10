import Layout from "@/components/layout/Layout"
import About from "@/components/sections/About"
import Blogpost from "@/components/sections/Blogpost"
import Brand from "@/components/sections/Brand"
import Choose from "@/components/sections/Choose"
import Choose6 from "@/components/sections/Choose6"
import Journey from "@/components/sections/Journey"
import Services from "@/components/sections/Services"
import Services7 from "@/components/sections/Services7"
import Slider from "@/components/sections/Slider"
import Steps from "@/components/sections/Steps"
import Testimonials from "@/components/sections/Testimonials"

export default function Home7() {
    return (
        <>
            <Layout headerStyle={6} footerStyle={7}>
                <Slider />
                <Brand />
                <Choose />
                <Services />
                <Steps />
                <Services7 />
                <Journey />
                <Testimonials />
                <About />
                <Choose6 />
                <Blogpost />

            </Layout>
        </>
    )
}
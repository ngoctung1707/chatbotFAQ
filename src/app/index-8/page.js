import Layout from "@/components/layout/Layout"
import About6 from "@/components/sections/About6"
import About7 from "@/components/sections/About7"
import About8 from "@/components/sections/About8"
import About9 from "@/components/sections/About9"
import Blogpost8 from "@/components/sections/Blogpost8"
import Pricing8 from "@/components/sections/Pricing8"
import Services8 from "@/components/sections/Services8"
import Slider3 from "@/components/sections/Slider3"
import Team8 from "@/components/sections/Team8"
import Team9 from "@/components/sections/Team9"
import Testimonials8 from "@/components/sections/Testimonials8"

export default function Home7() {
    return (
        <>
            <Layout headerStyle={6} footerStyle={6}>
                <Slider3 />
                <Services8 />
                <About6 />
                <Team8 />
                <About7 />
                <Team9 />
                <About8 />
                <About9 />
                <Pricing8 />
                <Testimonials8 />
                <Blogpost8 />
            </Layout>
        </>
    )
}
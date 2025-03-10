import Layout from "@/components/layout/Layout"
import Allservices1 from "@/components/sections/Allservices1"
import Blogpost6 from "@/components/sections/Blogpost6"
import Choose5 from "@/components/sections/Choose5"
import Counter5 from "@/components/sections/Counter5"
import Faqs1 from "@/components/sections/Faqs1"
import Marketingexpert1 from "@/components/sections/Marketingexpert1"
import Partners1 from "@/components/sections/Partners1"
import Services6 from "@/components/sections/Services6"
import Slider2 from "@/components/sections/Slider2"
import Team6 from "@/components/sections/Team6"
import Testimonial6 from "@/components/sections/Testimonial6"

export default function Home6() {
    return (
        <>
            <Layout headerStyle={6} footerStyle={6}>
                <Slider2 />
                <Counter5 />
                <Services6 />
                <Testimonial6 />
                <Partners1 />
                <Choose5 />
                <Allservices1 />
                <Team6 />
                <Faqs1 />
                <Marketingexpert1 />
                <Blogpost6 />
            </Layout>
        </>
    )
}
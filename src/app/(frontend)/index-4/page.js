import Layout from "@/components/layout/Layout"
import About4 from "@/components/sections/About4"
import Banner3 from "@/components/sections/Banner3"
import BlogPost4 from "@/components/sections/BlogPost4"
import Brand4 from "@/components/sections/Brand4"
import Features2 from "@/components/sections/Features2"
import Pricing1 from "@/components/sections/Pricing1"
import Request4 from "@/components/sections/Request4"
import Services4 from "@/components/sections/Services4"
import Team4 from "@/components/sections/Team4"
import Testimonial4 from "@/components/sections/Testimonial4"

export default function Home4() {
    return (
        <>
            <Layout headerStyle={4} footerStyle={4}>
                <Banner3 />
                <Features2 />
                <Brand4 />
                <Services4 />
                <About4 />
                <Request4 />
                <Team4 />
                <Testimonial4 />
                <Pricing1 />
                <BlogPost4 />
            </Layout>
        </>
    )
}
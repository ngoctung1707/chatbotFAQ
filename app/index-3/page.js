import Layout from "@/components/layout/Layout"
import About3 from "@/components/sections/About3"
import Banner2 from "@/components/sections/Banner2"
import BlogPost3 from "@/components/sections/BlogPost3"
import Brand3 from "@/components/sections/Brand3"
import Callback2 from "@/components/sections/Callback2"
import Choose3 from "@/components/sections/Choose3"
import Counter3 from "@/components/sections/Counter3"
import Project3 from "@/components/sections/Project3"
import Request3 from "@/components/sections/Request3"
import Services3 from "@/components/sections/Services3"
import Team3 from "@/components/sections/Team3"
import Testimonial3 from "@/components/sections/Testimonial3"

export default function Home3() {
    return (
        <>

            <Layout headerStyle={3} footerStyle={3}>
                <Banner2 />
                <Brand3 />
                <About3 />
                <Services3 />
                <Choose3 />
                <Project3 />
                <Counter3 />
                <Request3 />
                <Team3 />
                <Testimonial3 />
                <Callback2 />
                <BlogPost3 />
            </Layout>
        </>
    )
}
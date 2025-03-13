import Layout from '@/components/layout/Layout'
import Banner from '@/components/sections/Banner'
import News from '@/components/sections/News'
import Partners from '@/components/sections/Partners'
import Project from '@/components/sections/Projects'
import Publication from '@/components/sections/Publications'
import Training from '@/components/sections/Training'

export default function Home() {
  return (
    <>
      <Layout headerStyle={0} footerStyle={1} transparent>
        <Banner />
        <News />
        <Project />
        <Training />
        <Partners />
        <Publication />
      </Layout>
    </>
  )
}

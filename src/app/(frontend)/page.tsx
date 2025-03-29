import Layout from '@/components/layout/Layout'
import Banner from '@/components/sections/Banner'
import News from '@/components/sections/News'
import Partners from '@/components/sections/Partners'
import Solutions from '@/components/sections/Solutions'
import Research from '@/components/sections/Research'
import Training from '@/components/sections/Training'

export default function Home() {
  return (
    <>
      <Layout transparent>
        <Banner />
        <News />
        <Solutions />
        <Training />
        <Partners />
        <Research />
      </Layout>
    </>
  )
}

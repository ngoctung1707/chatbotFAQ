import Layout from '@/components/layout/Layout'
import Banner from '@/components/academic/Banner'
import Outstanding from '@/components/academic/Outstanding'
import Training from '@/components/sections/Training'
import Certification from '@/components/academic/Certification'

export default function Home() {
  return (
    <>
      <Layout headerStyle={0} footerStyle={0} transparent={false}>
        <Banner />
        <Outstanding />
        <Training />
        <Certification />
      </Layout>
    </>
  )
}

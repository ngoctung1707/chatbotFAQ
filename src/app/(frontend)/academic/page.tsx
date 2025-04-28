import Layout from '@/components/layout/Layout'
import Banner from '@/components/academic/Banner'
import Certification from '@/components/academic/Certification'
import Courses from '@/components/academic/Courses'
import Seminar from '@/components/academic/Seminar'
import Student from '@/components/academic/Student'

export default function Home() {
  return (
    <>
      <Layout transparent={false}>
        <Banner />
        <Courses />
        <Seminar />
        <Certification />
        <Student />
      </Layout>
    </>
  )
}

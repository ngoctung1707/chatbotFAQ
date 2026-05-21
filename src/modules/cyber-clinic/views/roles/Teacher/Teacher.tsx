import FooterWrap from '@/modules/cyber-clinic/layout/FooterWrap'
import Faq from '../../sections/Faq'
import Hero from '../../sections/Hero'
import News from '../../sections/News'
import Register from '../../sections/Register'
import SliderTeacher from './SliderTeacher'

export default function Teacher() {
  return (
    <div>
      <Hero userKey="teacher" />
      <SliderTeacher />
      <Register userKey="teacher" />
      <News />
      <Faq userKey="teacher" />
      <FooterWrap />
    </div>
  )
}

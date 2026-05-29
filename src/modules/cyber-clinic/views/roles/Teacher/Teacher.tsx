import FooterWrap from '@/modules/cyber-clinic/layout/FooterWrap'
import Faq from '../../sections/Faq'
import Hero from '../../sections/Hero'
import News from '../../sections/News'
import Register from '../../sections/Register'
import SliderTeacher from './SliderTeacher'
import Partners from '../../sections/Partners'
import RegisterTeacher from './RegisterTeacher'
import EmptyDiv from '@/modules/cyber-clinic/components/EmptyDiv'

export default function Teacher() {
  return (
    <div>
      <Hero userKey="teacher" />
      <SliderTeacher />
      <RegisterTeacher />
      <EmptyDiv />
      <News />
      <Faq userKey="teacher" />
      {/* <Partners /> */}
      <FooterWrap />
    </div>
  )
}

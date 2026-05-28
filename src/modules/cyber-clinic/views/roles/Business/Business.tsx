import FooterWrap from '@/modules/cyber-clinic/layout/FooterWrap'
import Faq from '../../sections/Faq'
import Hero from '../../sections/Hero'
import News from '../../sections/News'
import Register from '../../sections/Register'
import Roadmap from './Roadmap'
import SliderBusiness from './SliderBusiness'
import Partners from '../../sections/Partners'
import RegisterBusiness from './RegisterBusiness'

export default function Business() {
  return (
    <div>
      <Hero userKey="business" />
      <SliderBusiness />
      <RegisterBusiness />
      <Roadmap />
      <News />
      <Faq userKey="business" />
      <Partners />
      <FooterWrap />
    </div>
  )
}

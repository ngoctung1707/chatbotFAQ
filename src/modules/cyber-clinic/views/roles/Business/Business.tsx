import FooterWrap from '@/modules/cyber-clinic/layout/FooterWrap'
import Faq from '../../sections/Faq'
import Hero from '../../sections/Hero'
import News from '../../sections/News'
import Register from '../../sections/Register'
import Roadmap from './Roadmap'
import SliderBusiness from './SliderBusiness'

export default function Business() {
  return (
    <div>
      <Hero userKey="business" />
      <SliderBusiness />
      <Register userKey="business" />
      <Roadmap />
      <News />
      <Faq userKey="business" />
      <FooterWrap />
    </div>
  )
}

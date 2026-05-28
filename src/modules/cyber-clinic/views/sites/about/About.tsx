import FooterWrap from '@/modules/cyber-clinic/layout/FooterWrap'
import News from '../../sections/News'
import Header from '@/modules/cyber-clinic/layout/Header'
import HeroAbout from './HeroAbout'
import ContextAbout from './ContextAbout'
import QuoteAbout from './Quote'
import EmptyBox from './EmptyBox'
import Context2 from './Context2'
import Challenge from './Challenge'
import Target from './Target'
import EmptyDiv from '@/modules/cyber-clinic/components/EmptyDiv'

export default function About() {
  return (
    <div>
      <div style={{ paddingBottom: '20px', backgroundColor: 'var(--cc-bg-page)' }}>
        <Header />
      </div>
      <EmptyBox />
      <HeroAbout />
      <EmptyBox />
      <ContextAbout />
      <EmptyBox />
      <Context2 />
      <EmptyBox />
      <Challenge />
      <EmptyDiv />
      <Target />
      <EmptyBox />
      <QuoteAbout />
      <EmptyBox style={{ borderBottom: 'none' }} />
      <News />
      <FooterWrap />
    </div>
  )
}

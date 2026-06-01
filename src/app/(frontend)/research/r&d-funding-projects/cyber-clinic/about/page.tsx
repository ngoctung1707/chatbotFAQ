import About from '@/modules/cyber-clinic/views/sites/about/About'
import AosInit from './AosInit'

export default function page() {
  return (
    <main style={{ overflow: 'hidden' }}>
      <AosInit />
      <About />
    </main>
  )
}

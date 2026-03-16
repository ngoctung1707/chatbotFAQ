import Layout from '@/components/layout/Layout'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type Year = '2024' | '2025'

const reviewByYear: Record<Year, { title: string; pdfPath: string }> = {
  '2024': {
    title: 'Vietnam D-economy Review 2024',
    pdfPath: '/assets/doc/Vietnam%20D-economy%20Review%202024%20-%20Final%20v12.5.pdf',
  },
  '2025': {
    title: 'VIETNAM DIGITAL ECONOMY REVIEW 2025',
    pdfPath: '/assets/doc/CanEbook_VIETNAM%20DIGITAL%20ECONOMY%20REVIEW%202025.v3.2.pdf',
  },
}

type Args = {
  params: Promise<{
    year?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { year = '2024' } = await paramsPromise
  if (year !== '2024' && year !== '2025') {
    redirect('/get-involved/vietnam-digital-economy-review/2024')
  }

  const review = reviewByYear[year]
  return (
    <Layout>
      <section className="blog__details-area" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container">
          <div className="blog__inner-wrap">
            <div className="row">
              <div className="blog__details-wrap">
                <div className="blog__details-content">
                  <h1 style={{ marginBottom: '16px' }}>{review.title}</h1>
                  <iframe
                    title={review.title}
                    src={review.pdfPath}
                    style={{
                      width: '100%',
                      height: '80vh',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

import Layout from '@/components/layout/Layout'

const list = [
  {
    name: 'Prof. David Tran',
    title: 'University of Massachusetts Boston, US',
    role: 'Chairman',
  },
  {
    name: 'Prof. Hisham Farag',
    title: 'University of Birmingham, UK',
  },
  {
    name: 'Prof. Lim Kian Guan',
    title: 'Singapore Management University, Singapore',
  },
  {
    name: 'Prof. Vũ Minh Khương',
    title: 'National University of Singapore, Singapore',
  },
  {
    name: 'Mr. Kendrick Nguyen',
    title: 'CEO, Republic, US',
  },
  {
    name: 'Mr. Khoong Chan Meng',
    title: 'CEO, Institute of Systems Science, National University of Singapore (NUS), Singapore',
  },
]

export default function AdvisoryBoard() {
  return (
    <>
      <Layout breadcrumbTitle="Advisory Board">
        <section className="blog__details-area">
          <div className="container">
            <div className="about__list-box">
              <ul className="list-wrap">
                {list.map((item) => (
                  <li key={item.name} style={{ marginBottom: '15px' }}>
                    <i className="flaticon-user" />
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{item.name}</span>
                      <span style={{ fontSize: '18px' }}> ({item.title})</span>
                      {item.role && <span style={{ fontSize: '18px' }}> - {item.role}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}

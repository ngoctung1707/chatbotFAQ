import Layout from '@/components/layout/Layout'

const list = [
  {
    name: 'Vu Thi Thu Ha',
    title: 'Chief Accountant',
  },
  {
    name: 'Tran Minh Phuong',
    title: 'Accountant',
  },
  {
    name: 'Nguyen Thuy Hang',
    title: 'Office Manager',
  },
  {
    name: 'Nguyen Phuong Anh',
    title: 'Training Manager',
  },
  {
    name: 'Nguyen Cam Ly',
    title: 'Business Development',
  },
]

export default function BackOffice() {
  return (
    <>
      <Layout breadcrumbTitle="Back Office">
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

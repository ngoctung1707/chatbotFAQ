import Layout from '@/components/layout/Layout'

const list = [
  {
    name: 'Dr. Nguyen Van Cuong',
    title: 'Vice Chairman in Charge, Management Council of Vietnam Social Security',
    role: 'Chairman',
  },
  {
    name: 'Prof. David Tran',
    title: 'University of Massachusetts Boston, US',
    role: 'Vice Chairman',
  },
  {
    name: 'Dr. Doan Ha Thang',
    title: 'Chief of Office, Vietnam Space Committee, Ministry of Science and Technology',
    role: 'Vice Chairman',
  },
  {
    name: 'Prof. Hoang Van Cuong',
    title: "National Economics University, member of Prime Minister's Policy Advisory Council",
  },
  {
    name: 'Assoc. Prof. Nguyen Binh Minh',
    title: 'Dean, Institute for Digital Technology and Economy, HUST',
  },
  {
    name: 'Assoc. Prof. Nguyen Thi Xuan Hoa',
    title: 'Vice - Dean, Institute for Digital Technology and Economy, HUST',
  },
  {
    name: 'Assoc. Prof. Nguyen Thi Ngoc Anh',
    title: 'Faculty of Mathematics and Informatics, HUST',
  },
  {
    name: 'Dr. Do Ba Lam',
    title: 'School of Information and Communication Technology, HUST',
  },
  {
    name: 'Dr. Tran Van Dang',
    title: 'School of Information and Communication Technology, HUST',
    role: 'Secretary',
  },
  {
    name: 'Mr. Bui Quoc Khanh',
    title: 'Chairman & CEO of TNTech, ROX Group',
  },
  {
    name: 'Dr. Pham Thi Nguyen Nga',
    title: 'Director, Center for Data Management and Analytics, Orient Commercial Joint Stock Bank',
  },
]

export default function InstituteCouncil() {
  return (
    <>
      <Layout breadcrumbTitle="Institute Council">
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

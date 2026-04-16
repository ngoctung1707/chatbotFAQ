import Layout from '@/components/layout/Layout'

const Researchers = [
  {
    name: 'Assoc. Prof. Nguyen Thi Ngoc Anh',
    title: 'FAMI, HUST',
  },
  {
    name: 'Assoc. Prof. Ban Ha Bang',
    title: 'SoICT, HUST',
  },
  {
    name: 'Dr. Dao Thanh Chung',
  },
  {
    name: 'Dr. Tran Van Dang',
    title: 'SoICT, HUST',
  },
  {
    name: 'Dr. Nguyen Huu Duc',
    title: 'SoICT, HUST',
  },
  {
    name: 'Dr. Vu Van Thieu',
    title: 'SoICT, HUST',
  },
  {
    name: 'Dr. Tran Vinh Duc',
    title: 'SoICT, HUST',
  },
  {
    name: 'Dr. Trinh Tuan Dat',
    title: 'SoICT, HUST',
  },
  {
    name: 'Dr. Nguyen Thuc Huong Giang',
    title: 'SEM, HUST',
  },
  {
    name: 'Dr. Thai Minh Hanh',
    title: 'SEM, HUST',
  },
  {
    name: 'Dr. Ha Thi Thu Trang',
    title: 'SEM, HUST',
  },
  {
    name: 'Dr. Duong Manh Cuong',
    title: 'SEM, HUST',
  },
  {
    name: 'Dr. Nguyen Van Hanh',
    title: 'FAMI, HUST',
  },
  {
    name: 'Dr. Nguyen Huu Du',
    title: 'FAMI, HUST',
  },
  {
    name: 'Dr. Nguyen Trung Dung',
    title: 'FAMI, HUST',
  },
  { name: 'Dr. Tran Ngoc Thang', title: 'FAMI, HUST' },
]

const Assistants = [
  {
    name: 'Pham Thi Huong Quynh',
    title: 'Computer Engineering',
  },
  {
    name: 'Nguyen Minh Duc',
    title: 'Computer Engineering',
  },
  {
    name: 'Nguyen Phuong Anh',
    title: 'Logistics & Supply Chain Management',
  },
  {
    name: 'Nguyen Dac Viet Ha',
    title: 'Business Administration',
  },
]

export default function ResearchersAndAssistants() {
  return (
    <>
      <Layout breadcrumbTitle="Researchers & Assistants">
        <section className="blog__details-area">
          <div className="container">
            <div className="row">
              <div className="about__list-box col-lg-6 col-md-12 mb-5">
                <h4 style={{ marginBottom: '16px' }}>Researchers</h4>
                <ul className="list-wrap">
                  {Researchers.map((item) => (
                    <li key={item.name} style={{ marginBottom: '15px' }}>
                      <i className="flaticon-user" />
                      <div>
                        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{item.name}</span>
                        {item.title && <span style={{ fontSize: '18px' }}> ({item.title})</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="about__list-box col-lg-6 col-md-12">
                <h4 style={{ marginBottom: '16px' }}>Assistants</h4>
                <ul className="list-wrap">
                  {Assistants.map((item) => (
                    <li key={item.name} style={{ marginBottom: '15px' }}>
                      <i className="flaticon-user" />
                      <div>
                        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{item.name}</span>
                        {item.title && <span style={{ fontSize: '18px' }}> ({item.title})</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}

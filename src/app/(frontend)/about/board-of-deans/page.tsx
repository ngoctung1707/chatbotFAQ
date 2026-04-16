import Layout from '@/components/layout/Layout'

const list = [
  {
    name: 'Assoc. Prof. Nguyen Binh Minh',
    title: 'Dean',
    image: '/assets/img/member/minhnb.jpg',
  },
  {
    name: 'Assoc. Prof. Nguyen Thi Xuan Hoa',
    title: 'Vice-Dean',
    image: '/assets/img/member/hoantx.jpg',
  },
  {
    name: 'Dr. Do Ba Lam',
    title: 'Vice-Dean',
    image: '/assets/img/member/lamdb.png',
  },
]

export default function BoardOfDeans() {
  return (
    <>
      <Layout breadcrumbTitle="Board of Dean">
        <section className="blog__details-area">
          <div className="container">
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '50px',
              }}
            >
              {list.map((item) => (
                <div
                  key={item.name}
                  className="member-item"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '400px',
                  }}
                >
                  <div
                    className="member-image"
                    style={{
                      marginBottom: '15px',
                      height: '400px',
                      width: '300px',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '400px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  </div>
                  <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <h5 style={{ margin: '0', textAlign: 'center' }}>{item.name}</h5>
                    <p style={{ margin: '5px 0 0', textAlign: 'center' }}>{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}

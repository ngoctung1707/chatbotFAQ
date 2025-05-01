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
]

export default function BoardOfDeans() {
  return (
    <>
      <Layout breadcrumbTitle="Board of Dean">
        <section className="blog__details-area">
          <div className="container">
            <div
              className="member-flex-container"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '100px',
                justifyContent: 'center',
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
                  <div style={{ width: '400px', textAlign: 'center' }}>
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

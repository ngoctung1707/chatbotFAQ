import React from 'react'

const studentLifeData = [
  {
    title: 'Facilities',
    img: '/assets/img/student-life/hust.jpg',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    title: 'Activities',
    img: '/assets/img/student-life/activities.jpg',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    title: 'Communities',
    img: '/assets/img/student-life/communities.jpg',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
]

export default function Student() {
  return (
    <section className="project__area-two" id="student" style={{ position: 'relative' }}>
      <div className="container" data-aos="fade-up">
        <div className="row justify-content-center mb-4">
          <div className="section-title text-center">
            <h2 className="title">Student Life</h2>
          </div>
          <p style={{ maxWidth: 800, margin: '16px auto 0', textAlign: 'center' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. ut enim ad minim veniam
          </p>
        </div>
        <div className="row justify-content-center">
          {studentLifeData.map((item) => (
            <div className="col-md-4 d-flex flex-column align-items-center mb-4" key={item.title}>
              <div
                style={{
                  width: '100%',
                  maxWidth: 350,
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  style={{ width: '100%', height: 220, objectFit: 'cover' }}
                />
              </div>
              <h4 style={{ fontWeight: 700, color: '#2B2B6A', marginTop: 24, marginBottom: 12 }}>
                {item.title}
              </h4>
              <p style={{ textAlign: 'center', fontSize: 15, maxWidth: 340 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 0, right: 0, zIndex: -1 }}>
        <img src="/assets/img/project/h2_project_shape.png" alt="" />
      </div>
    </section>
  )
}

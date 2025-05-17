import React from 'react'

const studentLifeData = [
  {
    title: 'Facility',
    img: '/assets/img/student-life/hust.jpg',
    desc: 'Modern, tech-enabled learning spaces designed to support collaboration, innovation and hands-on practice.',
  },
  {
    title: 'Activity',
    img: '/assets/img/student-life/activities.jpg',
    desc: 'A dynamic calendar of workshops, lecturers and competitions that help students apply knowledge, develop skills and connect with industry experts.',
  },
  {
    title: 'Community',
    img: '/assets/img/student-life/communities.jpg',
    desc: 'A vibrant network of student clubs and interest groups where learners collaborate, explore emerging technologies and grow together.',
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
          <p style={{ maxWidth: 1000, margin: '16px auto 0', textAlign: 'center' }}>
            At the Institute for Digital Technology and Economy – HUST, student life is about more
            than just lectures. It’s about being part of a vibrant, forward-thinking community where
            students explore ideas, build skills, and grow personally and professionally.
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
              <p style={{ textAlign: 'center', fontSize: 15, maxWidth: 350 }}>{item.desc}</p>
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

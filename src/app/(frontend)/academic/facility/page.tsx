import Layout from '@/components/layout/Layout'
import React from 'react'

export default function Facility() {
  return (
    <Layout>
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="section-title text-center">
          <h2 className="title">OUR FACILITY</h2>
        </div>
        <p style={{ marginTop: 24, marginBottom: 24, textAlign: 'justify' }}>
          At the Institute for Digital Technology and Economy - HUST, we believe that a high-quality
          learning environment plays a crucial role in student success. Our facilities are designed
          to foster innovation, collaboration, and hands-on learning, providing students with the
          tools and spaces they need to thrive.
        </p>

        {/* Location 1: Ta Quang Buu Library Building */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            📍 Location: Ta Quang Buu Library Building
          </h2>
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
            }}
          >
            <iframe
              title="Map - Ta Quang Buu Library Building"
              src="https://www.google.com/maps?q=Ta+Quang+Buu+Library+Building&z=17&output=embed"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        {/* Location 2: HUST-MB Digital Hub */}
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            📍 Location: HUST-MB Digital Hub
          </h2>
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
            }}
          >
            <iframe
              title="Map - HUST-MB Digital Hub"
              src="https://www.google.com/maps?q=HUST-MB+Digital+Hub&z=17&output=embed"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <p style={{ textAlign: 'justify' }}>
          We are committed to continuously upgrading our facilities to meet the needs of today’s
          learners - preparing you not just for the classroom, but for the real world.
        </p>
      </div>
    </Layout>
  )
}

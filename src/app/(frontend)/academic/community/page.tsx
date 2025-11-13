import Layout from '@/components/layout/Layout'
import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getUserLocale } from '@/i18n/localeService'
import NewsCard from '@/components/news/NewsCard'
import CourseCard from '@/components/courses/CourseCard'

export default async function Community() {
  const payload = await getPayload({ config })
  const lang = await getUserLocale()

  const { docs: workshops } = await payload.find({
    collection: 'news',
    draft: false,
    limit: 3,
    pagination: false,
    sort: ['-publishedAt'],
    where: {
      tag: { in: ['workshop'] },
      lang: { equals: lang },
    },
  })

  const { docs: hackathons } = await payload.find({
    collection: 'news',
    draft: false,
    limit: 3,
    pagination: false,
    sort: ['-publishedAt'],
    where: {
      tag: { in: ['hackathon'] },
      lang: { equals: lang },
    },
  })

  const { docs: publicLectures } = await payload.find({
    collection: 'courses',
    draft: false,
    limit: 3,
    pagination: false,
    sort: ['-publishedAt'],
    where: {
      tag: { like: 'public-lecture' },
      lang: { equals: lang },
    },
  })

  return (
    <Layout>
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="section-title text-center">
          <h2 className="title">OUR COMMUNITY</h2>
        </div>
        <p style={{ marginTop: 24, marginBottom: 24, textAlign: 'justify' }}>
          At the Institute for Digital Technology and Economy - HUST, learning happens not just in
          the classroom but through the vibrant, supportive, and forward-thinking community that
          surrounds our students. We foster a culture of collaboration, creativity, and shared
          growth, where students can connect, lead, and thrive together.
        </p>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>🧠 Academic Workshops</h2>
          <div className="row justify-content-center gutter-24">
            {workshops.map((doc) => (
              <NewsCard doc={doc} key={doc.id} />
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>🎤 Public Lectures</h2>
          <div className="row justify-content-center gutter-24">
            {publicLectures.map((course) => (
              <CourseCard doc={course} key={course.id} />
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            ⚙️ Hackathons & Innovation Challenges
          </h2>
          <div className="row justify-content-center gutter-24">
            {hackathons.map((doc) => (
              <NewsCard doc={doc} key={doc.id} />
            ))}
          </div>
        </section>

        <p style={{ textAlign: 'justify' }}>
          Student participation in these activities is highly encouraged - not only to enhance
          academic learning, but also to develop confidence, creativity, and a future-ready mindset.
        </p>
        <p style={{ textAlign: 'justify' }}>
          <strong>📅 Stay Updated</strong>
          <br />
          Details of upcoming workshops, public lectures, and student activities are regularly
          updated in the Upcoming Events section of our website. Be sure to check it out and
          register early!
        </p>
      </div>
    </Layout>
  )
}

import Layout from '@/components/layout/Layout'
import { useTranslations } from 'next-intl'
import React from 'react'

export default function ClubPage() {
  const t = useTranslations('ClubPage')
  return (
    <Layout>
      <div className="container" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="section-title text-center">
          <h2 className="title">{t('title')}</h2>
        </div>

        <p style={{ marginTop: 16, textAlign: 'justify' }}>
          {t('slogan')}
          <br />
          {t('intro.question')}
          <br />
          {t('intro.answer')}
        </p>

        <section style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            {t('sections.structure.title')}
          </h3>
          <p style={{ textAlign: 'justify' }}>{t('sections.structure.desc')}</p>
          <p>
            <strong>{t('sections.structure.board')}</strong> {t('sections.structure.boardDesc')}
          </p>
          <p>
            <strong>{t('sections.structure.divisionsTitle')}</strong>
          </p>
          <ul className="space-y-2">
            <li>{t('sections.structure.divisions.0')}</li>
            <li>{t('sections.structure.divisions.1')}</li>
            <li>{t('sections.structure.divisions.2')}</li>
          </ul>
        </section>

        <section style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            {t('sections.guidelines.title')}
          </h3>
          <p style={{ textAlign: 'justify' }}>{t('sections.guidelines.desc')}</p>
          <ul className="space-y-2" style={{ marginTop: 12 }}>
            <li>{t('sections.guidelines.items.0')}</li>
            <li>{t('sections.guidelines.items.1')}</li>
            <li>{t('sections.guidelines.items.2')}</li>
            <li>{t('sections.guidelines.items.3')}</li>
            <li>{t('sections.guidelines.items.4')}</li>
          </ul>
        </section>

        <section style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            {t('sections.activities.title')}
          </h3>
          <p>{t('sections.activities.items.0')}</p>
          <p>{t('sections.activities.items.1')}</p>
          <p>{t('sections.activities.memberDevTitle')}</p>
          <ul className="space-y-2">
            <li>{t('sections.activities.memberDevItems.0')}</li>
            <li>{t('sections.activities.memberDevItems.1')}</li>
          </ul>
        </section>

        <section style={{ marginTop: 24 }}>
          <p style={{ textAlign: 'justify' }}>{t('sections.closing.desc1')}</p>
          <p style={{ fontStyle: 'italic', fontWeight: 600 }}>{t('sections.closing.desc2')}</p>
        </section>
      </div>
    </Layout>
  )
}

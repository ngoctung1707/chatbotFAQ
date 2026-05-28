'use client'
import Layout from '@/components/layout/Layout'
import React from 'react'
import { JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'
import { DefaultNodeTypes, SerializedUploadNode } from '@payloadcms/richtext-lexical'
import type { LearningMaterial, Media } from '@/payload-types'
import Header from '@/modules/cyber-clinic/layout/Header'
import Footer from '@/modules/cyber-clinic/layout/Footer'

type Props = {
  data: LearningMaterial
}

function CustomUploadComponent({ node }: { node: SerializedUploadNode }) {
  if (node.relationTo !== 'media') return null
  const uploadDoc = node.value
  if (typeof uploadDoc !== 'object') {
    return null
  }
  const { caption, url } = uploadDoc
  return (
    <figure className="text-center">
      <img alt={caption} src={url} className="mt-20" />
      <figcaption className="mt-20 mb-30">{caption}</figcaption>
    </figure>
  )
}

const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => <CustomUploadComponent node={node} />,
})

export default function LearningMaterialsPage({ data }: Props) {
  const heroImage = typeof data.heroImage === 'object' ? (data.heroImage as Media) : null
  const publishedAt = new Date(data.publishedAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return (
    <>
      <div style={{ backgroundColor: 'var(--cc-bg-page)' }}>
        <Header />
        <div className="container" style={{ padding: '80px 0' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '40px', lineHeight: '1.1' }}>
            {data.title}
          </h2>
          <RichText converters={jsxConverters} data={data.content}></RichText>
        </div>
      </div>
      <Footer />
    </>
  )
}

'use client'
import Layout from '@/components/layout/Layout'
import { News } from '@/payload-types'
import React from 'react'
import { JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'
import { DefaultNodeTypes, SerializedUploadNode } from '@payloadcms/richtext-lexical'

type Props = {
  data: News
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

export default function NewsPage({ data }: Props) {
  return (
    <>
      <Layout>
        <div>
          <section className="blog__details-area">
            <div className="container">
              <div className="blog__inner-wrap">
                <div className="row">
                  <div className="blog__details-wrap">
                    <div className="blog__details-content">
                      <div className="section-title text-center mb-50 tg-heading-subheading animation-style3">
                        <h2 className="title">{data.title}</h2>
                      </div>
                      <RichText converters={jsxConverters} data={data.content}></RichText>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  )
}

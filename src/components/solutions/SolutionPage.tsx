'use client'
import Layout from '@/components/layout/Layout'
import React from 'react'
import { JSXConvertersFunction, RichText } from '@payloadcms/richtext-lexical/react'
import { DefaultNodeTypes, SerializedUploadNode } from '@payloadcms/richtext-lexical'
import { Solution } from '@/payload-types'

type Props = {
  data: Solution
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

export default function SolutionPage({ data }: Props) {
  return (
    <>
      <Layout breadcrumbTitle={data.title}>
        <div>
          <section className="blog__details-area">
            <div className="container">
              <div className="blog__inner-wrap">
                <div className="row">
                  <div className="blog__details-wrap">
                    <div className="blog__details-content">
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

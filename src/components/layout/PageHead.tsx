import Head from 'next/head'

const PageHead = ({ headTitle }) => {
  return (
    <>
      <Head>
        <title>{headTitle ? headTitle : 'BKFintech'}</title>
      </Head>
    </>
  )
}

export default PageHead

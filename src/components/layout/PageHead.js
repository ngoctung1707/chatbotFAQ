import Head from 'next/head'

const PageHead = ({ headTitle }) => {
    return (
        <>
            <Head>
                <title>
                    {headTitle ? headTitle : "Apexa - Business Consulting NextJS Template"}
                </title>
            </Head>
        </>
    )
}

export default PageHead
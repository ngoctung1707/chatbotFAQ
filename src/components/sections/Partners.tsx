import { useTranslations } from 'next-intl'

type Partner = {
  name: string
  img: string
  logo: string
  desc: string
}

function PartnerCard({ name, img, logo, desc }: Partner) {
  return (
    <div className="project__item-two">
      <div
        className="project__thumb-two"
        style={{
          position: 'relative',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          borderRadius: 20,
        }}
      >
        <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div className="project__content-two" style={{ padding: '0px' }}>
        <h2 className="title" style={{ fontSize: '20px' }}>
          {name}
        </h2>
        <span style={{ fontSize: '14px', textAlign: 'justify' }}>{desc}</span>
      </div>
      <div style={{ position: 'relative', marginTop: -24 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 4px 4px rgba(0,0,0,0.08)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '14px 0px',
            margin: '0 auto',
            transform: 'translateY(-6px)',
            width: '250px',
          }}
        >
          <img src={logo} alt={`${name} logo`} style={{ height: 40, width: 'auto' }} />
        </div>
      </div>
    </div>
  )
}

export default function Partners() {
  const t = useTranslations('Partners')
  const partnerList = [
    {
      name: 'Rikkei',
      img: '/assets/img/partners/rikkei.jpeg',
      logo: '/assets/img/partners/rikkei-logo.png',
      desc: t('rikkei.desc'),
    },
    {
      name: 'MB Bank',
      img: '/assets/img/partners/mbbank.jpg',
      logo: '/assets/img/partners/mbbank-logo.png',
      desc: t('mbbank.desc'),
    },
    {
      name: 'Oraichain Labs',
      img: '/assets/img/partners/oraichain.jpg',
      logo: '/assets/img/partners/oraichain-logo.png',
      desc: t('oraichainlab.desc'),
    },
    {
      name: 'A-Star Group',
      img: '/assets/img/partners/astar.jpg',
      logo: '/assets/img/partners/astar-logo.png',
      desc: t('astargroup.desc'),
    },
    {
      name: 'TNTech',
      img: '/assets/img/partners/tntech.jpg',
      logo: '/assets/img/partners/tntech-logo.png',
      desc: t('tntech.desc'),
    },
    {
      name: 'Finxdemy',
      img: '/assets/img/partners/finxdemy.jpg',
      logo: '/assets/img/partners/finxdemy-logo.png',
      desc: t('finxdemy.desc'),
    },
  ]
  return (
    <>
      <section id="partners" className="project__area-two pt-120 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="section-title mb-35 tg-heading-subheading animation-style3 text-center">
                <h2 className="title tg-element-title">Partners</h2>
              </div>
            </div>
          </div>
          <div className="row gutter-24">
            {partnerList.map((partner) => (
              <div className="col-md-6 col-lg-4" key={partner.name}>
                <PartnerCard
                  name={partner.name}
                  img={partner.img}
                  logo={partner.logo}
                  desc={partner.desc}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

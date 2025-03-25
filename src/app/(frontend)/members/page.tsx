import Layout from '@/components/layout/Layout'
import Link from 'next/link'

export default function Member() {
  const members = [
    {
      name: 'PGS. TS. Nguyễn Bình Minh',
      avatar: 'minhnb',
      role: 'Viện trưởng',
    },
    {
      name: 'PGS. TS. Nguyễn Thị Xuân Hòa',
      avatar: 'hoantx',
      role: 'Phó Viện trưởng',
    },
    {
      name: 'PGS. TS. Trần Anh Đức',
      avatar: 'ducta',
      school: 'University of Massachusetts Boston',
    },
    {
      name: 'PGS. TS. Nguyễn Thị Ngọc Anh',
      avatar: 'anhntn',
    },
    {
      name: 'TS. Thái Minh Hạnh',
      avatar: 'hanhtm',
    },
    {
      name: 'TS. Đào Thành Chung',
      avatar: 'chungdt',
    },
    {
      name: 'ThS. Lê Trung Kiên',
      avatar: 'kienlt',
    },
    {
      name: 'TS. Trần Văn Đặng',
      avatar: 'dangtv',
    },
    {
      name: 'TS. Nguyễn Thúc Hương Giang',
      avatar: 'giangnth',
    },
    {
      name: 'TS. Hà Thị Thư Trang',
      avatar: 'tranghtt',
    },
    {
      name: 'TS. Nguyễn Hữu Đức',
      avatar: 'ducnh',
    },
    {
      name: 'TS. Đỗ Bá Lâm',
      avatar: 'lamdb',
    },
    {
      name: 'TS. Trần Vĩnh Đức',
      avatar: 'ductv',
    },
    {
      name: 'TS. Trịnh Tuấn Đạt',
      avatar: 'dattt',
    },

    {
      name: 'TS. Dương Mạnh Cường',
      avatar: 'cuongdm',
    },
    {
      name: 'TS. Nguyễn Văn Hạnh',
      avatar: 'hanhnv',
    },
    {
      name: 'TS. Nguyễn Hữu Du',
      avatar: 'dunh',
    },
    {
      name: 'TS. Nguyễn Trung Dũng',
      avatar: 'dungnt',
    },
    {
      name: 'TS. Trần Ngọc Thăng',
      avatar: 'thangtn',
    },
  ]
  return (
    <>
      <Layout headerStyle={0} footerStyle={0}>
        <div>
          <section className="team__area-three">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-xl-6">
                  <div className="section-title text-center mb-40 tg-heading-subheading animation-style3">
                    <h2 className="title tg-element-title">Our Members</h2>
                  </div>
                </div>
              </div>
              <div className="row gutter-24 justify-content-center">
                {members.map((member) => (
                  <div className="col-xl-3 col-lg-4 col-md-6 col-sm-8" key={member.avatar}>
                    <div className="team__item-three shine-animate-item">
                      <div
                        className="team__thumb-three shine-animate"
                        style={{
                          backgroundImage: 'url("/assets/img/member/background-member.svg")',
                          height: '382px',
                          display: 'flex',
                          flexDirection: 'column-reverse',
                        }}
                      >
                        <img
                          src={`/assets/img/member/${member.avatar}.png`}
                          alt=""
                          style={{ maxHeight: '300px', aspectRatio: '3/4' }}
                        />
                      </div>
                      <div className="team__content-three">
                        <h4 className="title">
                          <Link href="/team-details">{member.name}</Link>
                        </h4>
                        <span>{member.role}</span>
                      </div>
                      {/*<div className="team-social team__social-three">*/}
                      {/*  <SocialToggle />*/}
                      {/*</div>*/}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* team-area-three */}
          {/* brand-area */}
          {/*<div className="brand__area-six">*/}
          {/*  <div className="container">*/}
          {/*    <div className="swiper-container brand-active">*/}
          {/*      <BrandActiveSlider />*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</div>*/}
        </div>
      </Layout>
    </>
  )
}

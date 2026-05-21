import Slider from '@/modules/cyber-clinic/components/Slider'
import SplitText from '@/modules/cyber-clinic/components/SplitText'
import AutoIcon from '@/modules/cyber-clinic/icons/AutoIcon'
import BookIcon from '@/modules/cyber-clinic/icons/BookIcon'
import LocationIcon from '@/modules/cyber-clinic/icons/LocationIcon'
import PartnerIcon from '@/modules/cyber-clinic/icons/PartnerIcon'
import React from 'react'

export default function SliderBusiness() {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, #E6E6E6 100%)',
        padding: '160px 0 80px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="container" style={{ marginBottom: '60px' }}>
        <SplitText
          tag="h3"
          text={
            <>
              Vườn ươm Nhân lực <br /> An toàn Thông tin hướng tới
            </>
          }
          textAlign="center"
          style={{ width: '100%' }}
        />
        <h6
          style={{
            marginTop: '16px',
            fontWeight: 400,
            color: 'var(--cc-fg-secondary)',
            textAlign: 'center',
          }}
        >
          200 - 300 doanh nghiệp được hỗ trợ
        </h6>
      </div>
      <Slider
        items={[
          {
            key: '1',
            title: 'Doanh nghiệp nhỏ & siêu nhỏ (MSMEs)',
            description:
              'Doanh nghiệp đang trong quá trình chuyển đổi số và nâng cao năng lực vận hành.',
            icon: <BookIcon />,
            label: 'Doanh nghiệp nhỏ',
          },
          {
            key: '2',
            title: 'Hộ kinh doanh',
            description: 'Các mô hình kinh doanh cần hỗ trợ về quản lý số và bảo mật dữ liệu.',
            icon: <AutoIcon />,
            label: 'Hộ kinh doanh',
          },
          {
            key: '3',
            title: 'Doanh nghiệp xã hội',
            description:
              'Các tổ chức quan tâm đến phát triển bền vững và an toàn trong môi trường số.',
            icon: <PartnerIcon />,
            label: 'Doanh nghiệp xã hội',
          },
          {
            key: '4',
            title: 'Thuộc các địa bàn:',
            description: 'Hà Nội, Quảng Ninh, Điện Biên, Lào Cai, Thanh Hoá, Đà Nẵng, Cần Thơ',
            icon: <LocationIcon style={{ width: '40px', height: '40px' }} />,
            label: 'Địa bàn',
          },
        ]}
      />
    </div>
  )
}

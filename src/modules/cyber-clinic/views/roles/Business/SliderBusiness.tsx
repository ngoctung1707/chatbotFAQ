'use client'
import Slider from '@/modules/cyber-clinic/components/Slider'
import SplitText from '@/modules/cyber-clinic/components/SplitText'
import AutoIcon from '@/modules/cyber-clinic/icons/AutoIcon'
import ConvenienceStoreIcon from '@/modules/cyber-clinic/icons/ConvenienceStoreIcon'
import LocationIcon from '@/modules/cyber-clinic/icons/LocationIcon'
import PartnerIcon from '@/modules/cyber-clinic/icons/PartnerIcon'
import StoreIcon from '@/modules/cyber-clinic/icons/StoreIcon'
import React from 'react'

export default function SliderBusiness() {
  return (
    <div
      style={{
        background: 'var(--cc-bg-page)',
        paddingBottom: '80px',
        borderBottom: '1px solid var(--cc-border-medium)',
      }}
    >
      <div style={{ borderBottom: '1px solid var(--cc-border-medium)' }}>
        <div className="container">
          <div
            style={{
              width: '50%',
              padding: '80px 80px 80px 0',
              background: 'var(--cc-gradient-header)',
              borderRight: '1px solid #DF3414',
            }}
          >
            <SplitText
              tag="h3"
              text="Vườn ươm Nhân lực An toàn Thông tin hướng tới"
              textAlign="left"
            />
            <h6
              style={{
                marginTop: '16px',
                fontWeight: 400,
                color: 'var(--cc-fg-secondary)',
              }}
            >
              200 - 300 doanh nghiệp được hỗ trợ
            </h6>
          </div>
        </div>
      </div>
      <Slider
        items={[
          {
            key: '1',
            title: 'Doanh nghiệp nhỏ & siêu nhỏ (MSMEs)',
            description:
              'Doanh nghiệp đang trong quá trình chuyển đổi số và nâng cao năng lực vận hành.',
            icon: StoreIcon,
            label: 'Doanh nghiệp nhỏ',
          },
          {
            key: '2',
            title: 'Hộ kinh doanh',
            description: 'Các mô hình kinh doanh cần hỗ trợ về quản lý số và bảo mật dữ liệu.',
            icon: ConvenienceStoreIcon,
            label: 'Hộ kinh doanh',
          },
          {
            key: '3',
            title: 'Doanh nghiệp xã hội',
            description:
              'Các tổ chức quan tâm đến phát triển bền vững và an toàn trong môi trường số.',
            icon: PartnerIcon,
            label: 'Doanh nghiệp xã hội',
          },
          {
            key: '4',
            title: 'Thuộc các địa bàn:',
            description: 'Hà Nội, Quảng Ninh, Điện Biên, Lào Cai, Thanh Hoá, Đà Nẵng, Cần Thơ',
            icon: LocationIcon,
            label: 'Địa bàn',
          },
        ]}
      />
    </div>
  )
}

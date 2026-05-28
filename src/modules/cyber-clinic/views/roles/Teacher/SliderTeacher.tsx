'use client'
import Slider from '@/modules/cyber-clinic/components/Slider'
import SplitText from '@/modules/cyber-clinic/components/SplitText'
import AutoIcon from '@/modules/cyber-clinic/icons/AutoIcon'
import DictionaryIcon from '@/modules/cyber-clinic/icons/DictionaryIcon'
import PartnerIcon from '@/modules/cyber-clinic/icons/PartnerIcon'
import ShieldIcon from '@/modules/cyber-clinic/icons/ShieldIcon'
import TeacherIcon from '@/modules/cyber-clinic/icons/TeacherIcon'
import Image from 'next/image'
import React from 'react'
import ToTImg from '@/modules/cyber-clinic/imgs/decors/tot.jpg'

export default function SliderTeacher() {
  return (
    <div
      style={{
        background: 'var(--cc-bg-page)',
        borderBottom: '1px solid var(--cc-border-medium)',
        paddingBottom: '80px',
      }}
    >
      <div style={{ borderBottom: '1px solid var(--cc-border-medium)' }}>
        <div className="container">
          <div className="cc-teacher-hero">
            <div className="cc-teacher-hero-content">
              <SplitText tag="h3" text="Train-the-Trainer (ToT)" textAlign="left" />
              <h6
                style={{ color: 'var(--cc-fg-secondary)', fontWeight: 400, marginTop: '16px' }}
                data-aos="fade-up"
                data-aos-delay="200"
              >
                Chương trình ToT được xây dựng dành cho giảng viên và cán bộ đào tạo nhằm nâng cao
                năng lực chuyên môn, cập nhật phương pháp giảng dạy hiện đại và đồng hành cùng sinh
                viên, doanh nghiệp trong các hoạt động về an toàn thông tin và chuyển đổi số.
                <br />
                <br />
                Giảng viên hoàn thành chương trình sẽ được cấp chứng nhận Train-the-Trainer (ToT).
              </h6>
            </div>
            <div style={{ position: 'relative', padding: '40px' }}>
              <Image src={ToTImg} alt="ToT" className="cc-teacher-image" data-aos="zoom-in" />
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  width: '40px',
                  height: '100%',
                  border: '1px solid var(--cc-border-medium)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '40px',
                  height: '100%',
                  border: '1px solid var(--cc-border-medium)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '40px',
                  border: '1px solid var(--cc-border-medium)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  width: '100%',
                  height: '40px',
                  border: '1px solid var(--cc-border-medium)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <Slider
        items={[
          {
            key: '1',
            title: 'Chuyên môn an toàn thông tin',
            description:
              'Nâng cao kiến thức về an toàn thông tin, quản trị rủi ro và bảo mật dữ liệu trong môi trường số.',
            icon: ShieldIcon,
            label: 'Chuyên môn',
          },
          {
            key: '2',
            title: 'Phương pháp giảng dạy hiện đại',
            description:
              'Tiếp cận mô hình học tập tích cực, blended learning và mentoring theo định hướng thực hành.',
            icon: DictionaryIcon,
            label: 'Phương pháp',
          },
          {
            key: '3',
            title: 'Hướng dẫn & mentoring',
            description:
              'Đồng hành cùng sinh viên trong hoạt động học tập, thực hành và hỗ trợ doanh nghiệp.',
            icon: TeacherIcon,
            label: 'Hướng dẫn',
          },
          {
            key: '4',
            title: 'Vận hành mô hình Cyber Clinic',
            description:
              'Tìm hiểu quy trình triển khai, phối hợp và hỗ trợ trong mô hình đào tạo và chia sẻ tri thức.',
            icon: AutoIcon,
            label: 'Vận hành',
          },
          {
            key: '5',
            title: 'Kết nối doanh nghiệp',
            description:
              'Tham gia các hoạt động hỗ trợ doanh nghiệp và thúc đẩy chuyển đổi số an toàn.',
            icon: PartnerIcon,
            label: 'Kết nối',
          },
        ]}
      />
    </div>
  )
}

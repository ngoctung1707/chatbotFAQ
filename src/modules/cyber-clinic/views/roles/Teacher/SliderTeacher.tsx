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
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, #E6E6E6 100%)',
        padding: '160px 0 80px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="container" style={{ marginBottom: '80px' }}>
        <div className="cc-teacher-hero">
          <Image
            src={ToTImg}
            alt="ToT"
            className="cc-teacher-image"
            style={{ borderRadius: '24px' }}
            data-aos="fade-right"
          />
          <div>
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
        </div>
      </div>
      <Slider
        items={[
          {
            key: '1',
            title: 'Chuyên môn an toàn thông tin',
            description:
              'Nâng cao kiến thức về an toàn thông tin, quản trị rủi ro và bảo mật dữ liệu trong môi trường số.',
            icon: <ShieldIcon />,
            label: 'Chuyên môn',
          },
          {
            key: '2',
            title: 'Phương pháp giảng dạy hiện đại',
            description:
              'Tiếp cận mô hình học tập tích cực, blended learning và mentoring theo định hướng thực hành.',
            icon: <DictionaryIcon />,
            label: 'Phương pháp',
          },
          {
            key: '3',
            title: 'Hướng dẫn & mentoring',
            description:
              'Đồng hành cùng sinh viên trong hoạt động học tập, thực hành và hỗ trợ doanh nghiệp.',
            icon: <TeacherIcon />,
            label: 'Hướng dẫn',
          },
          {
            key: '4',
            title: 'Vận hành mô hình Cyber Clinic',
            description:
              'Tìm hiểu quy trình triển khai, phối hợp và hỗ trợ trong mô hình đào tạo và chia sẻ tri thức.',
            icon: <AutoIcon />,
            label: 'Vận hành',
          },
          {
            key: '5',
            title: 'Kết nối doanh nghiệp',
            description:
              'Tham gia các hoạt động hỗ trợ doanh nghiệp và thúc đẩy chuyển đổi số an toàn.',
            icon: <PartnerIcon />,
            label: 'Kết nối',
          },
        ]}
      />
    </div>
  )
}

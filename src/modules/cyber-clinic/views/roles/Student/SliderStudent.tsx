import Slider from '@/modules/cyber-clinic/components/Slider'
import SplitText from '@/modules/cyber-clinic/components/SplitText'
import AutoIcon from '@/modules/cyber-clinic/icons/AutoIcon'
import BookIcon from '@/modules/cyber-clinic/icons/BookIcon'
import CertIcon from '@/modules/cyber-clinic/icons/CertIcon'
import PartnerIcon from '@/modules/cyber-clinic/icons/PartnerIcon'
import TrendingIcon from '@/modules/cyber-clinic/icons/TrendingIcon'
import React from 'react'

export default function SliderStudent() {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, #E6E6E6 100%)',
        padding: '160px 0 80px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="container">
        <SplitText
          tag="h3"
          text={
            <>
              Vườn ươm Nhân lực An toàn Thông tin tại <br /> Đại học Bách khoa Hà Nội hướng tới một
              môi trường <br /> học tập và thực hành giúp sinh viên:
            </>
          }
          textAlign="center"
          style={{ marginBottom: '60px', width: '100%' }}
        />
      </div>
      <Slider
        items={[
          {
            key: '1',
            title: 'Học tập',
            description:
              'Tiếp cận kiến thức về an toàn thông tin, quản trị rủi ro và bảo mật dữ liệu thông qua chương trình đào tạo kết hợp giữa lý thuyết, tình huống thực tế và học liệu số được xây dựng theo định hướng ứng dụng.',
            icon: <BookIcon />,
            label: 'Học tập',
          },
          {
            key: '2',
            title: 'Trải nghiệm',
            description:
              'Tham gia các hoạt động thực hành, phân tích tình huống và hỗ trợ doanh nghiệp trong quá trình chuyển đổi số dưới sự đồng hành của giảng viên, mentor và chuyên gia trong lĩnh vực an toàn thông tin.',
            icon: <AutoIcon />,
            label: 'Trải nghiệm',
          },
          {
            key: '3',
            title: 'Phát triển',
            description:
              'Rèn luyện kỹ năng giao tiếp, làm việc nhóm, tư duy phản biện và tác phong chuyên nghiệp; đồng thời xây dựng định hướng nghề nghiệp trong môi trường công nghệ và chuyển đổi số.',
            icon: <TrendingIcon />,
            label: 'Phát triển',
          },
          {
            key: '4',
            title: 'Chứng nhận',
            description:
              'Sinh viên hoàn thành chương trình sẽ được cấp chứng nhận đào tạo và ghi nhận quá trình tham gia các hoạt động học tập, thực hành và hỗ trợ doanh nghiệp.',
            icon: <CertIcon />,
            label: 'Chứng nhận',
          },
          {
            key: '5',
            title: 'Cơ hội phát triển chuyên sâu',
            description:
              'Những học viên nổi bật có cơ hội tham gia các chương trình nâng cao, kết nối với mentor, chuyên gia và mở rộng định hướng nghề nghiệp trong lĩnh vực chuyển đổi số.',
            icon: <PartnerIcon />,
            label: 'Cơ hội',
          },
        ]}
      />
    </div>
  )
}

import React from 'react'
import ShieldIcon from '../icons/ShieldIcon'
import BagIcon from '../icons/BagIcon'
import GraduatedIcon from '../icons/GraduatedIcon'
import Card from '../components/Card'
import Icon from '../components/Icon'

const PROBLEM_CARDS = [
  {
    icon: <ShieldIcon />,
    text: 'Nhân lực an toàn thông tin đang thiếu hụt nghiêm trọng',
  },
  {
    icon: <BagIcon />,
    text: 'Nhiều doanh nghiệp chưa có đủ năng lực bảo mật',
  },
  {
    icon: <GraduatedIcon />,
    text: 'Sinh viên có kiến thức nhưng ít cơ hội làm việc thực tế',
  },
]

export default function Context() {
  return (
    <div
      style={{
        background: 'var(--cc-gradient-bg)',
        paddingTop: '160px',
        paddingBottom: '80px',
      }}
    >
      <div className="container">
        <div className="cc-context-header">
          <div className="cc-context-header__label">
            <span
              style={{
                width: '12px',
                height: '12px',
                background: 'var(--cc-border-medium)',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '8px',
              }}
            />
            <span
              style={{
                fontWeight: 400,
                fontSize: '18px',
                color: 'var(--cc-fg-primary)',
                textTransform: 'uppercase',
              }}
            >
              THỊ TRƯỜNG ĐANG DẦN THAY ĐỔI...
            </span>
          </div>
          <h3 className="cc-context-header__title">
            Chuyển đổi số đang tăng tốc.
            <br /> Doanh nghiệp phụ thuộc nhiều hơn vào dữ liệu và công nghệ và cùng với đó là những
            rủi ro an ninh mạng ngày một gia tăng.
          </h3>
        </div>
        <p style={{ fontSize: '18px', color: 'var(--cc-fg-primary)' }}>Trong khi đó:</p>
        <div className="cc-context-items">
          {PROBLEM_CARDS.map((item, index) => (
            <Card key={index} style={{ height: '100%' }}>
              <Icon>{item.icon}</Icon>
              <h5 style={{ marginTop: '24px', marginBottom: 0, color: 'var(--cc-fg-primary)' }}>
                {item.text}
              </h5>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

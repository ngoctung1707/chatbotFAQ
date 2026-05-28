'use client'
import React from 'react'
import { Role } from '../../constants'
import Icon from '../../components/Icon'
import IconPrimary from '../../components/IconPrimary'
import SplitText from '../../components/SplitText'
import AddIcon from '../../icons/AddIcon'
import RemoveIcon from '../../icons/RemoveIcon'

const RoleInfo: {
  [key in Role]: {
    faq: {
      question: string
      answer: string
    }[]
  }
} = {
  student: {
    faq: [
      {
        question: 'Sinh viên sẽ học tập và thực hành theo hình thức nào?',
        answer:
          'Chương trình kết hợp giữa đào tạo trực tuyến, học tập trực tiếp, mentoring và thực hành thông qua các tình huống thực tế cùng giảng viên, mentor và chuyên gia.',
      },
      {
        question: 'Sinh viên có cần đóng phí khi tham gia chương trình không?',
        answer:
          'Không. Chương trình được triển khai trong khuôn khổ dự án viện trợ không hoàn lại từ Quỹ Châu Á (The Asia Foundation), nhằm hỗ trợ đào tạo và phát triển năng lực cho sinh viên.',
      },
      {
        question: 'Sau khi hoàn thành chương trình, sinh viên có được cấp chứng nhận không?',
        answer:
          'Sinh viên hoàn thành các nội dung đào tạo và hoạt động thực hành của chương trình sẽ được cấp chứng nhận hoàn thành chương trình.',
      },
      {
        question: 'Chương trình có hỗ trợ định hướng phát triển nghề nghiệp không?',
        answer:
          'Bên cạnh hoạt động đào tạo và thực hành, chương trình còn tạo cơ hội để sinh viên kết nối với mentor, chuyên gia và cộng đồng chuyên môn trong lĩnh vực an toàn thông tin và chuyển đổi số.',
      },
    ],
  },
  teacher: {
    faq: [
      {
        question: 'Giảng viên tham gia chương trình sẽ đảm nhiệm vai trò gì?',
        answer:
          'Giảng viên sẽ đồng hành trong các hoạt động đào tạo, mentoring sinh viên và hỗ trợ doanh nghiệp về an toàn thông tin, bảo mật dữ liệu và chuyển đổi số trong khuôn khổ chương trình.',
      },
      {
        question: 'Giảng viên có được cấp chứng nhận sau chương trình không?',
        answer:
          'Giảng viên hoàn thành chương trình đào tạo sẽ được cấp chứng nhận Train-the-Trainer (ToT) của chương trình.',
      },
      {
        question: 'Chương trình có cung cấp học liệu và tài nguyên đào tạo không?',
        answer:
          'Chương trình xây dựng hệ thống học liệu số, tài nguyên đào tạo và case study thực tế nhằm hỗ trợ hoạt động giảng dạy, mentoring và học tập.',
      },
      {
        question: 'Giảng viên có cơ hội kết nối với doanh nghiệp và chuyên gia không?',
        answer:
          'Thông qua các hoạt động đào tạo và hỗ trợ cộng đồng, giảng viên có cơ hội kết nối với mạng lưới chuyên gia, doanh nghiệp và các đơn vị đồng hành trong lĩnh vực an toàn thông tin và chuyển đổi số.',
      },
    ],
  },
  business: {
    faq: [
      {
        question: 'Doanh nghiệp sẽ nhận được những hình thức hỗ trợ nào?',
        answer:
          'Doanh nghiệp có thể được hỗ trợ nâng cao nhận thức về an toàn thông tin, bảo mật dữ liệu, quản lý số và nhận diện các rủi ro cơ bản trong quá trình vận hành và chuyển đổi số.',
      },
      {
        question: 'Hoạt động hỗ trợ được triển khai theo hình thức nào?',
        answer:
          'Tùy theo điều kiện thực tế và nhu cầu của doanh nghiệp, hoạt động hỗ trợ có thể được triển khai trực tiếp tại doanh nghiệp hoặc trực tuyến thông qua nền tảng của chương trình.',
      },
      {
        question: 'Doanh nghiệp có phải trả chi phí khi tham gia chương trình không?',
        answer:
          'Không. Các hoạt động hỗ trợ trong khuôn khổ dự án được triển khai theo định hướng hỗ trợ cộng đồng và nâng cao năng lực cho doanh nghiệp tham gia chương trình.',
      },
    ],
  },
}

export default function Faq({ userKey }: { userKey: Role }) {
  const roleInfo = RoleInfo[userKey ?? 'student']
  const { faq } = roleInfo
  const [openIndexes, setOpenIndexes] = React.useState<number[]>([])
  const answerRefs = React.useRef<(HTMLDivElement | null)[]>([])

  const handleToggle = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index],
    )
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--cc-bg-page)',
        borderTop: '1px solid var(--cc-border-medium)',
        borderBottom: '1px solid var(--cc-border-medium)',
      }}
    >
      <div className="container cc-roadmap-layout">
        <div className="cc-roadmap-left">
          {/* Section label */}
          <div style={{ marginBottom: '16px' }}>
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
              FAQs
            </span>
          </div>

          {/* Heading */}
          <SplitText tag="h3" text="Câu hỏi thường gặp" textAlign="left" />
        </div>
        <div
          className="cc-roadmap-right"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            borderLeft: '1px solid var(--cc-border-medium)',
            borderRight: '1px solid var(--cc-border-medium)',
          }}
        >
          {faq.map((item, index) => {
            const isOpen = openIndexes.includes(index)
            const contentHeight = answerRefs.current[index]?.scrollHeight ?? 0

            return (
              <div
                key={`${item.question}-${index}`}
                className="cc-faq-question-wrapper"
                style={{
                  borderBottom:
                    index < faq.length - 1 ? '1px solid var(--cc-border-medium)' : 'none',
                }}
              >
                <div
                  onClick={() => handleToggle(index)}
                  style={{
                    width: '100%',
                    padding: '32px',
                    background: isOpen ? '#FFFFFFCC' : '#FFF0EF80',
                    cursor: 'pointer',
                    transition: 'background 250ms ease, box-shadow 250ms ease',
                  }}
                  role="button"
                  aria-expanded={isOpen}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '24px',
                      borderBottom: isOpen
                        ? '1px solid var(--cc-border-medium)'
                        : '1px solid transparent',
                      paddingBottom: isOpen ? '24px' : '0',
                    }}
                  >
                    <h5
                      style={{
                        color: 'var(--cc-fg-primary)',
                      }}
                    >
                      {item.question}
                    </h5>
                    <div style={{ width: '60px' }}>
                      {isOpen ? (
                        <Icon
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '0px',
                            border: '2.73px solid #1C1B1F0D',
                          }}
                        >
                          <RemoveIcon />
                        </Icon>
                      ) : (
                        <IconPrimary
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '0px',
                            border: '2.73px solid #BC13230D',
                          }}
                        >
                          <AddIcon />
                        </IconPrimary>
                      )}
                    </div>
                  </div>

                  <div
                    ref={(el) => {
                      answerRefs.current[index] = el
                    }}
                    style={{
                      maxHeight: isOpen ? `${contentHeight}px` : '0px',
                      opacity: isOpen ? 1 : 0,
                      transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
                      overflow: 'hidden',
                      transition: 'max-height 320ms ease, opacity 240ms ease, transform 240ms ease',
                    }}
                  >
                    <p
                      style={{
                        marginTop: '16px',
                        lineHeight: '1.5',
                        color: 'var(--cc-fg-secondary)',
                      }}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

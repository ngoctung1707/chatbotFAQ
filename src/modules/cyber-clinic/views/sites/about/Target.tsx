import React from 'react'
import SplitText from '../../../components/SplitText'
import Icon from '@/modules/cyber-clinic/components/Icon'
import ShieldIcon from '@/modules/cyber-clinic/icons/ShieldIcon'
import AutoIcon from '@/modules/cyber-clinic/icons/AutoIcon'


export default function Target() {
    return (
        <div
            style={{
            width: '100%',
            paddingTop: '160px',
            paddingBottom: '80px',
            borderTopLeftRadius: '60px',
            borderTopRightRadius: '60px',
            backgroundColor: 'var(--cc-bg-page, #F3F7F8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '60px',
        }}
        >
            <div
            className="container"
            style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '60px',
            width: '100%',
            }}
        >
            <div
            style={{
                maxWidth: '1280px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px',
                textAlign: 'center',
            }}
            >
            <div
                style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                }}
            >
                <span
                style={{
                    width: '12px',
                    height: '12px',
                    background: 'var(--Schemes-Outline-Variant, #CCCCCC)',
                    borderRadius: '50%',
                    display: 'inline-block',
                }}
                />
                <span
                style={{
                    fontWeight: 400,
                    fontSize: '18px',
                    color: 'var(--cc-fg-primary)',
                }}
                >
                Mục tiêu
                </span>
            </div>
            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SplitText
                tag="h2"
                text={
                    <>
                    Mục tiêu của dự án
                    </>
                }
                textAlign="center"
                style={{ color: '#151357' }}
                />
                <p
                style={{
                    color: 'var(--cc-fg-secondary)',
                    fontSize: '18px',
                    lineHeight: '1.6',
                    margin: 0,
                }}
                >
                Với sự đồng hành của Quỹ Châu Á tại Việt Nam (TAF), Hội đồng Doanh nhân nữ Việt <br />
                Nam (VWEC) triển khai Dự án hỗ trợ các doanh nghiệp do phụ nữ làm chủ nâng cao <br />
                năng lực chuyển đổi số và bảo đảm an toàn thông tin, an ninh mạng với các mục tiêu <br/>
                trọng tâm:
                </p>
            </div>
            </div>

            {/* Khối 3 ô mục tiêu */}
            <div
            style={{
                width: '100%',
                maxWidth: '1280px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px',
            }}
            >
            {/* Ô 1 */}
            <div
                style={{
                background: '#FFFFFF80',
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                }}
            >
                <Icon>
                <AutoIcon />
                </Icon>
                <h4 style={{ margin: 0, color: 'var(--cc-fg-primary)' }}>Nâng cao năng lực<br />thích ứng</h4>
                <div
                style={{
                    width: '100%',
                    height: '1px',
                    background:
                    'repeating-linear-gradient(to right, #d0d0d0 0 6px, transparent 6px 12px)',
                }}
                />
                <p style={{ margin: 0, color: 'var(--cc-fg-secondary)', lineHeight: '1.6', fontSize: '18px' }}>
                Cung cấp thông tin, nâng cao nhận thức <br />
                cho các nữ lãnh đạo doanh nghiệp về <br />
                ứng dụng hiệu quả công nghệ số để <br />
                nâng cao năng lực cạnh tranh.
                </p>
            </div>

            {/* Ô 2 */}
            <div
                style={{
                background: '#FFFFFF80',
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                }}
            >
                <Icon>
                <ShieldIcon />
                </Icon>
                <h4 style={{ margin: 0, color: 'var(--cc-fg-primary)' }}>Trang bị kĩ năng số và<br /> an ninh mạng</h4>
                <div
                style={{
                    width: '100%',
                    height: '1px',
                    background:
                    'repeating-linear-gradient(to right, #d0d0d0 0 6px, transparent 6px 12px)',
                }}
                />
                <p style={{ margin: 0, color: 'var(--cc-fg-secondary)', lineHeight: '1.6', fontSize: '18px' }}>
                Giúp doanh nhân nữ tự tin vận hành <br />
                doanh nghiệp trước các mối đe dọa trên <br />
                không gian mạng.
                </p>
            </div>
            {/* Ô 3 */}
            <div
                style={{
                background: '#FFFFFF80',
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                }}
            >
                <Icon>
                <AutoIcon />
                </Icon>
                <h4 style={{ margin: 0, color: 'var(--cc-fg-primary)' }}>Góp phần hiện thực hóa<br /> mục tiêu quốc gia</h4>
                <div
                style={{
                    width: '100%',
                    height: '1px',
                    background:
                    'repeating-linear-gradient(to right, #d0d0d0 0 6px, transparent 6px 12px)',
                }}
                />
                <p style={{ margin: 0, color: 'var(--cc-fg-secondary)', lineHeight: '1.6', fontSize: '18px' }}>
                Thực hiện có hiệu quả các chủ trương <br />
                 của Đảng và Nhà nước trong phát triển <br />
                 kinh tế – xã hội, xây dựng đội ngũ <br />
                 doanh nhân nữ vững mạnh, có khả năng <br />
                 thích ứng linh hoạt trong kỷ nguyên số.
                </p>
            </div>
            </div>
        </div>
    </div>
    )
}
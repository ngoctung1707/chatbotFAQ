import React from 'react'
import SplitText from '../../../components/SplitText'


export default function ContextAbout() {
    const boxRailWrapStyle: React.CSSProperties = {
        width: '100%',
        maxWidth: 'var(--cc-about-box-max)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0',
        boxSizing: 'border-box',
    }

    const horizontalLineStyle: React.CSSProperties = {
        width: '100dvw',
        marginLeft: 'calc(50% - 50dvw)',
        marginRight: 'calc(50% - 50dvw)',
        borderTop: '1px solid var(--cc-border-medium)',
        boxSizing: 'border-box',
    }

    const boxStyle: React.CSSProperties = {
        width: '100%',
        minHeight: 'clamp(360px, 52vw, 484px)',
        display: 'flex',
        boxSizing: 'border-box',
        overflow: 'hidden',
    }

    const contentStyle: React.CSSProperties = {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'var(--cc-bg-card)',
        boxSizing: 'border-box',
    }

    return (
        <div
            style={{
                width: '100%',
                paddingTop: '0',
                paddingBottom: '0',
                borderTopLeftRadius: '60px',
                borderTopRightRadius: '60px',
                backgroundColor: 'var(--cc-bg-page)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0',
                position: 'relative',
                zIndex: 2,
                marginTop: 0,
            }}
        >
            <div className="cc-about-section-rail-left" />
            <div className="cc-about-section-rail-right" />

            <div
                className="container"
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'clamp(40px, 6vw, 80px)',
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                <div className="cc-about-context-box" style={boxRailWrapStyle}>
                    <div style={horizontalLineStyle} />

                    <div style={boxStyle}>
                        <div className="cc-about-context-content" style={contentStyle}>
                            <SplitText
                                tag="h2"
                                text="An ninh mạng – nền tảng vững chắc để tăng trưởng trong nền kinh tế số"
                                textAlign="center"
                                style={{
                                    color: 'var(--cc-fg-heading)',
                                    marginBottom: 'var(--cc-space-4)',
                                }}
                            />
                            <p className="lead">
                                Trong bối cảnh Việt Nam thúc đẩy tăng trưởng kinh tế bền vững gắn với chuyển đổi số, việc
                                triển khai hiệu quả Nghị quyết số 57-NQ/TW ngày 22/12/2024 của Bộ Chính trị về đột phá phát
                                triển khoa học, công nghệ, đổi mới sáng tạo và chuyển đổi số quốc gia đã đặt ra yêu cầu cấp
                                thiết về nâng cao năng lực an ninh mạng cho doanh nghiệp. Nhận thức rõ điều này, các hoạt
                                động trong khuôn khổ dự án được triển khai nhằm hỗ trợ doanh nhân nữ chủ động nắm bắt cơ hội
                                từ nền kinh tế số, đồng thời nâng cao năng lực nhận diện và ứng phó hiệu quả với những thách
                                thức trên môi trường số.
                            </p>
                        </div>
                    </div>

                    <div style={horizontalLineStyle} />
                </div>

                <div className="cc-about-context-box" style={boxRailWrapStyle}>
                    <div style={horizontalLineStyle} />

                    <div style={boxStyle}>
                        <div className="cc-about-context-content" style={contentStyle}>
                            <SplitText
                                tag="h2"
                                text="Khẳng định vị thế và quyền năng kinh tế của phụ nữ Việt Nam"
                                textAlign="center"
                                style={{
                                    color: 'var(--cc-fg-heading)',
                                    marginBottom: 'var(--cc-space-4)',
                                }}
                            />
                            <p className="lead">
                                Hiện nay doanh nghiệp do phụ nữ làm chủ chiếm khoảng 24% tổng số doanh nghiệp của Việt Nam.
                                Các doanh nghiệp do phụ nữ làm chủ không chỉ đóng góp đáng kể vào tăng trưởng kinh tế và tạo
                                việc làm, mà còn thể hiện vai trò tiên phong trong chăm lo đời sống người lao động, tham gia
                                các hoạt động cộng đồng và thúc đẩy bình đẳng giới trong kinh doanh.
                            </p>
                        </div>
                    </div>

                    <div style={horizontalLineStyle} />
                </div>
            </div>
        </div>
    )
}
import React from 'react'
import Image from 'next/image'
import FbIcon from '../icons/FbIcon'
import MailIcon from '../icons/MailIcon'
import LocationIcon from '../icons/LocationIcon'
import bkfintechLogo from '../imgs/logos/BKFintech.png'
import googleLogo from '../imgs/logos/Google.png'
import Link from 'next/link'

export default function Footer() {
  return (
    <div className="cc-footer">
      <div className="cc-footer-inner" style={{ position: 'relative', zIndex: 2 }}>
        <div className="cc-footer-top">
          {/* Column 1 */}
          <div className="cc-footer-col1">
            <h5
              style={{
                maxWidth: '320px',
                color: 'var(--cc-fg-primary)',
              }}
            >
              Chương trình Vườn ươm <br />
              Nhân lực An toàn Thông tin
            </h5>
            <div className="cc-footer-col1-divider"></div>
            <Image
              src={bkfintechLogo}
              alt="BKFintech"
              height={60}
              className="cc-footer-col1-logo"
            />
          </div>

          {/* Mobile Divider */}
          <div className="cc-footer-mobile-divider" style={{ width: '100%' }}></div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#595959' }}>Liên hệ</h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <MailIcon style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '14px', color: 'var(--cc-fg-primary)', fontWeight: 600 }}>
                cyberclinic@bkfin.tech
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <LocationIcon style={{ flexShrink: 0 }} />
              <span
                style={{
                  fontSize: '14px',
                  color: 'var(--cc-fg-primary)',
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                Phòng 609, Thư viện Tạ Quang Bửu, Đại học Bách khoa Hà Nội
              </span>
            </div>
          </div>

          {/* Column 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#595959' }}>Mạng xã hội</h4>
            <Link
              href={'https://www.facebook.com/cyberclinic.hust'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}>
                <FbIcon style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: 'var(--cc-fg-primary)', fontWeight: 600 }}>
                  Facebook
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed var(--cc-border-medium)', margin: '24px 0' }}></div>

        {/* Bottom */}
        <div className="cc-footer-bottom">
          <div style={{ fontSize: '14px', color: '#595959', fontWeight: 500 }}>
            ©2026 Copyright © BKFintech | All Right Reserved
          </div>
          <div className="cc-footer-bottom-right">
            <Image
              src={googleLogo}
              alt="Google.org"
              height={40}
              style={{ width: 'auto', height: '40px' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import Menu from "../Menu"
import MobileMenu from "../MobileMenu"
import OffcanvusMenu from "../OffcanvusMenu"
import SearchPopup from "../SearchPopup"

export default function Header2({ scroll, isMobileMenu, handleMobileMenu, transparent, isSearch, isOffcanvus, handleOffcanvus, handleSearch }) {
    return (
        <>
            <div id="header-fixed-height" />
            <header className="tg-header__style-two">
                <div className="tg-header__inner-wrap">
                    <div className="tg-header__logo-wrap">
                        <div className="logo">
                            <Link href="/"><img src="/assets/img/logo/logo.png" alt="Logo" /></Link>
                        </div>
                    </div>
                    <div className="tg-header__right-side">
                        <div className="tg-header__top tg-header__top-two">
                            <div className="row">
                                <div className="col-lg-6">
                                    <ul className="tg-header__top-info tg-header__top-info-two list-wrap">
                                        <li><i className="flaticon-phone-call" /><Link href="tel:0123456789">+123 9898 500</Link></li>
                                        <li><i className="flaticon-pin" />256 Avenue, Mark Street, NewYork City</li>
                                    </ul>
                                </div>
                                <div className="col-lg-6">
                                    <ul className="tg-header__top-right tg-header__top-right-two list-wrap">
                                        <li><i className="flaticon-envelope" /><Link href="mailto:info@apexa.com">info@apexa.com</Link></li>
                                        <li><i className="flaticon-time" />Mon-Fri: 10:00am - 09:00pm</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div id="sticky-header" className={`tg-header__area tg-header__area-two ${scroll ? "sticky-menu" : ""}`}>
                            <div className="row">
                                <div className="col-12">
                                    <div className="tgmenu__wrap">
                                        <nav className="tgmenu__nav">
                                            <div className="logo d-none">
                                                <Link href="/"><img src="/assets/img/logo/logo.png" alt="Logo" /></Link>
                                            </div>
                                            <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-lg-flex">
                                                <Menu />
                                            </div>
                                            <div className="tgmenu__action tgmenu__action-two d-none d-md-block">
                                                <ul className="list-wrap">
                                                    <li className="header-search" onClick={handleSearch}>
                                                        <a className="search-open-btn">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none">
                                                                <path d="M19 19.0002L14.657 14.6572M14.657 14.6572C15.3999 13.9143 15.9892 13.0324 16.3912 12.0618C16.7933 11.0911 17.0002 10.0508 17.0002 9.00021C17.0002 7.9496 16.7933 6.90929 16.3913 5.93866C15.9892 4.96803 15.3999 4.08609 14.657 3.34321C13.9141 2.60032 13.0322 2.01103 12.0616 1.60898C11.0909 1.20693 10.0506 1 9.00002 1C7.94942 1 6.90911 1.20693 5.93848 1.60898C4.96785 2.01103 4.08591 2.60032 3.34302 3.34321C1.84269 4.84354 0.999817 6.87842 0.999817 9.00021C0.999817 11.122 1.84269 13.1569 3.34302 14.6572C4.84335 16.1575 6.87824 17.0004 9.00002 17.0004C11.1218 17.0004 13.1567 16.1575 14.657 14.6572Z" stroke="currentcolor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </a>
                                                    </li>
                                                    <li className="offCanvas-menu" onClick={handleOffcanvus}>
                                                        <a className="menu-tigger">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none">
                                                                <path d="M0 2C0 0.895431 0.895431 0 2 0C3.10457 0 4 0.895431 4 2C4 3.10457 3.10457 4 2 4C0.895431 4 0 3.10457 0 2Z" fill="currentcolor" />
                                                                <path d="M0 9C0 7.89543 0.895431 7 2 7C3.10457 7 4 7.89543 4 9C4 10.1046 3.10457 11 2 11C0.895431 11 0 10.1046 0 9Z" fill="currentcolor" />
                                                                <path d="M0 16C0 14.8954 0.895431 14 2 14C3.10457 14 4 14.8954 4 16C4 17.1046 3.10457 18 2 18C0.895431 18 0 17.1046 0 16Z" fill="currentcolor" />
                                                                <path d="M7 2C7 0.895431 7.89543 0 9 0C10.1046 0 11 0.895431 11 2C11 3.10457 10.1046 4 9 4C7.89543 4 7 3.10457 7 2Z" fill="currentcolor" />
                                                                <path d="M7 9C7 7.89543 7.89543 7 9 7C10.1046 7 11 7.89543 11 9C11 10.1046 10.1046 11 9 11C7.89543 11 7 10.1046 7 9Z" fill="currentcolor" />
                                                                <path d="M7 16C7 14.8954 7.89543 14 9 14C10.1046 14 11 14.8954 11 16C11 17.1046 10.1046 18 9 18C7.89543 18 7 17.1046 7 16Z" fill="currentcolor" />
                                                                <path d="M14 2C14 0.895431 14.8954 0 16 0C17.1046 0 18 0.895431 18 2C18 3.10457 17.1046 4 16 4C14.8954 4 14 3.10457 14 2Z" fill="currentcolor" />
                                                                <path d="M14 9C14 7.89543 14.8954 7 16 7C17.1046 7 18 7.89543 18 9C18 10.1046 17.1046 11 16 11C14.8954 11 14 10.1046 14 9Z" fill="currentcolor" />
                                                                <path d="M14 16C14 14.8954 14.8954 14 16 14C17.1046 14 18 14.8954 18 16C18 17.1046 17.1046 18 16 18C14.8954 18 14 17.1046 14 16Z" fill="currentcolor" />
                                                            </svg>
                                                        </a>
                                                    </li>
                                                    <li className="header-btn"><Link href="/contact" className="btn"><i className="far fa-comment-alt" />Get In Touch</Link></li>
                                                </ul>
                                            </div>
                                            <div className="mobile-nav-toggler mobile-nav-toggler-two" onClick={handleMobileMenu}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none">
                                                    <path d="M0 2C0 0.895431 0.895431 0 2 0C3.10457 0 4 0.895431 4 2C4 3.10457 3.10457 4 2 4C0.895431 4 0 3.10457 0 2Z" fill="currentcolor" />
                                                    <path d="M0 9C0 7.89543 0.895431 7 2 7C3.10457 7 4 7.89543 4 9C4 10.1046 3.10457 11 2 11C0.895431 11 0 10.1046 0 9Z" fill="currentcolor" />
                                                    <path d="M0 16C0 14.8954 0.895431 14 2 14C3.10457 14 4 14.8954 4 16C4 17.1046 3.10457 18 2 18C0.895431 18 0 17.1046 0 16Z" fill="currentcolor" />
                                                    <path d="M7 2C7 0.895431 7.89543 0 9 0C10.1046 0 11 0.895431 11 2C11 3.10457 10.1046 4 9 4C7.89543 4 7 3.10457 7 2Z" fill="currentcolor" />
                                                    <path d="M7 9C7 7.89543 7.89543 7 9 7C10.1046 7 11 7.89543 11 9C11 10.1046 10.1046 11 9 11C7.89543 11 7 10.1046 7 9Z" fill="currentcolor" />
                                                    <path d="M7 16C7 14.8954 7.89543 14 9 14C10.1046 14 11 14.8954 11 16C11 17.1046 10.1046 18 9 18C7.89543 18 7 17.1046 7 16Z" fill="currentcolor" />
                                                    <path d="M14 2C14 0.895431 14.8954 0 16 0C17.1046 0 18 0.895431 18 2C18 3.10457 17.1046 4 16 4C14.8954 4 14 3.10457 14 2Z" fill="currentcolor" />
                                                    <path d="M14 9C14 7.89543 14.8954 7 16 7C17.1046 7 18 7.89543 18 9C18 10.1046 17.1046 11 16 11C14.8954 11 14 10.1046 14 9Z" fill="currentcolor" />
                                                    <path d="M14 16C14 14.8954 14.8954 14 16 14C17.1046 14 18 14.8954 18 16C18 17.1046 17.1046 18 16 18C14.8954 18 14 17.1046 14 16Z" fill="currentcolor" />
                                                </svg>
                                            </div>
                                        </nav>
                                    </div>
                                    {/* Mobile Menu  */}
                                    <div className="tgmobile__menu">
                                        <nav className="tgmobile__menu-box">
                                            <div className="close-btn" onClick={handleMobileMenu}><i className="fas fa-times" /></div>
                                            <div className="nav-logo">
                                                <Link href="/"><img src="/assets/img/logo/logo.png" alt="Logo" /></Link>
                                            </div>
                                            <div className="tgmobile__search">
                                                <form action="#">
                                                    <input type="text" placeholder="Search here..." />
                                                    <button><i className="fas fa-search" /></button>
                                                </form>
                                            </div>
                                            <div className="tgmobile__menu-outer">
                                                <MobileMenu />
                                            </div>
                                            <div className="tgmobile__menu-bottom">
                                                <div className="contact-info">
                                                    <ul className="list-wrap">
                                                        <li><Link href="mailto:info@apexa.com">info@apexa.com</Link></li>
                                                        <li><Link href="tel:0123456789">+123 888 9999</Link></li>
                                                    </ul>
                                                </div>
                                                <div className="social-links">
                                                    <ul className="list-wrap">
                                                        <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                                        <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                                        <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                                        <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                                                        <li><Link href="#"><i className="fab fa-youtube" /></Link></li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </nav>
                                    </div>
                                    <div className="tgmobile__menu-backdrop" onClick={handleMobileMenu} />
                                    {/* End Mobile Menu */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* header-search */}
                <SearchPopup isSearch={isSearch} handleSearch={handleSearch} />
                {/* header-search-end */}
                {/* offCanvas-menu */}
                <OffcanvusMenu isOffcanvus={isOffcanvus} handleOffcanvus={handleOffcanvus} />
                {/* offCanvas-menu-end */}
            </header>
        </>
    )
}

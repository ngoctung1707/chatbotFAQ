'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function PricingTable() {
    const [isToggled, setToggled] = useState(false)
    const handleToggle = () => setToggled(!isToggled)
    return (
        <>
            <div className={isToggled ? "pricing__tab selected" : " pricing__tab"}>
                <span className={`pricing__tab-btn monthly_tab_title  ${isToggled ? "active" : ""}`}>Monthly</span>
                <span className={`pricing__tab-switcher ${isToggled ? "active" : ""}`} onClick={handleToggle} />
                <span className={`pricing__tab-btn annual_tab_title ${isToggled ? "active" : ""}`}>Yearly</span>
            </div>
            <div className="row justify-content-center">
                <div className="col-lg-4 col-md-6 col-sm-8">
                    <div className="pricing__box">
                        <div className="pricing__head">
                            <h5 className="title">Basic Plan</h5>
                        </div>
                        <div className={`pricing__price ${isToggled ? "change-subs-duration" : ""}`}>
                            <h2 className="price monthly_price"><strong>$</strong> 15.00 <span>/ Month</span></h2>
                            <h2 className="price annual_price"><strong>$</strong> 149.00 <span>/ Month</span></h2>
                        </div>
                        <div className="pricing__list">
                            <ul className="list-wrap">
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    5000 User Activities
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    Unlimited Access
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    No Hidden Charge
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    03 Time Updates
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    Figma Source File
                                </li>
                            </ul>
                        </div>
                        <div className="pricing__btn">
                            <Link href="#" className="btn">Get this plan Now</Link>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-8">
                    <div className="pricing__box">
                        <div className="pricing__head">
                            <h5 className="title">Standard Plan</h5>
                        </div>
                        <div className={`pricing__price ${isToggled ? "change-subs-duration" : ""}`}>
                            <h2 className="price monthly_price"><strong>$</strong> 29.00 <span>/ Month</span></h2>
                            <h2 className="price annual_price"><strong>$</strong> 229.00 <span>/ Month</span></h2>
                        </div>
                        <div className="pricing__list">
                            <ul className="list-wrap">
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    5000 User Activities
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    Unlimited Access
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    No Hidden Charge
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    03 Time Updates
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    Figma Source File
                                </li>
                            </ul>
                        </div>
                        <div className="pricing__btn">
                            <Link href="#" className="btn">Get this plan Now</Link>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-8">
                    <div className="pricing__box">
                        <div className="pricing__head">
                            <h5 className="title">Corporate Plan</h5>
                        </div>
                        <div className={`pricing__price ${isToggled ? "change-subs-duration" : ""}`}>
                            <h2 className="price monthly_price"><strong>$</strong> 89.00 <span>/ Month</span></h2>
                            <h2 className="price annual_price"><strong>$</strong> 889.00 <span>/ Month</span></h2>
                        </div>
                        <div className="pricing__list">
                            <ul className="list-wrap">
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    5000 User Activities
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    Unlimited Access
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    No Hidden Charge
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    03 Time Updates
                                </li>
                                <li>
                                    <img src="/assets/img/icon/check_icon.svg" alt="" />
                                    Figma Source File
                                </li>
                            </ul>
                        </div>
                        <div className="pricing__btn">
                            <Link href="#" className="btn">Get this plan Now</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

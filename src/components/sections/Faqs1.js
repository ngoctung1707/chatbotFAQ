
'use client'
import { useState } from 'react'


export default function Faqs1() {
    const [isActive, setIsActive] = useState({
        status: false,
        key: "",
    })

    const handleClick = (key) => {
        if (isActive.key === key) {
            setIsActive({
                status: false,
            })
        } else {
            setIsActive({
                status: true,
                key,
            })
        }
    }
    return (
        <>
            <section className="faqs__area-six">
                <div className="circle" data-parallax="{&quot;x&quot; : 100 , &quot;y&quot; : 100 }" />
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-30">
                            <div className="box-need-help">
                                <img src="/assets/img/home6/img-faq.png" />
                                <div className="box-text-need-help">
                                    <svg width={36} height={36} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12.2563 21.887H19.8349C20.1467 21.887 20.3998 21.6339 20.3998 21.3221C20.3998 21.0103 20.1467 20.7572 19.8349 20.7572H12.2563C11.9445 20.7572 11.6914 21.0103 11.6914 21.3221C11.6914 21.6339 11.9444 21.887 12.2563 21.887Z" fill="#F7A400" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M17.0264 21.3221V34.9233C17.0264 35.2351 17.2795 35.4882 17.5913 35.4882C17.9027 35.4882 18.1562 35.2351 18.1562 34.9233V21.3221C18.1562 21.0102 17.9027 20.7571 17.5913 20.7571C17.2795 20.7571 17.0264 21.0102 17.0264 21.3221Z" fill="#F7A400" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M4.92772 0.291473C2.72897 0.291473 0.943359 2.07708 0.943359 4.27619C0.943359 6.47529 2.72897 8.26054 4.92772 8.26054C7.12688 8.26054 8.91249 6.47535 8.91249 4.27619C8.91249 2.07702 7.12688 0.291473 4.92772 0.291473ZM4.92772 1.42136C6.50353 1.42136 7.7826 2.70043 7.7826 4.27619C7.7826 5.85165 6.50353 7.13065 4.92772 7.13065C3.35225 7.13065 2.07325 5.85165 2.07325 4.27619C2.07325 2.70037 3.35231 1.42136 4.92772 1.42136Z" fill="#F7A400" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M30.8529 0.291473C28.6538 0.291473 26.8682 2.07708 26.8682 4.27619C26.8682 6.47529 28.6538 8.26054 30.8529 8.26054C33.0517 8.26054 34.8373 6.47535 34.8373 4.27619C34.8373 2.07702 33.0517 0.291473 30.8529 0.291473ZM30.8529 1.42136C32.4284 1.42136 33.7074 2.70043 33.7074 4.27619C33.7074 5.85165 32.4284 7.13065 30.8529 7.13065C29.2771 7.13065 27.9981 5.85165 27.9981 4.27619C27.9981 2.70037 29.2771 1.42136 30.8529 1.42136Z" fill="#F7A400" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M8.04144 16.3672C8.13485 16.5555 8.32845 16.6809 8.54728 16.6809L8.75707 16.6402L13.959 14.5608C14.7597 14.2411 15.6693 14.6309 15.9895 15.4316C16.3092 16.2319 15.9191 17.1415 15.1187 17.4616L8.24863 20.2076C7.59214 20.4701 6.84869 20.2577 6.42799 19.7063C6.28112 19.5138 6.02761 19.4363 5.79791 19.5138C5.56856 19.5914 5.41413 19.8069 5.41413 20.049V22.8862C5.41413 23.1732 5.62918 23.4142 5.91394 23.4474L10.4866 23.9754C11.5672 24.1001 12.3829 25.0153 12.3829 26.1034V34.9233C12.3829 35.2352 12.636 35.4882 12.9478 35.4882C13.2597 35.4882 13.5128 35.2351 13.5128 34.9233V26.1034C13.5128 24.4413 12.2669 23.0436 10.6161 22.8531L6.54396 22.3827V21.2031C7.19555 21.5025 7.96086 21.5394 8.6678 21.257L15.5383 18.511C16.9175 17.9592 17.5898 16.3917 17.0384 15.0121C16.487 13.6324 14.9195 12.9602 13.5399 13.5116L8.78082 15.4139L6.04687 10.9392C5.66085 10.3072 5.03148 9.86242 4.30722 9.70911C4.28501 9.70462 4.2628 9.69972 4.24017 9.69517C3.48124 9.53471 2.68993 9.70947 2.06925 10.1746C1.44856 10.6401 1.05876 11.3504 0.999974 12.124C0.667772 16.4952 0.00153606 25.2556 0.00153606 25.2556C0.000354475 25.2699 0 25.2842 0 25.2986C0 26.9587 1.24326 28.3553 2.89175 28.5481L6.96874 29.0746V34.9233C6.96874 35.2352 7.22184 35.4882 7.53366 35.4882C7.84548 35.4882 8.09857 35.2351 8.09857 34.9233V28.5779C8.09857 28.2935 7.88766 28.054 7.60591 28.0174L3.02609 27.4265C1.9531 27.3027 1.14141 26.3994 1.12977 25.3215C1.12977 25.3185 2.12632 12.2096 2.12632 12.2096C2.16058 11.761 2.38656 11.3486 2.74665 11.0789C3.10709 10.8089 3.56584 10.7075 4.00645 10.8006L4.07309 10.8145C4.49344 10.9035 4.85837 11.1618 5.08246 11.5283C5.93704 12.9271 7.66912 15.7624 8.007 16.3156C8.01846 16.3337 8.02974 16.351 8.04144 16.3672Z" fill="#F7A400" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M3.5565 17.189L5.37188 20.1609C6.0562 21.281 7.44899 21.7443 8.66814 21.2569C8.95775 21.1413 9.09901 20.8121 8.98304 20.5229C8.86742 20.2332 8.53823 20.092 8.24898 20.2076C7.54168 20.4905 6.73342 20.2219 6.33605 19.5719L4.52073 16.5999C4.35802 16.334 4.00999 16.25 3.74413 16.4123C3.47816 16.5751 3.39379 16.923 3.5565 17.189Z" fill="#F7A400" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M26.4758 16.27L21.0056 17.0435C19.5345 17.2514 18.5093 18.6148 18.7172 20.0859C18.9251 21.5567 20.2885 22.5822 21.7596 22.3743L28.4874 21.4226C28.7491 21.3856 29.0007 21.3111 29.2354 21.203V22.3825L25.1632 22.8529C23.5124 23.0435 22.2666 24.4411 22.2666 26.1032V34.9231C22.2666 35.235 22.5197 35.4881 22.8315 35.4881C23.1433 35.4881 23.3964 35.235 23.3964 34.9231V26.1032C23.3964 25.0152 24.2122 24.0999 25.2927 23.9752L29.8639 23.4472H29.8627C30.1456 23.4163 30.3651 23.1768 30.3651 22.886V20.0485C30.3651 19.8063 30.2107 19.5913 29.9814 19.5137C29.752 19.4357 29.4985 19.5134 29.3513 19.7058C29.1039 20.0297 28.7374 20.2462 28.3291 20.3039L21.6013 21.2552C20.7475 21.3761 19.9566 20.7811 19.8361 19.9273C19.7152 19.0738 20.3102 18.2829 21.1637 18.162L26.8964 17.3515L26.8188 17.3567L27.3009 17.0863L30.3576 12.0828C30.7485 11.4433 31.4645 11.0761 32.2121 11.1326C32.2227 11.1333 32.2329 11.134 32.2434 11.1348C33.2505 11.2109 34.0425 12.0267 34.0885 13.0353L34.6493 25.3104C34.6432 26.3928 33.8297 27.3016 32.7529 27.4263L28.2684 27.9442C27.9863 27.9766 27.7724 28.2135 27.7686 28.4975L27.6805 34.9152C27.6763 35.2271 27.926 35.4836 28.2375 35.4881C28.5494 35.4922 28.8059 35.2425 28.8104 34.9307L28.8914 29.0093L32.8825 28.5486C34.5333 28.358 35.7792 26.96 35.7792 25.2983C35.7792 25.2896 35.7788 25.281 35.7784 25.2723C35.7784 25.2723 35.404 17.0754 35.2172 12.9837C35.1449 11.4041 33.905 10.127 32.3285 10.0083C32.3179 10.0075 32.3074 10.0064 32.2972 10.0056C31.1267 9.91748 30.0054 10.4922 29.3934 11.4937L26.4758 16.27Z" fill="#F7A400" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M23.2265 1.98628C23.2265 1.53698 23.048 1.1057 22.7301 0.787857C22.4122 0.469952 21.9814 0.291473 21.5317 0.291473H13.6499C12.7137 0.291473 11.9551 1.0504 11.9551 1.98628V9.16634C11.9551 9.53541 12.1705 9.87063 12.5065 10.0235C12.8424 10.1764 13.2367 10.1188 13.5151 9.87624C14.0585 9.40284 14.8243 8.73542 15.2509 8.36334C15.3541 8.27372 15.4859 8.22439 15.6223 8.22439H21.5316C21.9813 8.22439 22.4122 8.04585 22.7301 7.728C23.0479 7.4101 23.2264 6.97888 23.2264 6.52958V1.98628H23.2265ZM13.085 8.75244V1.98628C13.085 1.67446 13.3377 1.42136 13.6499 1.42136H21.5316C21.6815 1.42136 21.8254 1.48086 21.9312 1.58708C22.0371 1.69289 22.0966 1.83639 22.0966 1.98628V6.52958C22.0966 6.67947 22.0371 6.82297 21.9312 6.92878C21.8254 7.035 21.6815 7.0945 21.5316 7.0945H15.6224C15.2129 7.0945 14.8175 7.24249 14.5087 7.51142L13.085 8.75244Z" fill="#F7A400" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M15.0747 3.79108H20.1938C20.5057 3.79108 20.7587 3.53799 20.7587 3.22617C20.7587 2.91435 20.5056 2.66125 20.1938 2.66125H15.0747C14.7629 2.66125 14.5098 2.91435 14.5098 3.22617C14.5098 3.53799 14.7628 3.79108 15.0747 3.79108Z" fill="#F7A400" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M15.0747 5.8513H17.5917C17.9032 5.8513 18.1566 5.5982 18.1566 5.28638C18.1566 4.9745 17.9032 4.72147 17.5917 4.72147H15.0747C14.7629 4.72147 14.5098 4.97456 14.5098 5.28638C14.5097 5.5982 14.7628 5.8513 15.0747 5.8513Z" fill="#F7A400" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M26.79 21.663L28.4874 21.4227C29.284 21.3101 29.9883 20.8472 30.4078 20.161L32.2232 17.189C32.3859 16.9231 32.3015 16.5751 32.0356 16.4124C31.7697 16.2501 31.4217 16.3341 31.259 16.6L29.4437 19.572C29.2004 19.9701 28.7913 20.2386 28.3292 20.3041L26.6317 20.5441C26.3229 20.5878 26.1075 20.874 26.1511 21.1828C26.1948 21.4912 26.4811 21.7066 26.79 21.663Z" fill="#F7A400" />
                                    </svg>
                                    <h6>Need more help?</h6>
                                    <p>Feeling inquisitive? Have a read through some of our FAQs or <a href="#">contact</a> our Supporters for help</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-30">
                            <div className="box-faq-right">
                                <h1 className="title tg-element-title mb-20">Frequently asked questions</h1>
                                <p className="tg-element-title mb-40">Our power of choice is untrammelled and when nothing preventsbeing able to do what we like best every pleasure.</p>
                                <div className="block-faqs">
                                    <div className="accordion wow fadeInUp" id="accordionFAQ">
                                        <div className="accordion-item">
                                            <h5 className="accordion-header" onClick={() => handleClick(1)}>
                                                <button className={isActive.key == 1 ? "accordion-button text-heading-5" : "accordion-button text-heading-5 collapsed"} >
                                                    Where is my order? Quisque molestie
                                                </button>
                                            </h5>
                                            <div className={isActive.key == 1 ? "accordion-collapse collapse show" : "accordion-collapse collapse"}>
                                                <div className="accordion-body">Provide a step-by-step guide on how users can browse and book travel services on your platform. Include information on searching for destinations, selecting dates, choosing accommodation, and completing the booking process. Mention any special features or tools that can help users find the best deals.</div>
                                            </div>
                                        </div>
                                        <div className="accordion-item">
                                            <h5 className="accordion-header" onClick={() => handleClick(2)}>
                                                <button className={isActive.key == 2 ? "accordion-button text-heading-5" : "accordion-button text-heading-5 collapsed"} >
                                                    How can I return an item purchased online?
                                                </button>
                                            </h5>
                                            <div className={isActive.key == 2 ? "accordion-collapse collapse show" : "accordion-collapse collapse"}>
                                                <div className="accordion-body">Provide a step-by-step guide on how users can browse and book travel services on your platform. Include information on searching for destinations, selecting dates, choosing accommodation, and completing the booking process. Mention any special features or tools that can help users find the best deals.</div>
                                            </div>
                                        </div>
                                        <div className="accordion-item">
                                            <h5 className="accordion-header" onClick={() => handleClick(3)}>
                                                <button className={isActive.key == 3 ? "accordion-button text-heading-5" : "accordion-button text-heading-5 collapsed"} >
                                                    Can I cancel or change my order?
                                                </button>
                                            </h5>
                                            <div className={isActive.key == 3 ? "accordion-collapse collapse show" : "accordion-collapse collapse"}>
                                                <div className="accordion-body">Provide a step-by-step guide on how users can browse and book travel services on your platform. Include information on searching for destinations, selecting dates, choosing accommodation, and completing the booking process. Mention any special features or tools that can help users find the best deals.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </ >
    )
}

import Layout from "@/components/layout/Layout"
import Link from "next/link"

export default function ForgotPassword() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1}>
                <section className="forgot__area-one">
                    <div className="container">
                        <div className="text-center mb-55">
                            <h1 className="text-48-bold">Forgot Password?</h1>
                        </div>
                        <div className="box-form-login">
                            <div className="head-login">
                                <p className="text-16-semibold">No worries, we’ll send you reset instructions</p>
                                <div className="form-login form-forgot">
                                    <div className="form-group">
                                        <input type="text" className="form-control account" placeholder="Email Address Or Username" />
                                    </div>
                                    <div className="alert alert-warning">
                                        <p className="text-infos">We can’t seem to find the right email address for you resend the email that you have registered</p>
                                    </div>
                                    <div className="form-group">
                                        <input type="submit" className="btn btn-login" defaultValue="Reset password" />
                                    </div>
                                    <div className="form-group">
                                        <button className="btn border-btn btn-login">
                                            <svg width={16} height={14} viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M15 6.07209H3.14L6.77 2.02388C6.93974 1.83427 7.0214 1.58982 6.99702 1.3443C6.97264 1.09878 6.84422 0.872315 6.64 0.714715C6.43578 0.557115 6.1725 0.481293 5.90808 0.503929C5.64365 0.526565 5.39974 0.645806 5.23 0.835419L0.23 6.40635C0.196361 6.45066 0.166279 6.49721 0.14 6.54562C0.14 6.59205 0.14 6.6199 0.0700002 6.66633C0.0246737 6.77278 0.000941121 6.88611 0 7.00058C0.000941121 7.11505 0.0246737 7.22838 0.0700002 7.33484C0.0700002 7.38126 0.0699999 7.40911 0.14 7.45554C0.166279 7.50395 0.196361 7.5505 0.23 7.59481L5.23 13.1657C5.32402 13.2706 5.44176 13.3548 5.57485 13.4126C5.70793 13.4704 5.85309 13.5002 6 13.5C6.23365 13.5004 6.46009 13.4249 6.64 13.2864C6.74126 13.2085 6.82496 13.1128 6.88631 13.0047C6.94766 12.8967 6.98546 12.7785 6.99754 12.6569C7.00961 12.5353 6.99573 12.4127 6.95669 12.296C6.91764 12.1794 6.8542 12.0711 6.77 11.9773L3.14 7.92907H15C15.2652 7.92907 15.5196 7.83125 15.7071 7.65712C15.8946 7.483 16 7.24683 16 7.00058C16 6.75433 15.8946 6.51817 15.7071 6.34404C15.5196 6.16991 15.2652 6.07209 15 6.07209Z" fill />
                                            </svg>
                                            <Link href="/login">Back to Login</Link>
                                        </button>
                                    </div>
                                    <p className="text-center">Don’t have an account? <Link href="/register" className="link-bold">Sign Up</Link> now</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </Layout>
        </>
    )
}

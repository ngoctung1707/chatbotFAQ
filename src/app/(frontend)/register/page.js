import Layout from "@/components/layout/Layout"
import Link from "next/link"

export default function Register() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1}>
                <section className="register__area-one">
                    <div className="container">
                        <div className="text-center mb-55">
                            <h1 className="text-48-bold">Create An Account</h1>
                        </div>
                        <div className="box-form-login">
                            <div className="head-login">
                                <h3>Register</h3>
                                <p>Create an account today and start using our platform</p>
                                <div className="box-login-with">
                                    <div className="form-group">
                                        <a href="#" className="btn btn-login-social">
                                            <img src="/assets/img/login/google.svg" />
                                            Sign In With Google
                                        </a>
                                    </div>
                                    <div className="form-group">
                                        <a href="#" className="btn btn-login-social">
                                            <img src="/assets/img/login/apple.png" />
                                            Sign In With Apple Id
                                        </a>
                                    </div>
                                </div>
                                <div className="text-or"><span>or</span></div>
                                <div className="form-login">
                                    <div className="form-group">
                                        <input type="text" className="form-control account" placeholder="Your Name" />
                                    </div>
                                    <div className="form-group">
                                        <input type="text" className="form-control email-address" placeholder="Email Address" />
                                    </div>
                                    <div className="form-group">
                                        <input type="text" className="form-control account" placeholder="Username" />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-control" placeholder="Password" />
                                        <span className="view-password" />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-control" placeholder="Confirm Password" />
                                        <span className="view-password" />
                                    </div>
                                    <div className="box-forgot-pass">
                                        <label>
                                            <input type="checkbox" className="cb-remember" defaultValue={1} /> <span>I have read and agree to the Terms &amp; Conditions and the Privacy Policy of this website.</span>
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <input type="submit" className="btn btn-login" defaultValue="Sign up now" />
                                    </div>
                                    <p>Already have an account? <Link href="/login" className="link-bold">Sign In</Link> now</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </Layout>
        </>
    )
}

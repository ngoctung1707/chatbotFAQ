import Layout from "@/components/layout/Layout"
import Link from "next/link"

export default function Login() {
    return (
        <>
            <Layout headerStyle={1} footerStyle={1}>
                <section className="login__area-one">
                    <div className="container">
                        <div className="text-center mb-55">
                            <h1 className="text-48-bold">Welcome back!</h1>
                        </div>
                        <div className="box-form-login">
                            <div className="head-login">
                                <h3>Sign in</h3>
                                <p>Sign in with your email and password</p>
                                <div className="box-login-with">
                                    <div className="form-group">
                                        <Link href="#" className="btn btn-login-social">
                                            <img src="/assets/img/login/google.svg" />
                                            Sign In With Google
                                        </Link>
                                    </div>
                                    <div className="form-group">
                                        <Link href="#" className="btn btn-login-social">
                                            <img src="/assets/img/login/apple.png" />
                                            Sign In With Apple Id
                                        </Link>
                                    </div>
                                </div>
                                <div className="text-or"><span>or</span></div>
                                <div className="form-login">
                                    <div className="form-group">
                                        <input type="text" className="form-control account" placeholder="Email Address" />
                                    </div>
                                    <div className="form-group">
                                        <input type="password" className="form-control" placeholder="Password" />
                                        <span className="view-password" />
                                    </div>
                                    <div className="box-forgot-pass">
                                        <label>
                                            <input type="checkbox" className="cb-remember" defaultValue={1} /> Remember me
                                        </label>
                                        <Link href="/forgot-password">Forgot Password ?</Link>
                                    </div>
                                    <div className="form-group">
                                        <input type="submit" className="btn btn-login" defaultValue="Sign In" />
                                    </div>
                                    <p>Don’t have an account? <Link href="/register" className="link-bold">Sign up</Link> now</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </Layout>
        </>
    )
}

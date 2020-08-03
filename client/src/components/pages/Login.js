import React, { useState, useEffect } from 'react';
import axios from "axios";
import Loader from "../commons/Loader";
import Cookies from 'js-cookie';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import { Link } from "react-router-dom";

function Login(props) {

    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [Loading, setLoading] = useState(false);

    const responseHandler = (data, authtype) => {
        if (data.success) {
            Cookies.set("w_id", data._id);
            Cookies.set("w_authtype", authtype);
            props.history.push('/home');
        }
        else {
            alert("Login failed. Please try again.")
        }
    }

    const googleHandler = (response) => {
        console.log(response);
        if (response.error) {
            if (response.details && response.details.includes("Cookies")) {
                alert("Please allow cookies to sign up with SNS.")
            }
            else {
                alert("Google OAuth failed. Please try again.")
            }
        }
        else {
            const googleResponse = {
                type: "GOOGLE",
                image: response.profileObj.imageUrl,
                firstname: response.profileObj.givenName,
                lastname: response.profileObj.familyName,
                email: response.profileObj.email,
                token: response.accessToken,
            };
            axios.post("/api/login_sns", googleResponse).then(data => {
                console.log(data);
                responseHandler(data.data, "GOOGLE")
            })
        }
    }

    const facebookHandler = (response) => {
        console.log(response);
        if(!response.accessToken) {
            alert("Facebook OAuth failed. Please try again.")
        }
        else {
            const facebookResponse = {
                type: "FACEBOOK",
                image: response.picture.data.url,
                firstname: response.first_name,
                lastname: response.last_name,
                email: response.email,
                token: response.accessToken,
            }
            axios.post("/api/login_sns", facebookResponse).then(data => {
                console.log(data);
                responseHandler(data.data, "FACEBOOK")
            })
        }
    }

    const loginHandler = async (e) => {
        e.target.disabled = true
        setLoading(true)
        if (Email.length > 0 && Password.length > 0) {
            const userInfo = {
                email: Email,
                password: Password,
            }

            await axios.post('/api/login', userInfo).then(response => {
                console.log(response);
                responseHandler(response.data, "EMAIL")
                setLoading(false)
            });
        }
        else {
            alert("Please enter email and password")
        }
    };

    const onEmailHandler = (e) => {
        setEmail(e.currentTarget.value)
    }
    const onPasswordHandler = (e) => {
        setPassword(e.currentTarget.value)
    }
    useEffect(() => {
        setEmail(document.getElementById("email").value)
        setPassword(document.getElementById("password").value)
    })

    return (
        <div className="login-container">
                
            <GoogleLogin
                className="login-btn"
                clientId="1006193047058-lilp4kmnae87jhd115dndli6oa2lan9r.apps.googleusercontent.com"
                buttonText="Login with Google"
                onSuccess={googleHandler}
                onFailure={googleHandler}
                cookiePolicy={'single_host_origin'}
            />

            <FacebookLogin
                cssClass="login-btn facebook"
                appId="293092431727469"
                fields="first_name,last_name,email,picture"
                callback={facebookHandler} 
            />

            <hr />

            <form className="login-container">
                <input id="email" 
                    type="email" 
                    pattern="/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/"
                    placeholder="Your Email"
                    onChange={onEmailHandler}
                    required/>
                <input id="password" 
                    type="password" 
                    placeholder="Your Password"
                    onChange={onPasswordHandler}
                    required/>
                <button type="submit" className="login-btn email" onClick={loginHandler}>Log in with Email</button>
                <span>Or <Link to="/signup">sign up with email</Link></span> <br />
                <span><Link to="/forgotpassword">Forgot password</Link></span>
            </form>

            {Loading ? <Loader /> : ""}

        </div>
    )
}

export default Login

import React, { useState, useEffect } from 'react';
import axios from "axios";
import Loader from "../commons/Loader";
import Cookies from 'js-cookie';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import { Link } from "react-router-dom";
import { LinkedIn } from 'react-linkedin-login-oauth2';

function Login(props) {

    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [Loading, setLoading] = useState(false);

    const responseHandler = (data, authtype) => {
        if (data.success) {
            Cookies.set("w_id", data._id);
            Cookies.set("w_authtype", authtype);
            if (props.location.state && props.location.state.from)
                props.history.push(props.location.state.from);
            else {
                console.log("Data")
                console.log(JSON.stringify(data));
                if(data.defaultGroup){
                    props.history.push(`/group/${data.defaultGroup}`);
                }
                else {
                    props.history.push('/home');
                }
            }
        }
        else {
            alert(data.message);
            //alert("Login failed. Please try again.")
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

    const linkedInHandler = (response) => {
        //console.log(response);
        if(!response.code) {
            alert("Linkedin OAuth failed. Please try again.")
        }
        else {
            let code = response.code;
            axios.get(`/api/getLinkedinData?code=${code}`, {}).then(data => {

                let dataParsed = data.data;
                const linkedInResponse = {
                    type: "LINKEDIN",
                    image: dataParsed.profileImage,
                    firstname: dataParsed.firstName,
                    lastname: dataParsed.lastName,
                    email: dataParsed.email,
                    token: code,
                }

                axios.post("/api/login_sns", linkedInResponse).then(data => {
                    //console.log(data);
                    responseHandler(data.data, "LINKEDIN")
                })
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

    let linkedCallbackURL = window.location.protocol+"//" + window.location.hostname + "/linkedin";
    return (
        <div className="login-container">
                
            <GoogleLogin
                className="login-btn"
                clientId="717027527409-sdjf9fk2o438n8bomagsktnb64bv0g06.apps.googleusercontent.com"
                buttonText="Login with Google"
                onSuccess={googleHandler}
                onFailure={googleHandler}
                cookiePolicy={'single_host_origin'}
            />

            <FacebookLogin
                cssClass="login-btn facebook"
                appId="2797264473932478"
                fields="first_name,last_name,email,picture"
                callback={facebookHandler} 
            />

            <LinkedIn
                clientId="77rkr2euf8hsvc"
                onFailure={linkedInHandler}
                onSuccess={linkedInHandler}
                redirectUri={linkedCallbackURL}
                scope="r_liteprofile r_emailaddress"
                renderElement={({ onClick, disabled }) => (
                    <button onClick={onClick} disabled={disabled} style={{marginTop: "30px",marginBottom: "30px",
                        width: "300px",
                        paddingTop: "9px",
                        cursor: "pointer",
                        border: 0,
                    backgroundColor: "#0077B5"}}>
                        <img src={require("../../images/linkedin_login.png")} alt="Log in with Linked In" style={{ maxWidth: '180px' }} />
                    </button>
                )}
            >

            </LinkedIn>

            <div>By creating an account you agree with our <Link to="/termsofuse"> terms of use</Link></div>

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
                <button type="submit" className="login-btn email" id="loginWithEmail" onClick={loginHandler}>Log in with Email</button>
                <span>Or <Link to="/signup">sign up with email</Link></span> <br />
                <span><Link to="/forgotpassword">Forgot password</Link></span>
            </form>

            {Loading ? <Loader /> : ""}

        </div>
    )
}

export default Login

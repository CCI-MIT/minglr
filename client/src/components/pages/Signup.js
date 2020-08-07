import React, { useState, useEffect } from 'react';
import axios from "axios";
import NavBarOut from "../commons/NavBarOut";
import Cookies from 'js-cookie';
import { Link } from "react-router-dom";

function Signup(props) {

    const [Firstname, setFirstname] = useState("");
    const [Lastname, setLastname] = useState("");
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [PasswordConfirm, setPasswordConfirm] = useState("");
    const [Message, setMessage] = useState("");
    
    const onFirstnameHandler = (e) => {
        setFirstname(e.currentTarget.value)
      }
    const onLastnameHandler = (e) => {
        setLastname(e.currentTarget.value)
    }
    const onEmailHandler = (e) => {
      setEmail(e.currentTarget.value)
    }
    const onPasswordHandler = (e) => {
        setPassword(e.currentTarget.value)
        if (e.currentTarget.value.length < 8) {
            setMessage("*The password is too short");
        }
        else if (PasswordConfirm.length > 0 && e.currentTarget.value !== PasswordConfirm) {
            setMessage("*The passwords do not match")
        }
        else {
            setMessage("");
        }
    }
    const onPasswordConfirmHandler = (e) => {
        setPasswordConfirm(e.currentTarget.value);
        if (Password !== e.currentTarget.value) {
            setMessage("*The passwords do not match")
        }
        else {
            setMessage("");
        }
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        e.target.disabled = true

        if (Message.length > 0) {
            alert(Message);
        }
        else if (Firstname.length > 0 && Lastname.length > 0 && Password.length >= 8 && Email.length > 5) {
            const userInfo = {
                firstname: Firstname,
                lastname: Lastname,
                email: Email,
                password: Password,
            }
            await axios.post("/api/signup", userInfo).then(response => {
                console.log(response);
                if (response.data.success) {
                    Cookies.set("w_id", response.data._id);
                    Cookies.set("w_authtype", "EMAIL");
                    props.history.push('/home');
                }
                else {
                    if (response.data.message)
                        alert(response.data.message);
                    else 
                        alert("Signup failed. Please try again.")
                    document.getElementById("submitBtn").disabled = false;
                }
            })
        }
        else {
            alert("Signup failed. Please try again.")
        }
    }

    useEffect(() => {
        setEmail(document.getElementById("email").value)
        setFirstname(document.getElementById("firstname").value)
        setLastname(document.getElementById("lastname").value)
        setPassword(document.getElementById("password").value)
        setPasswordConfirm(document.getElementById("passwordConfirm").value)
    })

    return (
        <div>
            <NavBarOut/>

            <form className="login-container">
                <h2>Create Account</h2>
                <input onChange={onFirstnameHandler}
                        id="firstname"
                        type="text" 
                        required
                        placeholder="First Name"/>
                <input onChange={onLastnameHandler}
                        id="lastname"
                        type="text" 
                        required
                        placeholder="Last Name"/>
                <input onChange={onEmailHandler}
                        id="email"
                        type="email" 
                        pattern="[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*"
                        required
                        placeholder="Email"/>
                <input onChange={onPasswordHandler}
                        id="password"
                        type="password" 
                        required
                        placeholder="Password"/>
                        * Password should be at least 8 letters
                <input onChange={onPasswordConfirmHandler}
                        id="passwordConfirm"
                        type="password" 
                        required
                        placeholder="Confirm Password"/>
                <span className="login-message">{Message}</span>
                <button id="submitBtn" type="submit" className="login-btn email" onClick={signupHandler}>Sign up with Email</button>
                <span>or if you already have an account, <Link to="/login">go to log in</Link></span>
            </form>
        </div>
    )
}

export default Signup

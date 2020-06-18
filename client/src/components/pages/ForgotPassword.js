import React, { useState, useEffect } from 'react';
import axios from "axios";
import NavBarOut from "../commons/NavBarOut";
import { Link } from "react-router-dom";

function ForgotPassword(props) {

    const [Email, setEmail] = useState("");
    const [Message, setMessage] = useState("");
    
    const onEmailHandler = (e) => {
      setEmail(e.currentTarget.value)
    }

    const resetPasswordHandler = async (e) => {
        e.preventDefault();
        if (Email.length === 0) {
            setMessage("Please enter your email")
        }
        else {
            await axios.post("/api/forgot_password", {
                email: Email,
            }).then(response => {
                if (response.data.success) {
                    alert("Email successfully sent! Please go check your mailbox.");
                }
                else {
                    setMessage(response.data.message);
                }
            })
            .catch(err => { console.error(err) })
        }
    }

    useEffect(() => {
        setEmail(document.getElementById("email").value)
    })

    return (
        <div>
            <NavBarOut/>

            <form className="login-container">
                <h2>Find Password</h2>
                <input onChange={onEmailHandler}
                        id="email"
                        type="email" 
                        pattern="[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*"
                        required
                        placeholder="Email"/>
                <span className="login-message">{Message}</span>
                <button id="submitBtn" type="submit" className="login-btn email" onClick={resetPasswordHandler}>Send Password Reset Email</button>
                <span>or if you remember your password, <Link to="/login">go to log in</Link></span>
                <span>or if you do not have an account, <Link to="/signup">go to sign up</Link></span>
            </form>
        </div>
    )
}

export default ForgotPassword;

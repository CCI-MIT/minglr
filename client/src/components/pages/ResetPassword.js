import React, { useState, useEffect } from 'react';
import axios from "axios";
import NavBarOut from "../commons/NavBarOut";
import { Link } from "react-router-dom";

function ResetPassword(props) {

    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [PasswordConfirm, setPasswordConfirm] = useState("");
    const [Message, setMessage] = useState("");

    const updatePasswordHandler = async (e) => {
        e.preventDefault();

        if (Message.length > 0) {
            alert(Message);
        }
        else if (Email.length > 3 && Password.length >= 8) {
            await axios.post("/api/reset_password", {
                email: Email,
                password: Password,
            }).then(response => {
                if (response.success) {
                    alert("Successfully updated.");
                }
                else {
                    alert("Something went wrong. Please try again.")
                }
            })
        }
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

    const verifyToken = async () => {
        await axios.get("/api/verify_token", {
            params: {
                resetPasswordToken: props.match.params.token,
            },
        }).then(response => {
            console.log(response);
            if (response.data.success) {
                setEmail(response.data.email);
            }
            else {
                setMessage(response.data.message);
            }
        }).catch(err => {console.error(err);})
    }

    useEffect(() => {
        console.log(props.match);
        if (props.match.params.token) {
            verifyToken();
        }
        else {
            setMessage("*The link is invalid or has expired.")
        }
    });

    return (
        <div>
            <NavBarOut/>

            <form className="login-container">
                <h2>Reset Your Password</h2>
                <input onChange={onPasswordHandler}
                        id="password"
                        type="password" 
                        required
                        placeholder="Password"/>
                <input onChange={onPasswordConfirmHandler}
                        id="passwordConfirm"
                        type="password" 
                        required
                        placeholder="Confirm Password"/>
                <span className="login-message">{Message}</span>
                <button id="submitBtn" type="submit" className="login-btn email" onClick={updatePasswordHandler}>Reset Password</button>
                <span>or if you remember your password, <Link to="/login">go to log in</Link></span>
            </form>
        </div>
    )
}

export default ResetPassword

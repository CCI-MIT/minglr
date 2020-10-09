import React, { useState, useEffect } from 'react';
import axios from "axios";
import NavBarOut from "../commons/NavBarOut";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

function ResetPassword(props) {

    const [Message, setMessage] = useState("");


    console.log(props.match.params.token);

    const verifyToken = async () => {

        await axios.post("/api/validate_registration", {
            validationHash: props.match.params.token,
        }).then(response => {

            if (response.data.success) {
                Cookies.set("w_id", response.data._id);
                Cookies.set("w_authtype", response.data.authtype);

                let pathToGo = localStorage.getItem("redirectURL");
                if(pathToGo) {
                    localStorage.removeItem("redirectURL");
                    props.history.push(pathToGo);
                }
                else {
                    props.history.push('/home');
                }
            }
            else {
                setMessage(response.data.message);
            }
        }).catch(err => {console.error(err);})
    }

    useEffect(() => {

        if (props.match.params.token) {
            setTimeout(verifyToken, 1000);
        }

    });

    return (
        <div>
            <NavBarOut/>
            {Message != "" ?
                <div style={{
                    display: 'flex',
                    position: 'relative',
                    marginTop: '10',
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{flex:1, marginTop: '35px'}}><h2 style={{margin: 'auto'}}>Your email was not validated, please contact support.</h2></div>

                    <div style={{flex:1}}><h3 style={{margin: 'auto'}}>Contact support at minglr.cs@gmail.com.</h3></div>
                </div>
                :
                <div style={{
                    display: 'flex',
                    position: 'relative',
                    marginTop: '10',
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>

                    <div style={{flex:1, marginTop: '35px'}}><h2 style={{margin: 'auto'}}>We are validating your e-mail address!</h2></div>
                    <div style={{flex:1}}><h2 style={{margin: 'auto'}}>You will be automatically logged after successful validation! </h2></div>


                </div>
            }
        </div>
    )
}

export default ResetPassword

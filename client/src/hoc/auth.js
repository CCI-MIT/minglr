/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { authUser } from '../_actions/user_actions';
import { useDispatch } from "react-redux";
import Loader from "../components/commons/Loader";
import { useAlert } from "react-alert";
import { isMobile, isSafari } from "react-device-detect";

export default function (SpecificComponent, option) {
    function AuthenticationCheck(props) {

        const [user, setUser] = useState(null)
        const [loading, setLoading] = useState(true)
        const dispatch = useDispatch();
        const alert = useAlert();

        useEffect(() => {

            //To know my current status, send Auth request 
            dispatch(authUser()).then(response => {

                console.log(response);

                setUser(response.payload);



                if (!response.payload.isAuth) {
                    // redirect to login
                    if (option === true) {
                        //Not Loggined in Status
                        //console.log(" >" + window.location.pathname)
                        localStorage.setItem("redirectURL", window.location.pathname);

                        props.history.push({
                            pathname: '/login',
                            state: {from: props.location.pathname},
                        });
                    }
                    else {
                        setLoading(false);
                    }
                }
                //Loggined in Status 
                else {
                    // redirect to home
                    if (option === false) {
                        let pathToGo = localStorage.getItem("redirectURL");
                        if(pathToGo){
                            localStorage.removeItem("redirectURL");
                            props.history.push(pathToGo);
                        } else {
                            props.history.push('/home');
                        }
                    }
                    else {
                        setLoading(false);
                    }

                    // show alert if there is no other info
                    if (!response.payload.affiliation && !response.payload.keywords) {
                        alert.show("Please click on settings (on the top right corner) to edit your information shown to the others");
                    }

                }

                // check if browser is appropriate
                if (isMobile && !isSafari) {
                    alert.show("The recommended browser on iOS systems is Safari.");
                }
                
            })

        }, [])

        return (
            <div>
                {loading ? 
                    <Loader/>
                    :
                    <SpecificComponent {...props} currentUser={user} />
                }
            </div>
        )
    }
    return AuthenticationCheck
}



import React, {useState} from 'react';
import axios from "axios";
import Cookies from 'js-cookie';
import Settings from "./Settings";

function NavBar(props) {

    const [settings, setSettings] = useState(false);

    const logoutHandler = async (e) => {

        e.target.classList.add("disabled")

        await axios.get('/api/logout').then(response => {
            if (response.data.success) {
                Cookies.set("w_authtype", "");
                Cookies.set("w_id", "");
                props.history.push("/login");
            } 
            else {
                alert('Log Out Failed');
                document.getElementById("logoutBtn").classList.remove("disabled")
            }
        });
    };

    const settingsHandler = () => {
        setSettings(!settings);
    }

    return (
        <div>
            <nav className="loggedIn">
                <img className="logo" src={require("../../images/logo.svg")} alt="logo"/>
                <div className="left-menu">
                    {/* <a className="btn" href="https://mit.zoom.us/j/92238074391?pwd=dnBydjN4TEhCUlF6VWxjTHg1NlViUT09" target="_blank" rel="noopener noreferrer">Go Back to Main Room</a> */}
                    <div id="logoutBtn" className="btn btn-white" onClick={logoutHandler}>Log Out</div> 
                    <div className="settings" onClick={settingsHandler}>
                        <img src={require("../../images/settings.png")} alt="settings" title="settings"/>
                    </div>
                </div>
            </nav>
            {settings ? <Settings {...props} settingsHandler={settingsHandler} /> : <></>}
        </div>
    )
}

export default NavBar

import React from 'react'
import "../../styles/loader.scss";

function Loader() {
    return (
        <div className="loader-container">
            <img src={require("../../images/loader.gif")} alt="Loading now... Please wait..."/>
        </div>
    )
}

export default Loader

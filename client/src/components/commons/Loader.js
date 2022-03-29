import React from 'react'
import "../../styles/loader.scss";
import SpinnerExamples from 'react-spinkit';

function Loader() {
    return (
        <div className="loader-container">
            {/*<img src={require("../../images/loader.gif")} alt="Loading now... Please wait..."/>*/}
            <SpinnerExamples name="line-scale" color="#4f23bb"/>
        </div>
    )
}

export default Loader

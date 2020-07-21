import React from 'react';
import { Link } from "react-router-dom";

function NavBarOut() {

    return (
        <div>
            <nav>
                <Link to="/"><img className="logo" src={require("../../images/logo.svg")} alt="logo"/></Link>
            </nav>
        </div>
    )
}

export default NavBarOut

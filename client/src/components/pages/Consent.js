import React, { useState } from 'react';
import NavBarOut from "../commons/NavBarOut";
import Login from "./Login";

function Consent(props) {

    const [Answer, setAnswer] = useState(localStorage.getItem("answer") || "");

    const handleAnswer = (answer) => {
        setAnswer(answer);
        localStorage.setItem("answer", answer);
    }
    
    let returnThis = <div className="login-container">
        <h3><br/>Consent statement for using MINGLR</h3>
        <p className="consent">Use of the MINGLR system is part of research being conducted by researchers at Massachusetts Institute of Technology (MIT) and Northeastern University to understand how different modes of communication can be supported in online groups. Your use of the system is voluntary, you may decline to answer any or all questions, and you can stop at any time. The system will record who you talk to and when but not the contents of your conversations. When the results of the research are made public, no information will be included that would reveal your identity.</p>
        <p>I consent to participate in this research by using the MINGLR system:</p>
        <div>
            <span className="btn" onClick={() => handleAnswer("YES")}>Yes, I do</span>
            <span className="btn darkgray" onClick={() => handleAnswer("NO")}>No, I do not</span>
        </div>
    </div>;
    
    if (Answer === "YES") {
        returnThis = <Login {...props}/>
    }
    else if (Answer === "NO") {
        returnThis = <div className="login-container">
                <h2><br/>Thank you.</h2>
                <div>
                    <br/>
                    <span onClick={() => handleAnswer("")} className="btn">I changed my mind</span>
                    <a href="http://minglr.info" className="btn darkgray">Go back to the landing page</a>
                </div>
            </div>;
    }

    return (
        <div>
            <NavBarOut/>
            {returnThis}
        </div>
    )
}

export default Consent

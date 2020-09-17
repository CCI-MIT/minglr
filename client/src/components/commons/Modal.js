import React from 'react';

function Modal(props) {

    const { mode, handleCancel, handleProceed, handleCancelConfirm, handleFinishConfirm } = props;
    const canProceed = localStorage.getItem("room") ? "btn" : "btn disabled";
    const name = localStorage.getItem("name");
    const isName = name ? "with " + name : "";

    let returnThis = "";
    if (mode === "cancelled") {
        returnThis = <>
            <b>{name}</b>&nbsp; has cancelled the talk.
            <span className="btn" onClick={handleCancelConfirm}>OK</span>
        </>
    }
    else if (mode === "modal") {
        returnThis = <>
            You've been matched {isName}: <br/>
            <span className={canProceed} onClick={handleProceed}>Click to PROCEED</span>
            <span className="btn lightgray" onClick={handleCancel}>Click to CANCEL</span>
            <audio id="audio" src="/sounds/alarm_matched.mp3" type="audio/mp3" autoPlay={true}></audio>
        </>
    }
    else if (mode === "finished") {
        returnThis = <>
            <div>Call {isName} finished.</div>
            <span className="btn" onClick={handleFinishConfirm}>OK</span>
        </>
    }
    else if (mode === "waiting") {
        returnThis = <>
            <div>Waiting for the call {isName}...</div>
            <span className="btn lightgray" onClick={handleCancel}>Click to CANCEL</span>
        </>
    }

    return(
        <div className="container modal">
            {returnThis}
        </div>
    )
}

export default Modal;
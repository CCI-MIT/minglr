import React from 'react';
import { withAlert } from 'react-alert'
import axios from "axios";

import Approach from "../containers/Approach";
import Greet from "../containers/Greet";
import NavBar from "../commons/NavBar";
import Loader from "../commons/Loader";
import Modal from "../commons/Modal";
import {Link} from "react-router-dom";

const io = require('socket.io-client');

class Group extends React.Component {

    count = 0;
    socket = null;
    _isWaiting = false;
    _isMounted = false;
    _isFinished = false;
    api = null;

    constructor(props) {
        super(props);

        this.handleProceed = this.handleProceed.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleCancelConfirm = this.handleCancelConfirm.bind(this);
        this.handleFinish = this.handleFinish.bind(this);
        this.handleFinishConfirm = this.handleFinishConfirm.bind(this);
        this.showJoinCall = this.showJoinCall.bind(this);
        this.handleEndCallOutsideJitsi = this.handleEndCallOutsideJitsi.bind(this);

        this.jitsiContainer = React.createRef();

        this.state = {
            loading: true,
            loadingCall: false,
            groupName: '',
            mode: localStorage.getItem("mode") || "",
        };
    }
    startConference = () => {
        try {
            const domain = 'meet.jit.si';

            const options = {
                roomName: localStorage.getItem("room"),
                height: 500,
                parentNode: this.jitsiContainer.current,
                interfaceConfigOverwrite: {
                    filmStripOnly: false,
                    MOBILE_APP_PROMO: false,
                    HIDE_INVITE_MORE_HEADER: true,
                    SHOW_CHROME_EXTENSION_BANNER: false,
                    DISPLAY_WELCOME_PAGE_CONTENT: false,
                    DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
                },
                configOverwrite: {
                    disableSimulcast: false,
                    disableDeepLinking: true,
                    useStunTurn: true,
                    prejoinPageEnabled: false,
                },
            };

            const { currentUser } = this.props;



            this.api = new window.JitsiMeetExternalAPI(domain, options);

            // add listener 
            this.api.addEventListener('videoConferenceJoined', () => {
                this.setState(prevState => ({
                    ...prevState,
                    loadingCall: false,
                }), () => {
                    axios.get("/api/calling");
                    let myName = currentUser.firstname + " " + currentUser.lastname;
                    this.api.executeCommand('displayName', myName);
                });
            });
            this.api.addEventListener("participantLeft", async () => {
                console.log("participantLeft")
                this.handleFinish();
            });
            this.api.addEventListener("videoConferenceLeft", async () => {
                console.log("videoConferenceLeft");
                this.handleFinish();
            });


        } catch (err) { console.error(err); }


    }
    handleEndCallOutsideJitsi = async()=>{
        //this.api.
        this.api.executeCommand('hangup');
        //this.handleFinish();
    }

    handleProceed = async () => {
        localStorage.setItem("mode", "call");
        const name = localStorage.getItem("name");
        this.setState(prevState => ({
            ...prevState,
            loadingCall: true,
            callName: name,
            mode: "call"
        }), () => {
            this.startConference();
        });

        await axios.get("/api/proceed");
    }

    // finisher
    handleFinish = () => {
        console.log("handleFinish")

        if (!this._isFinished) {
            this._isFinished = true;
            
            axios.get("/api/finish").then(() => {
                this._isFinished = false;
            });

            // update localstorage
            localStorage.setItem("mode", "finished")
            localStorage.setItem("room", "")

            if (this.api) this.api.dispose();

            // update state
            this.setState(prevState => ({
                ...prevState,
                mode: "finished"
            }));
        }
    }

    // finishee
    handleFinishConfirm = () => {
        console.log("handleFinishConfirm")

        // update localstorage
        localStorage.setItem("mode", "")
        localStorage.setItem("name", "")
        
        // update state
        this.setState(prevState => ({
            ...prevState,
            mode: "",
        }));
    }

    // canceller
    handleCancel = async () => {
        const { mode } = this.state;
        if ((mode === "modal" || mode === "waiting") && !this._isWaiting) {
            this._isWaiting = true;
            await axios.get("/api/cancel").then(response => {
                console.log(response);

                // update localstorage
                localStorage.setItem("mode", "")
                localStorage.setItem("room", "")

                // update state
                this.setState(prevState => ({
                    ...prevState,
                    mode: "",
                }));
                this._isWaiting = false;
            })
        }
    }

    // cancellee
    handleCancelConfirm = async () => {
        const { mode } = this.state;
        if (mode === "cancelled" || mode === "call") {
            await axios.get("/api/cancel_confirm").then(response => {
                console.log(response);

                // update localstorage
                localStorage.setItem("mode", "")
                localStorage.setItem("room", "")
                localStorage.setItem("name", "")

                // update state
                this.setState(prevState => ({
                    ...prevState,
                    mode: "",
                }));
            })
        }
    }

    showJoinCall= (data) => {
        //console.log("RECEIVED A joinCall");

        localStorage.setItem("name", data.name);
        localStorage.setItem("room", data.room);
        localStorage.setItem("mode", "modal");

        this.setState(prevState => ({
            ...prevState,
            mode: "modal",
        }));

        // click on approach tab
        document.getElementById("tab-1").checked = true;
        document.getElementById("tab-2").checked = false;
    }

    componentWillUnmount() {
        this._isMounted = false;

        this.socket.removeAllListeners();
        this.socket.disconnect();
        localStorage.setItem("mode", "");
        this.setState(prevState => ({
            ...prevState,
            mode: "",
        }))


    }

    authGroup = async () => {
        await axios.get(`/api/group/${this.props.match.params.id}`).then(response => {
            if (response.data.success) {
                this.socket = io.connect(`/group${this.props.match.params.id}`);
                this.handleConnection();

                this.setState(prevState => ({
                    ...prevState,
                    loading: false,
                    groupName : response.data.groupName
                }));
            }
            else {
                alert(response.data.message);
                this.props.history.push("/home");
            }
        });
    }

    handleConnection = () => {
        const { alert } = this.props;

        this.socket.on("reconnect", () => {
            alert.show("Successfully reconnected");
        })

        this.socket.on("clientDisconnect", () => {
            this.count += 1;
            console.log("disconnected", this.count);
            if (this.count === 1) {
                //alert.show('Disconnected. Please refresh your browser if it does not reconnect automatically.')
                window.location.reload();
            }
            else if (this.count === 4) {
                this.count = 0;
            }
        });

        this.socket.on("finishCall", async () => {
            // call -> finished
            this.handleFinish();
        })

        this.socket.on("cancelled", () => {
            // waiting -> cancelled
            console.log("cancelled")

            localStorage.setItem("mode", "cancelled")
            localStorage.setItem("room", "")

            this.setState(prevState => ({
                ...prevState,
                mode: "cancelled"
            }));
        })

        this.socket.on("createCall", () => {
            // waiting -> call
            // modal -> call
            console.log("createCall")
            const { mode } = this.state;
            const name = localStorage.getItem("name");

            try {
                if (mode !== "call" && window.JitsiMeetExternalAPI) {
                    this.setState(prevState => ({
                        ...prevState,
                        loadingCall: true,
                        mode: "call",
                        callName: name
                    }), () => {
                        this.startConference();
                    });
                }

            } catch (err) {console.error(err)}
        });

        this.socket.on("waitCall", data => {
            // accept request -> waiting
            //console.log("GOT A WAITCALL”")
            //console.log(data);
            const { mode } = this.state;
            try {
                if (mode !== "waiting") {
                    localStorage.setItem("name", data.name);
                    localStorage.setItem("room", data.room);
                    localStorage.setItem("mode", "waiting");

                    this.setState(prevState => ({
                        ...prevState,
                        mode: "waiting",
                    }));

                    // click on approach tab
                    document.getElementById("tab-1").checked = true;
                    document.getElementById("tab-2").checked = false;
                }
                else alert.show('Please wait for a minute');

            } catch (err) {console.error(err)}
        });
    }

    componentDidMount() {
        this._isMounted = true;

        const { mode } = this.state;

        if (this._isMounted) {

            window.addEventListener("beforeunload", async function (e) {
                // Cancel the event
                e.preventDefault();
                // Chrome requires returnValue to be set
                e.returnValue = '';
    
                await axios.get("/api/unavailable");
            });

            this.authGroup();

            console.log(this.jitsiContainer);
            const name = localStorage.getItem("name");
            this.setState({callName: name})
            if (mode === "call") {//???
                this.startConference();
            }
        }
        //register before unload event on MOUNT
        window.addEventListener("beforeunload", async function (e) {
            // Cancel the event
            e.preventDefault();
            // Chrome requires returnValue to be set
            e.returnValue = '';

            localStorage.setItem("mode", "")
            localStorage.setItem("name", "")

            if (this.api) {
                this.api.executeCommand('hangup');
                this.handleFinish();
            }

            await axios.get("/api/unavailable");
        });
    }

    render () {
        const { loading, loadingCall, mode, callName } = this.state;
        let returnThis = ""

        //console.log(this.state);

        if (mode === "cancelled") {
            // show modal to inform that the request got canceled
            returnThis = <Modal mode={mode} handleCancelConfirm={this.handleCancelConfirm}/>
        }
        else if (mode === "finished") {
            // show modal to inform that the call got finished
            returnThis = <Modal mode={mode} handleFinishConfirm={this.handleFinishConfirm}/>
        }
        else if (mode === "waiting") {
            // waiting for the counterpart to proceed/cancel
            returnThis = <Modal mode={mode} handleCancel={this.handleCancel}/>
        }
        else if (mode === "modal") {
            // show modal to give choice of proceed/cancel
            returnThis = <Modal mode={mode} handleProceed={this.handleProceed} handleCancel={this.handleCancel} />
        }

        return (
            <div>
                <NavBar {...this.props}/>
                {loading ? 
                    <Loader />
                    :
                    <>
                        <div style={{display:'flex', position: 'relative', marginTop: '20px',alignItems:'center', justifyContent: 'center'}}>
                            <h2 style={{margin:'auto'}}>{this.state.groupName}</h2>
                        </div>
                        <main className="tabPanel-widget">
                            <label className="mobile-nav" htmlFor="tab-1" tabIndex="0"></label>
                            <input className="mobile-nav" id="tab-1" type="radio" name="tabs" defaultChecked aria-hidden="true"/>

                            <h2 className="mobile-nav">
                                {mode === "call" ? "You're on a call" : "I'd like to talk to"}
                            </h2>
                            {mode === "call" ? null : <h3 className="mobile-nav">Auto refresh is on</h3> }


                            <div className="approach">
                                {returnThis}
                                <div className={mode === "call" ? "jitsi" : "jitsi hidden"}>
                                    <strong className="jitsi-loader">{loadingCall ? <div>Waiting for the other...<Loader /></div> : ""}</strong>
                                    {(!loadingCall )? (<div>Talking to : {callName}</div>):(null)}
                                    <div className="jitsi-container" ref={this.jitsiContainer}></div>
                                    <div style={{display: "flex",
                                        alignItems: "flex-end",
                                        flexDirection: "column"}}><button class="btn" onClick={this.handleEndCallOutsideJitsi}>End call</button></div>
                                </div>
                                <Approach {...this.props} showJoinCall={this.showJoinCall} socket={this.socket}/>
                            </div>

                            <label className="mobile-nav" htmlFor="tab-2" tabIndex="0"></label>
                            <input className="mobile-nav" id="tab-2" type="radio" name="tabs" aria-hidden="true"/>
                            <h2 className="mobile-nav" >People who want to talk to you</h2>

                            <Greet {...this.props} clickDisabled={mode.length > 0} socket={this.socket}/>
                        </main>
                        <div style={{display:'flex', position: 'relative', marginBottom: '20px',marginRight: '40px',alignItems:'flex-end', justifyContent: 'flex-end'}}>
                            <div>
                                <Link to="/termsofuse"> Terms of use</Link>
                            </div>
                        </div>
                    </>
                }
            </div>
        );
    }
}

export default withAlert()(Group)
